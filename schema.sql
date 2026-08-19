-- ============================================================
--  NUESTRAS PRÓXIMAS LECTURAS — esquema Supabase
--  Ejecutar completo en: Supabase → SQL Editor → New query
-- ============================================================

-- ------------------------------------------------------------
-- 1. PLANTILLA DE PREGUNTAS (reutilizable entre corridas)
-- ------------------------------------------------------------
create table if not exists pulso_preguntas (
  id          uuid primary key default gen_random_uuid(),
  orden       int  not null unique,
  tipo        text not null,
  enunciado   text not null,
  ayuda       text,
  config      jsonb not null default '{}'::jsonb,
  creada_en   timestamptz not null default now()
);

comment on column pulso_preguntas.tipo is
  'palabra_unica | dilema_binario | seleccion_multiple | coordenada_2d | reparto_puntos | opcion_unica | parrafo';

-- ------------------------------------------------------------
-- 2. CORRIDAS (cada ejecución en vivo del pulso)
-- ------------------------------------------------------------
create table if not exists pulso_corridas (
  id             uuid primary key default gen_random_uuid(),
  nombre         text not null,
  indice_activo  int  not null default 1,
  estado         text not null default 'en_vivo',
  creada_en      timestamptz not null default now(),
  cerrada_en     timestamptz
);

comment on column pulso_corridas.estado is 'en_vivo | finalizada | archivada';
comment on column pulso_corridas.indice_activo is
  'orden de la pregunta activa. Las de orden menor están cerradas. Si supera el total, la ronda terminó.';

create index if not exists idx_corridas_estado on pulso_corridas(estado);

-- ------------------------------------------------------------
-- 3. PARTICIPANTES (una vez por persona por corrida)
-- ------------------------------------------------------------
create table if not exists pulso_participantes (
  id          uuid primary key default gen_random_uuid(),
  corrida_id  uuid not null references pulso_corridas(id) on delete cascade,
  dispositivo text not null,
  nombre      text,
  es_anonimo  boolean not null default false,
  avatar      int not null default 0,
  creado_en   timestamptz not null default now(),
  unique (corrida_id, dispositivo)
);

-- El nombre nunca se guarda si la persona eligió el anonimato.
create or replace function fn_participante_previo()
returns trigger language plpgsql as $$
begin
  if new.es_anonimo then
    new.nombre := null;
  end if;
  select coalesce(count(*), 0) % 15 into new.avatar
    from pulso_participantes where corrida_id = new.corrida_id;
  return new;
end $$;

drop trigger if exists trg_participante_previo on pulso_participantes;
create trigger trg_participante_previo
  before insert on pulso_participantes
  for each row execute function fn_participante_previo();

-- ------------------------------------------------------------
-- 4. RESPUESTAS
-- ------------------------------------------------------------
create table if not exists pulso_respuestas (
  id          uuid primary key default gen_random_uuid(),
  corrida_id  uuid not null references pulso_corridas(id) on delete cascade,
  pregunta_id uuid not null references pulso_preguntas(id) on delete cascade,
  dispositivo text not null,
  valor       jsonb not null,
  creada_en   timestamptz not null default now(),
  unique (corrida_id, pregunta_id, dispositivo)
);

create index if not exists idx_respuestas_corrida on pulso_respuestas(corrida_id, pregunta_id);

-- ------------------------------------------------------------
-- 5. CONTADORES (permiten la barra en vivo sin exponer respuestas)
-- ------------------------------------------------------------
create table if not exists pulso_conteos (
  corrida_id  uuid not null references pulso_corridas(id) on delete cascade,
  pregunta_id uuid not null references pulso_preguntas(id) on delete cascade,
  total       int  not null default 0,
  primary key (corrida_id, pregunta_id)
);

create or replace function fn_sumar_conteo()
returns trigger language plpgsql security definer as $$
begin
  insert into pulso_conteos (corrida_id, pregunta_id, total)
  values (new.corrida_id, new.pregunta_id, 1)
  on conflict (corrida_id, pregunta_id)
  do update set total = pulso_conteos.total + 1;
  return new;
end $$;

drop trigger if exists trg_sumar_conteo on pulso_respuestas;
create trigger trg_sumar_conteo
  after insert on pulso_respuestas
  for each row execute function fn_sumar_conteo();

-- ------------------------------------------------------------
-- 6. HISTÓRICO (solo lo ve el administrador)
-- ------------------------------------------------------------
create table if not exists pulso_historico (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  corrida_id  uuid,
  datos       jsonb not null,
  guardado_en timestamptz not null default now()
);

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================
alter table pulso_preguntas     enable row level security;
alter table pulso_corridas      enable row level security;
alter table pulso_participantes enable row level security;
alter table pulso_respuestas    enable row level security;
alter table pulso_conteos       enable row level security;
alter table pulso_historico     enable row level security;

-- --- Preguntas: cualquiera lee, solo el admin escribe -------
drop policy if exists p_preguntas_lectura on pulso_preguntas;
create policy p_preguntas_lectura on pulso_preguntas
  for select using (true);

drop policy if exists p_preguntas_admin on pulso_preguntas;
create policy p_preguntas_admin on pulso_preguntas
  for all to authenticated using (true) with check (true);

-- --- Corridas: cualquiera lee, solo el admin escribe --------
drop policy if exists p_corridas_lectura on pulso_corridas;
create policy p_corridas_lectura on pulso_corridas
  for select using (true);

drop policy if exists p_corridas_admin on pulso_corridas;
create policy p_corridas_admin on pulso_corridas
  for all to authenticated using (true) with check (true);

-- --- Participantes: lectura abierta (el nombre de quien pidió
--     anonimato ya viene en null desde el trigger) -----------
drop policy if exists p_participantes_lectura on pulso_participantes;
create policy p_participantes_lectura on pulso_participantes
  for select using (true);

drop policy if exists p_participantes_alta on pulso_participantes;
create policy p_participantes_alta on pulso_participantes
  for insert with check (
    exists (select 1 from pulso_corridas c
            where c.id = corrida_id and c.estado = 'en_vivo')
  );

-- --- Respuestas: solo se puede responder LA pregunta activa --
drop policy if exists p_respuestas_alta on pulso_respuestas;
create policy p_respuestas_alta on pulso_respuestas
  for insert with check (
    exists (
      select 1
        from pulso_corridas c
        join pulso_preguntas p on p.id = pregunta_id
       where c.id = corrida_id
         and c.estado = 'en_vivo'
         and p.orden = c.indice_activo
    )
  );

-- --- Respuestas: solo se leen las de preguntas YA cerradas ---
drop policy if exists p_respuestas_lectura on pulso_respuestas;
create policy p_respuestas_lectura on pulso_respuestas
  for select using (
    exists (
      select 1
        from pulso_corridas c
        join pulso_preguntas p on p.id = pulso_respuestas.pregunta_id
       where c.id = pulso_respuestas.corrida_id
         and p.orden < c.indice_activo
    )
  );

drop policy if exists p_respuestas_admin on pulso_respuestas;
create policy p_respuestas_admin on pulso_respuestas
  for select to authenticated using (true);

drop policy if exists p_respuestas_borrar on pulso_respuestas;
create policy p_respuestas_borrar on pulso_respuestas
  for delete to authenticated using (true);

-- --- Conteos: lectura abierta, escritura solo vía trigger ----
drop policy if exists p_conteos_lectura on pulso_conteos;
create policy p_conteos_lectura on pulso_conteos
  for select using (true);

drop policy if exists p_conteos_admin on pulso_conteos;
create policy p_conteos_admin on pulso_conteos
  for all to authenticated using (true) with check (true);

-- --- Histórico: exclusivo del administrador ------------------
drop policy if exists p_historico_admin on pulso_historico;
create policy p_historico_admin on pulso_historico
  for all to authenticated using (true) with check (true);

-- ============================================================
--  REALTIME
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array['pulso_corridas','pulso_conteos','pulso_participantes'] loop
    begin
      execute format('alter publication supabase_realtime add table %I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;

-- ============================================================
--  SEMILLA: las 7 preguntas del primer pulso
-- ============================================================
-- CUIDADO: esta línea borra las preguntas y, en cascada, las respuestas
-- asociadas. Si ya corriste un pulso y quieres conservarlo, guárdalo primero
-- desde el panel (queda en pulso_historico) o comenta este bloque de semilla.
delete from pulso_preguntas;

insert into pulso_preguntas (orden, tipo, enunciado, ayuda, config) values

(1, 'palabra_unica',
 'Una palabra para el ánimo con el que llegas al próximo libro.',
 'Una sola palabra. La primera que se te venga.',
 '{"max_caracteres": 20}'),

(2, 'dilema_binario',
 '¿Prefieres que un libro te mueva más las emociones o el pensamiento?',
 'No hay punto medio. Elige uno.',
 '{"opciones": ["Las emociones", "El pensamiento"]}'),

(3, 'seleccion_multiple',
 '¿En qué etapa quieres encontrar a los personajes del próximo libro?',
 'Elige máximo dos.',
 '{"max_selecciones": 2, "opciones": ["En la infancia", "Al final de su vida", "A punto de caer", "Regresando", "Antes del adiós"]}'),

(4, 'coordenada_2d',
 'Ubica el próximo libro en este plano.',
 'No hay respuesta correcta. Toca donde te den ganas de estar el próximo mes.',
 '{"eje_x": {"izquierda": "Íntimo", "derecha": "Coral", "glosa_izquierda": "Pocas voces, un mundo pequeño, la vida puertas adentro.", "glosa_derecha": "Muchas voces, un pueblo o una familia entera, la historia se reparte."}, "eje_y": {"arriba": "Luminoso", "abajo": "Oscuro", "glosa_arriba": "Algo se salva, se puede respirar, hay ternura.", "glosa_abajo": "La incomodidad se sostiene, nadie viene a rescatar a nadie."}}'),

(5, 'reparto_puntos',
 'Tienes 10 puntos. Repártelos entre lo que quieres que te pase leyendo.',
 'Reparte los 10 completos. Puedes dejar opciones en cero.',
 '{"total": 10, "opciones": ["Reírme", "Entender algo de mi propia vida", "Sentir algo que había olvidado", "Asombrarme", "Estar en otro lugar"]}'),

(6, 'opcion_unica',
 '¿De dónde quieres que venga la próxima voz?',
 null,
 '{"opciones": ["De acá cerquita", "Del resto de América Latina", "De otra lengua", "De las antípodas"]}'),

(7, 'parrafo',
 'Si le quisieras regalar a este club un libro del que has estado enamorada o enamorado, ¿cuál sería y qué nos dirías para enamorarnos a todos?',
 'Escribe lo que necesites. Nadie te va a cortar.',
 '{"campo_titulo": "Título y autor", "campo_texto": "¿Por qué nos vamos a enamorar?"}');

-- ============================================================
--  Primera corrida lista para arrancar
-- ============================================================
insert into pulso_corridas (nombre, indice_activo, estado)
select 'Pulso de lectura ' || to_char(now(), 'DD-MM-YYYY'), 1, 'en_vivo'
where not exists (
  select 1 from pulso_corridas where estado in ('en_vivo', 'finalizada')
);
