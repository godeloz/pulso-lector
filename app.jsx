const { useState, useEffect, useRef, useCallback } = React;

/* ============================================================
   CLIENTE Y UTILIDADES
   ============================================================ */

const LLAVE = CONFIG.SUPABASE_PUBLISHABLE_KEY || CONFIG.SUPABASE_ANON_KEY;

let sb;
try {
  sb = supabase.createClient(CONFIG.SUPABASE_URL, LLAVE);
} catch (e) {
  if (window.__pintarError) {
    window.__pintarError("No se pudo conectar con Supabase",
      e.message + "\n\nRevisa que SUPABASE_URL en config.js sea la dirección completa, con https://");
  }
  throw e;
}

const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};

function idDispositivo() {
  let id = LS.get("pulso_dispositivo", null);
  if (!id) {
    id = "d-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    LS.set("pulso_dispositivo", id);
  }
  return id;
}

const DISPOSITIVO = idDispositivo();

const PALETA = ["#4C8577", "#B77A46", "#7C9FC2", "#D98CA0", "#DDAE45", "#7FA98B", "#E2593F", "#C9962F"];
const COLORES_AVE = ["#4C8577", "#B77A46", "#7C9FC2"];

const ROMANOS = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function fechaLegible(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });
}

/* ============================================================
   AVATARES — 15 aves en ciclo no repetitivo
   ============================================================ */

function Ave({ i = 0, size = 28 }) {
  const forma = ((i % 15) + 15) % 15 % 5;
  const color = COLORES_AVE[Math.floor((((i % 15) + 15) % 15) / 5) % 3];
  const cuerpos = [
    <g key="0">
      <ellipse cx="10.5" cy="14" rx="6.5" ry="5.6" />
      <circle cx="15.5" cy="8.6" r="3.9" />
      <path d="M18.8 7.6 L23 8.9 L18.8 10.2 Z" />
      <path d="M4.6 12.4 L1 9.6 L4 15.6 Z" />
    </g>,
    <g key="1">
      <path d="M1.5 15.5 Q7.5 6.5 12 12.8 Q16.5 6.5 22.5 15.5 Q16.5 12.2 12 16.4 Q7.5 12.2 1.5 15.5 Z" />
    </g>,
    <g key="2">
      <ellipse cx="12" cy="12" rx="5.2" ry="4.3" />
      <circle cx="15.8" cy="8.4" r="3.1" />
      <path d="M18.4 7.6 L23.5 8.6 L18.4 9.8 Z" />
      <path d="M7.6 13.6 L1.5 20.5 L4.4 20.8 L9.4 15.4 Z" />
    </g>,
    <g key="3">
      <ellipse cx="11" cy="11" rx="6" ry="4.4" />
      <circle cx="16" cy="7.4" r="3" />
      <path d="M18.6 6.8 L23 7.8 L18.6 8.9 Z" />
      <rect x="8.4" y="14.4" width="1.5" height="7.4" rx=".7" />
      <rect x="12.6" y="14.4" width="1.5" height="7.4" rx=".7" />
    </g>,
    <g key="4">
      <ellipse cx="12" cy="14" rx="7" ry="6.6" />
      <path d="M6.4 8.6 L5 3.6 L9.6 6.6 Z" />
      <path d="M17.6 8.6 L19 3.6 L14.4 6.6 Z" />
      <circle cx="9.4" cy="12.4" r="1.6" fill="#FFFDF7" />
      <circle cx="14.6" cy="12.4" r="1.6" fill="#FFFDF7" />
    </g>,
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}
         style={{ flexShrink: 0, display: "block" }} aria-hidden="true">
      {cuerpos[forma]}
    </svg>
  );
}

function colorAve(i) {
  return COLORES_AVE[Math.floor((((i % 15) + 15) % 15) / 5) % 3];
}

/* ============================================================
   CONTADOR EN VIVO
   ============================================================ */

function Contador({ total }) {
  return (
    <div className="contador">
      <span className="contador-num">{total}</span>
      <span className="contador-txt">{total === 1 ? "respuesta" : "respuestas"}</span>
      <span className="pista"><i /></span>
    </div>
  );
}

/* ============================================================
   CONTROLES POR TIPO DE PREGUNTA
   ============================================================ */

function ControlPalabra({ cfg, valor, setValor }) {
  const max = cfg.max_caracteres || 20;
  return (
    <div>
      <input
        className="campo"
        style={{ fontFamily: "var(--display)", fontSize: "1.4rem", textAlign: "center" }}
        value={valor || ""}
        maxLength={max}
        autoComplete="off"
        placeholder="Una palabra"
        onChange={(e) => setValor(e.target.value.replace(/\s+/g, " ").trimStart())}
      />
      <div style={{ fontSize: ".8rem", color: "var(--tenue)", textAlign: "right", marginTop: 6 }}>
        {(valor || "").length}/{max}
      </div>
    </div>
  );
}

function ControlDilema({ cfg, valor, setValor }) {
  return (
    <div className="dilema">
      {cfg.opciones.map((o) => (
        <button key={o} className={valor === o ? "sel" : ""} onClick={() => setValor(o)}
                aria-pressed={valor === o}>{o}</button>
      ))}
    </div>
  );
}

function ControlOpcionUnica({ cfg, valor, setValor }) {
  return (
    <div className="ops">
      {cfg.opciones.map((o) => (
        <button key={o} className={"op" + (valor === o ? " sel" : "")} onClick={() => setValor(o)}
                aria-pressed={valor === o}>
          <span className="marca" /><span>{o}</span>
        </button>
      ))}
    </div>
  );
}

function ControlMultiple({ cfg, valor, setValor }) {
  const sel = valor || [];
  const max = cfg.max_selecciones || 2;
  const alternar = (o) => {
    if (sel.includes(o)) setValor(sel.filter((x) => x !== o));
    else if (sel.length < max) setValor([...sel, o]);
  };
  return (
    <div>
      <div className="ops">
        {cfg.opciones.map((o) => {
          const activa = sel.includes(o);
          const bloq = !activa && sel.length >= max;
          return (
            <button key={o} className={"op cuad" + (activa ? " sel" : "") + (bloq ? " bloq" : "")}
                    onClick={() => alternar(o)} aria-pressed={activa}>
              <span className="marca" /><span>{o}</span>
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: ".84rem", color: "var(--tenue)", marginTop: 10, textAlign: "right" }}>
        {sel.length} de {max}
      </div>
    </div>
  );
}

function ControlPlano({ cfg, valor, setValor }) {
  const caja = useRef(null);
  const marcar = (e) => {
    const r = caja.current.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    const x = Math.min(1, Math.max(-1, ((p.clientX - r.left) / r.width) * 2 - 1));
    const y = Math.min(1, Math.max(-1, 1 - ((p.clientY - r.top) / r.height) * 2));
    setValor({ x: +x.toFixed(3), y: +y.toFixed(3) });
  };
  const ex = cfg.eje_x, ey = cfg.eje_y;
  return (
    <div>
      <div className="plano" ref={caja} onClick={marcar} onTouchStart={marcar} onTouchMove={marcar}
           role="application" aria-label="Plano de dos ejes. Toca para ubicar tu respuesta.">
        <span className="ejeh" /><span className="ejev" />
        <span className="rot" style={{ left: 12, top: "50%", transform: "translateY(-50%)" }}>{ex.izquierda}</span>
        <span className="rot" style={{ right: 12, top: "50%", transform: "translateY(-50%)" }}>{ex.derecha}</span>
        <span className="rot" style={{ top: 12, left: "50%", transform: "translateX(-50%)" }}>{ey.arriba}</span>
        <span className="rot" style={{ bottom: 12, left: "50%", transform: "translateX(-50%)" }}>{ey.abajo}</span>
        {valor && (
          <span className="marcador"
                style={{ left: `${((valor.x + 1) / 2) * 100}%`, top: `${((1 - valor.y) / 2) * 100}%` }} />
        )}
      </div>
      <div className="glosas">
        <div className="glosa"><b>{ex.izquierda}:</b> {ex.glosa_izquierda}</div>
        <div className="glosa"><b>{ex.derecha}:</b> {ex.glosa_derecha}</div>
        <div className="glosa"><b>{ey.arriba}:</b> {ey.glosa_arriba}</div>
        <div className="glosa"><b>{ey.abajo}:</b> {ey.glosa_abajo}</div>
      </div>
    </div>
  );
}

function ControlReparto({ cfg, valor, setValor }) {
  const total = cfg.total || 10;
  const v = valor || cfg.opciones.reduce((a, o) => ({ ...a, [o]: 0 }), {});
  const usado = Object.values(v).reduce((a, b) => a + b, 0);
  const resto = total - usado;
  const mover = (o, d) => {
    const n = Math.max(0, (v[o] || 0) + d);
    if (d > 0 && resto <= 0) return;
    setValor({ ...v, [o]: n });
  };
  return (
    <div>
      <div className="rep-resto">
        <span style={{ fontSize: ".9rem" }}>{resto === 0 ? "Ya repartiste todo" : "Puntos por repartir"}</span>
        <b style={{ color: resto === 0 ? "var(--teal)" : "var(--verde-oscuro)" }}>{resto}</b>
      </div>
      {cfg.opciones.map((o) => (
        <div className="rep-fila" key={o}>
          <span className="rep-nom">{o}</span>
          <span className="rep-ctrl">
            <button className="rep-btn" onClick={() => mover(o, -1)} disabled={!v[o]}
                    aria-label={"Quitar un punto a " + o}>−</button>
            <span className="rep-val">{v[o] || 0}</span>
            <button className="rep-btn" onClick={() => mover(o, 1)} disabled={resto <= 0}
                    aria-label={"Sumar un punto a " + o}>+</button>
          </span>
        </div>
      ))}
    </div>
  );
}

function ControlParrafo({ cfg, valor, setValor }) {
  const v = valor || { titulo: "", texto: "" };
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <input className="campo" placeholder={cfg.campo_titulo || "Título"} value={v.titulo}
             onChange={(e) => setValor({ ...v, titulo: e.target.value })} />
      <textarea className="campo" placeholder={cfg.campo_texto || "Cuéntanos"} value={v.texto}
                onChange={(e) => setValor({ ...v, texto: e.target.value })} />
    </div>
  );
}

const CONTROLES = {
  palabra_unica: ControlPalabra,
  dilema_binario: ControlDilema,
  opcion_unica: ControlOpcionUnica,
  seleccion_multiple: ControlMultiple,
  coordenada_2d: ControlPlano,
  reparto_puntos: ControlReparto,
  parrafo: ControlParrafo,
};

function esValida(tipo, valor, cfg) {
  if (valor === null || valor === undefined) return false;
  switch (tipo) {
    case "palabra_unica": return String(valor).trim().length > 0;
    case "dilema_binario":
    case "opcion_unica": return !!valor;
    case "seleccion_multiple": return Array.isArray(valor) && valor.length > 0;
    case "coordenada_2d": return typeof valor.x === "number";
    case "reparto_puntos":
      return Object.values(valor || {}).reduce((a, b) => a + b, 0) === (cfg.total || 10);
    case "parrafo": return (valor.titulo || "").trim().length > 0 && (valor.texto || "").trim().length > 0;
    default: return false;
  }
}

function mensajeInvalido(tipo, valor, cfg) {
  switch (tipo) {
    case "palabra_unica": return "Escribe una palabra para continuar";
    case "dilema_binario": return "Elige uno de los dos";
    case "opcion_unica": return "Elige una opción";
    case "seleccion_multiple": return "Elige al menos una opción";
    case "coordenada_2d": return "Toca el plano para ubicar tu respuesta";
    case "reparto_puntos": {
      const usado = Object.values(valor || {}).reduce((a, b) => a + b, 0);
      return `Te faltan ${(cfg.total || 10) - usado} puntos por repartir`;
    }
    case "parrafo": return "Completa el título y el texto";
    default: return "Falta completar la respuesta";
  }
}

/* ============================================================
   VISUALIZACIÓN DE RESULTADOS
   ============================================================ */

function ResNube({ respuestas }) {
  const cuenta = {};
  respuestas.forEach((r) => {
    const p = String(r.valor).trim().toLowerCase();
    if (!p) return;
    cuenta[p] = (cuenta[p] || 0) + 1;
  });
  const lista = Object.entries(cuenta).sort((a, b) => b[1] - a[1]);
  if (!lista.length) return <Vacio />;
  const max = lista[0][1];
  return (
    <div className="nube">
      {lista.map(([p, n], i) => (
        <span key={p} title={n + (n === 1 ? " vez" : " veces")}
              style={{
                fontSize: (17 + (n / max) * 30).toFixed(0) + "px",
                color: PALETA[i % PALETA.length],
                fontWeight: n > max / 2 ? 600 : 400,
              }}>{p}</span>
      ))}
    </div>
  );
}

function ResMedidor({ respuestas, cfg }) {
  const [a, b] = cfg.opciones;
  const na = respuestas.filter((r) => r.valor === a).length;
  const nb = respuestas.filter((r) => r.valor === b).length;
  const t = na + nb;
  if (!t) return <Vacio />;
  const pa = Math.round((na / t) * 100);
  return (
    <div>
      <div className="medidor">
        <div style={{ flexGrow: Math.max(na, 0.12), background: "var(--teal)", color: "#F7F4EC" }}>{pa}%</div>
        <div style={{ flexGrow: Math.max(nb, 0.12), background: "var(--terracota)", color: "#FFFDF7" }}>{100 - pa}%</div>
      </div>
      <div className="medidor-pies">
        <span><b style={{ color: "var(--teal)" }}>■</b> {a} · {na}</span>
        <span style={{ textAlign: "right" }}>{b} · {nb} <b style={{ color: "var(--terracota)" }}>■</b></span>
      </div>
    </div>
  );
}

function ResBarras({ respuestas, cfg, multiple }) {
  const cuenta = {};
  cfg.opciones.forEach((o) => (cuenta[o] = 0));
  respuestas.forEach((r) => {
    const vs = multiple ? r.valor : [r.valor];
    (vs || []).forEach((v) => { if (cuenta[v] !== undefined) cuenta[v]++; });
  });
  const lista = Object.entries(cuenta).sort((a, b) => b[1] - a[1]);
  const total = respuestas.length;
  if (!total) return <Vacio />;
  const max = Math.max(...lista.map((x) => x[1]), 1);

  let duplas = null;
  if (multiple) {
    const c = {};
    respuestas.forEach((r) => {
      if (Array.isArray(r.valor) && r.valor.length === 2) {
        const k = [...r.valor].sort().join(" + ");
        c[k] = (c[k] || 0) + 1;
      }
    });
    const top = Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 2).filter((x) => x[1] > 1);
    if (top.length) duplas = top;
  }

  return (
    <div>
      {lista.map(([o, n], i) => (
        <div className="barra-fila" key={o}>
          <div className="barra-top">
            <span>{o}</span>
            <b>{n} · {Math.round((n / total) * 100)}%</b>
          </div>
          <div className="barra">
            <i style={{ width: (n / max) * 100 + "%", background: PALETA[i % PALETA.length] }} />
          </div>
        </div>
      ))}
      {duplas && (
        <div style={{ fontSize: ".86rem", color: "var(--tenue)", marginTop: 14 }}>
          Duplas más elegidas: {duplas.map(([k, n]) => `${k} (${n})`).join(" · ")}
        </div>
      )}
    </div>
  );
}

function ResDispersion({ respuestas, cfg, participantes }) {
  if (!respuestas.length) return <Vacio />;
  const ex = cfg.eje_x, ey = cfg.eje_y;
  const px = respuestas.reduce((a, r) => a + r.valor.x, 0) / respuestas.length;
  const py = respuestas.reduce((a, r) => a + r.valor.y, 0) / respuestas.length;
  const cuad = (r) => (r.valor.y >= 0 ? (r.valor.x < 0 ? "íntimo y luminoso" : "coral y luminoso")
                                      : (r.valor.x < 0 ? "íntimo y oscuro" : "coral y oscuro"));
  const c = {};
  respuestas.forEach((r) => { const k = cuad(r); c[k] = (c[k] || 0) + 1; });
  const dom = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
  return (
    <div>
      <div className="disp">
        <span style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: "var(--linea)" }} />
        <span style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, background: "var(--linea)" }} />
        <span className="rot" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: ".7rem", color: "var(--tenue)", textTransform: "uppercase", letterSpacing: ".1em" }}>{ex.izquierda}</span>
        <span className="rot" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: ".7rem", color: "var(--tenue)", textTransform: "uppercase", letterSpacing: ".1em" }}>{ex.derecha}</span>
        <span className="rot" style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", fontSize: ".7rem", color: "var(--tenue)", textTransform: "uppercase", letterSpacing: ".1em" }}>{ey.arriba}</span>
        <span className="rot" style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", fontSize: ".7rem", color: "var(--tenue)", textTransform: "uppercase", letterSpacing: ".1em" }}>{ey.abajo}</span>
        {respuestas.map((r, i) => {
          const p = participantes[r.dispositivo];
          return (
            <span className="pt" key={i}
                  style={{
                    left: `${((r.valor.x + 1) / 2) * 100}%`,
                    top: `${((1 - r.valor.y) / 2) * 100}%`,
                    background: p ? colorAve(p.avatar) : "var(--salvia)",
                  }} />
          );
        })}
        <span style={{
          position: "absolute", left: `${((px + 1) / 2) * 100}%`, top: `${((1 - py) / 2) * 100}%`,
          width: 34, height: 34, borderRadius: "50%", transform: "translate(-50%,-50%)",
          border: "2px dashed var(--coral)", pointerEvents: "none",
        }} />
      </div>
      <div style={{ fontSize: ".86rem", color: "var(--tenue)", marginTop: 12 }}>
        El círculo punteado marca el promedio del grupo.
        {dom && ` La zona más elegida fue ${dom[0]} (${dom[1]} de ${respuestas.length}).`}
      </div>
    </div>
  );
}

function ResReparto({ respuestas, cfg }) {
  if (!respuestas.length) return <Vacio />;
  const sum = {};
  cfg.opciones.forEach((o) => (sum[o] = 0));
  let concentrados = 0;
  respuestas.forEach((r) => {
    let maxv = 0;
    cfg.opciones.forEach((o) => {
      const v = (r.valor && r.valor[o]) || 0;
      sum[o] += v;
      if (v > maxv) maxv = v;
    });
    if (maxv >= 5) concentrados++;
  });
  const lista = Object.entries(sum).sort((a, b) => b[1] - a[1]);
  const totalPuntos = lista.reduce((a, b) => a + b[1], 0) || 1;
  const max = Math.max(...lista.map((x) => x[1]), 1);
  return (
    <div>
      {lista.map(([o, n], i) => (
        <div className="barra-fila" key={o}>
          <div className="barra-top">
            <span>{o}</span>
            <b>{(n / respuestas.length).toFixed(1)} pts · {Math.round((n / totalPuntos) * 100)}%</b>
          </div>
          <div className="barra">
            <i style={{ width: (n / max) * 100 + "%", background: PALETA[i % PALETA.length] }} />
          </div>
        </div>
      ))}
      <div style={{ fontSize: ".86rem", color: "var(--tenue)", marginTop: 14 }}>
        Promedio de puntos por persona. {concentrados} de {respuestas.length}{" "}
        {concentrados === 1 ? "concentró" : "concentraron"} 5 o más puntos en una sola opción.
      </div>
    </div>
  );
}

function Tarjeta({ r, p }) {
  const [abierta, setAbierta] = useState(false);
  const largo = (r.valor.texto || "").length > 260;
  return (
    <div className="tar">
      <div className="tar-cab">
        <Ave i={p ? p.avatar : 0} size={30} />
        <span className="tar-nom">{p && p.nombre ? p.nombre : "Anónimo"}</span>
      </div>
      <div className="tar-tit">{r.valor.titulo}</div>
      <div className={"tar-txt" + (largo && !abierta ? " corta" : "")}>{r.valor.texto}</div>
      {largo && (
        <button className="tar-mas" onClick={() => setAbierta(!abierta)}>
          {abierta ? "Mostrar menos" : "Leer completo"}
        </button>
      )}
    </div>
  );
}

function ResGrid({ respuestas, participantes }) {
  if (!respuestas.length) return <Vacio />;
  return (
    <div className="grid-tar">
      {respuestas.map((r, i) => <Tarjeta key={i} r={r} p={participantes[r.dispositivo]} />)}
    </div>
  );
}

function Vacio() {
  return <div style={{ color: "var(--tenue)", fontSize: ".92rem", padding: "16px 0" }}>Nadie respondió esta pregunta.</div>;
}

function Resultado({ pregunta, respuestas, participantes }) {
  const cfg = pregunta.config || {};
  switch (pregunta.tipo) {
    case "palabra_unica": return <ResNube respuestas={respuestas} />;
    case "dilema_binario": return <ResMedidor respuestas={respuestas} cfg={cfg} />;
    case "opcion_unica": return <ResBarras respuestas={respuestas} cfg={cfg} />;
    case "seleccion_multiple": return <ResBarras respuestas={respuestas} cfg={cfg} multiple />;
    case "coordenada_2d": return <ResDispersion respuestas={respuestas} cfg={cfg} participantes={participantes} />;
    case "reparto_puntos": return <ResReparto respuestas={respuestas} cfg={cfg} />;
    case "parrafo": return <ResGrid respuestas={respuestas} participantes={participantes} />;
    default: return null;
  }
}

function BloqueResultado({ pregunta, respuestas, participantes }) {
  return (
    <div className="res-bloque">
      <div className="res-preg">{pregunta.enunciado}</div>
      <div className="res-meta">Pregunta {ROMANOS[pregunta.orden]} · {respuestas.length}{" "}
        {respuestas.length === 1 ? "respuesta" : "respuestas"}</div>
      <Resultado pregunta={pregunta} respuestas={respuestas} participantes={participantes} />
    </div>
  );
}

/* ============================================================
   PANTALLA DE INGRESO
   ============================================================ */

function Ingreso({ onEntrar }) {
  const [nombre, setNombre] = useState(LS.get("pulso_nombre", ""));
  const [anon, setAnon] = useState(LS.get("pulso_anonimo", false));
  const [err, setErr] = useState("");
  const [cargando, setCargando] = useState(false);

  const entrar = async () => {
    if (!anon && !nombre.trim()) { setErr("Escribe tu nombre o elige responder en anónimo"); return; }
    setErr(""); setCargando(true);
    try { await onEntrar(nombre.trim(), anon); }
    catch (e) { setErr("No pudimos registrarte. Revisa la conexión e inténtalo otra vez."); setCargando(false); }
  };

  return (
    <div className="tarjeta" style={{ marginTop: 10 }}>
      <h2 style={{ fontSize: "1.3rem", marginBottom: 6 }}>Antes de empezar</h2>
      <p style={{ color: "var(--tenue)", fontSize: ".95rem", marginTop: 0, marginBottom: 20 }}>
        {CONFIG.BAJADA}
      </p>

      <label style={{ display: "block", fontSize: ".88rem", fontWeight: 500, marginBottom: 8 }}>
        ¿Cómo te llamas?
      </label>
      <input className="campo" value={nombre} disabled={anon} placeholder={anon ? "Vas a responder en anónimo" : "Tu nombre"}
             onChange={(e) => { setNombre(e.target.value); setErr(""); }}
             style={{ opacity: anon ? .5 : 1 }} />

      <button className={"op cuad" + (anon ? " sel" : "")} style={{ marginTop: 14 }}
              onClick={() => { setAnon(!anon); setErr(""); }} aria-pressed={anon}>
        <span className="marca" />
        <span>Prefiero responder en anónimo</span>
      </button>
      <p style={{ fontSize: ".84rem", color: "var(--tenue)", marginTop: 10 }}>
        Nadie ve las respuestas de los demás hasta que la pregunta se cierra. Si eliges el anonimato,
        tu nombre no se guarda en ningún lado.
      </p>

      {err && <div className="error">{err}</div>}

      <button className="btn" style={{ width: "100%", marginTop: 18 }} onClick={entrar} disabled={cargando}>
        {cargando ? "Entrando…" : "Entrar"}
      </button>
    </div>
  );
}

/* ============================================================
   PREGUNTA ACTIVA
   ============================================================ */

function PreguntaActiva({ pregunta, corrida, conteo, yaRespondio, onEnviar, onVolver, hayCerradas }) {
  const [valor, setValor] = useState(null);
  const [err, setErr] = useState("");
  const [enviando, setEnviando] = useState(false);
  const cfg = pregunta.config || {};
  const Control = CONTROLES[pregunta.tipo];

  useEffect(() => { setValor(null); setErr(""); }, [pregunta.id]);

  const enviar = async () => {
    if (!esValida(pregunta.tipo, valor, cfg)) { setErr(mensajeInvalido(pregunta.tipo, valor, cfg)); return; }
    setErr(""); setEnviando(true);
    try { await onEnviar(pregunta, valor); }
    catch (e) {
      setErr(e && e.code === "23505"
        ? "Ya habías respondido esta pregunta."
        : "No se pudo enviar. Puede que la pregunta ya esté cerrada.");
      setEnviando(false);
    }
  };

  if (yaRespondio) {
    return (
      <div>
        <div className="tarjeta">
          <div className="preg-num">Pregunta {ROMANOS[pregunta.orden]}</div>
          <div className="preg-txt">{pregunta.enunciado}</div>
          <div className="ok" style={{ marginTop: 20 }}>Tu respuesta quedó registrada.</div>
          <p style={{ color: "var(--tenue)", fontSize: ".92rem", marginTop: 14, marginBottom: 18 }}>
            Los resultados aparecen cuando se cierra la pregunta.
          </p>
          <Contador total={conteo} />
        </div>
        {hayCerradas && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button className="btn-fant" onClick={onVolver}>Ver las preguntas cerradas</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="tarjeta">
        <div className="preg-num">Pregunta {ROMANOS[pregunta.orden]}</div>
        <div className="preg-txt">{pregunta.enunciado}</div>
        {pregunta.ayuda && <div className="preg-ayuda">{pregunta.ayuda}</div>}

        <div style={{ marginTop: 24 }}>
          <Control cfg={cfg} valor={valor} setValor={(v) => { setValor(v); setErr(""); }} />
        </div>

        {err && <div className="error">{err}</div>}

        <button className="btn" style={{ width: "100%", marginTop: 20 }} onClick={enviar} disabled={enviando}>
          {enviando ? "Enviando…" : "Enviar mi respuesta"}
        </button>

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--linea)" }}>
          <Contador total={conteo} />
        </div>
      </div>
      {hayCerradas && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button className="btn-fant" onClick={onVolver}>Ver las preguntas cerradas</button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   INFORME IMPRIMIBLE
   ============================================================ */

function Informe({ corrida, preguntas, respuestas, participantes, onCerrar }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const porPregunta = (p) => respuestas.filter((r) => r.pregunta_id === p.id);
  const personas = Object.values(participantes);

  const textoValor = (p, v) => {
    switch (p.tipo) {
      case "seleccion_multiple": return (v || []).join(" · ");
      case "coordenada_2d": return `x ${v.x} / y ${v.y}`;
      case "reparto_puntos":
        return Object.entries(v).filter(([, n]) => n > 0).map(([o, n]) => `${o}: ${n}`).join(" · ");
      case "parrafo": return `${v.titulo} — ${v.texto}`;
      default: return String(v);
    }
  };

  return (
    <div>
      <div className="no-print" style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 24 }}>
        <button className="btn" onClick={() => window.print()}>Descargar PDF</button>
        <button className="btn-fant" onClick={onCerrar}>Volver al panel</button>
      </div>

      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1 style={{ fontSize: "1.7rem" }}>{corrida.nombre}</h1>
        <p style={{ color: "var(--tenue)", fontSize: ".9rem", marginTop: 6 }}>
          {fechaLegible(corrida.creada_en)} · {personas.length}{" "}
          {personas.length === 1 ? "participante" : "participantes"}
        </p>
      </div>

      {preguntas.map((p) => (
        <BloqueResultado key={p.id} pregunta={p} respuestas={porPregunta(p)} participantes={participantes} />
      ))}

      <div className="pag" />

      <h2 style={{ fontSize: "1.3rem", marginTop: 40, marginBottom: 18 }}>Respuestas individuales</h2>
      {personas.map((per) => {
        const suyas = respuestas.filter((r) => r.dispositivo === per.dispositivo);
        if (!suyas.length) return null;
        return (
          <div key={per.id} style={{ marginBottom: 26, breakInside: "avoid" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Ave i={per.avatar} size={26} />
              <b style={{ fontFamily: "var(--display)", fontSize: "1.05rem", fontWeight: 500 }}>
                {per.nombre || "Anónimo"}
              </b>
            </div>
            {preguntas.map((p) => {
              const r = suyas.find((x) => x.pregunta_id === p.id);
              if (!r) return null;
              return (
                <div key={p.id} style={{ fontSize: ".9rem", lineHeight: 1.5, marginBottom: 7, paddingLeft: 12, borderLeft: "2px solid var(--linea)" }}>
                  <span style={{ color: "var(--tenue)" }}>{ROMANOS[p.orden]}. </span>
                  {textoValor(p, r.valor)}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   PANEL DE ADMINISTRACIÓN
   ============================================================ */

function Admin({ preguntas }) {
  const [sesion, setSesion] = useState(null);
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [err, setErr] = useState("");
  const [corrida, setCorrida] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [participantes, setParticipantes] = useState({});
  const [conteos, setConteos] = useState({});
  const [historico, setHistorico] = useState([]);
  const [vista, setVista] = useState("panel");
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSesion(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSesion(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const cargar = useCallback(async () => {
    const { data: c } = await sb.from("pulso_corridas").select("*")
      .in("estado", ["en_vivo", "finalizada"]).order("creada_en", { ascending: false }).limit(1);
    const act = c && c[0];
    setCorrida(act || null);
    if (!act) return;
    const [{ data: rs }, { data: ps }, { data: cs }, { data: hs }] = await Promise.all([
      sb.from("pulso_respuestas").select("*").eq("corrida_id", act.id),
      sb.from("pulso_participantes").select("*").eq("corrida_id", act.id),
      sb.from("pulso_conteos").select("*").eq("corrida_id", act.id),
      sb.from("pulso_historico").select("id,nombre,guardado_en").order("guardado_en", { ascending: false }),
    ]);
    setRespuestas(rs || []);
    const mapa = {}; (ps || []).forEach((p) => (mapa[p.dispositivo] = p));
    setParticipantes(mapa);
    const cm = {}; (cs || []).forEach((x) => (cm[x.pregunta_id] = x.total));
    setConteos(cm);
    setHistorico(hs || []);
  }, []);

  useEffect(() => { if (sesion) cargar(); }, [sesion, cargar]);

  useEffect(() => {
    if (!sesion) return;
    const canal = sb.channel("admin-pulso")
      .on("postgres_changes", { event: "*", schema: "public", table: "pulso_conteos" }, cargar)
      .on("postgres_changes", { event: "*", schema: "public", table: "pulso_participantes" }, cargar)
      .subscribe();
    return () => sb.removeChannel(canal);
  }, [sesion, cargar]);

  const entrar = async () => {
    setErr("");
    const { error } = await sb.auth.signInWithPassword({ email, password: clave });
    if (error) setErr("Correo o contraseña incorrectos");
  };

  if (!sesion) {
    return (
      <div className="tarjeta" style={{ marginTop: 10 }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: 16 }}>Panel del administrador</h2>
        <div style={{ display: "grid", gap: 11 }}>
          <input className="campo" type="email" placeholder="Correo" value={email}
                 onChange={(e) => setEmail(e.target.value)} />
          <input className="campo" type="password" placeholder="Contraseña" value={clave}
                 onChange={(e) => setClave(e.target.value)}
                 onKeyDown={(e) => e.key === "Enter" && entrar()} />
        </div>
        {err && <div className="error">{err}</div>}
        <button className="btn" style={{ width: "100%", marginTop: 16 }} onClick={entrar}>Entrar</button>
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <a href="#" style={{ fontSize: ".86rem", color: "var(--tenue)" }}>Volver al pulso</a>
        </div>
      </div>
    );
  }

  if (!corrida) return <div className="cargando">No hay ninguna corrida. Crea una desde el panel de Supabase.</div>;

  const total = preguntas.length;
  const activa = preguntas.find((p) => p.orden === corrida.indice_activo);
  const cerradas = preguntas.filter((p) => p.orden < corrida.indice_activo);
  const terminada = corrida.indice_activo > total;

  const cerrarPregunta = async () => {
    setOcupado(true);
    const nuevo = corrida.indice_activo + 1;
    await sb.from("pulso_corridas").update({
      indice_activo: nuevo,
      estado: nuevo > total ? "finalizada" : "en_vivo",
      cerrada_en: nuevo > total ? new Date().toISOString() : null,
    }).eq("id", corrida.id);
    await cargar(); setOcupado(false);
  };

  const guardar = async () => {
    setOcupado(true);
    const datos = {
      preguntas, respuestas,
      participantes: Object.values(participantes),
      creada_en: corrida.creada_en,
    };
    const { error } = await sb.from("pulso_historico")
      .insert({ nombre: corrida.nombre, corrida_id: corrida.id, datos });
    setAviso(error ? "No se pudo guardar." : "Pulso guardado en el histórico.");
    await cargar(); setOcupado(false);
    setTimeout(() => setAviso(""), 4000);
  };

  const reiniciar = async () => {
    if (!confirm("Se archiva este pulso y empieza uno nuevo con las mismas preguntas. ¿Continuar?")) return;
    setOcupado(true);
    await sb.from("pulso_corridas").update({ estado: "archivada" }).eq("id", corrida.id);
    const f = new Date().toLocaleDateString("es", { day: "2-digit", month: "2-digit", year: "numeric" });
    await sb.from("pulso_corridas").insert({ nombre: "Pulso de lectura " + f, indice_activo: 1, estado: "en_vivo" });
    await cargar(); setOcupado(false);
    setAviso("Pulso reiniciado. Los lectores ya pueden empezar de nuevo.");
    setTimeout(() => setAviso(""), 4000);
  };

  const descargarCSV = () => {
    const esc = (s) => '"' + String(s === undefined || s === null ? "" : s).replace(/"/g, '""') + '"';
    const filas = [["Participante", "Anónimo", "Pregunta", "Tipo", "Respuesta", "Enviada"]];
    respuestas.forEach((r) => {
      const p = preguntas.find((x) => x.id === r.pregunta_id);
      const per = participantes[r.dispositivo];
      filas.push([
        per && per.nombre ? per.nombre : "Anónimo",
        per && per.es_anonimo ? "sí" : "no",
        p ? p.enunciado : "",
        p ? p.tipo : "",
        typeof r.valor === "object" ? JSON.stringify(r.valor) : r.valor,
        r.creada_en,
      ]);
    });
    const csv = "\uFEFF" + filas.map((f) => f.map(esc).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = corrida.nombre.replace(/\s+/g, "_") + ".csv";
    a.click();
  };

  if (vista === "informe") {
    return <Informe corrida={corrida} preguntas={preguntas} respuestas={respuestas}
                    participantes={participantes} onCerrar={() => setVista("panel")} />;
  }

  return (
    <div>
      <div className="adm-barra">
        <h2>{corrida.nombre}</h2>
        <div className="adm-est">
          {terminada
            ? `Ronda terminada · ${Object.keys(participantes).length} participantes`
            : `Pregunta ${corrida.indice_activo} de ${total} · ${Object.keys(participantes).length} participantes`}
        </div>
        {!terminada && activa && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(247,244,236,.2)" }}>
            <div style={{ fontFamily: "var(--display)", fontSize: "1.05rem", lineHeight: 1.3 }}>{activa.enunciado}</div>
            <div style={{ marginTop: 10, fontSize: ".9rem", opacity: .8 }}>
              {conteos[activa.id] || 0} {(conteos[activa.id] || 0) === 1 ? "respuesta recibida" : "respuestas recibidas"}
            </div>
          </div>
        )}
        <div className="adm-acc">
          {!terminada && <button className="pri" onClick={cerrarPregunta} disabled={ocupado}>Cerrar pregunta</button>}
          {terminada && <button className="pri" onClick={guardar} disabled={ocupado}>Guardar pulso</button>}
          <button onClick={() => setVista("informe")}>Ver informe y PDF</button>
          <button onClick={descargarCSV}>Descargar CSV</button>
          <button onClick={reiniciar} disabled={ocupado}>Reiniciar pulso</button>
          <button onClick={() => sb.auth.signOut()}>Salir</button>
        </div>
        {aviso && <div style={{ marginTop: 12, fontSize: ".88rem", color: "var(--mostaza)" }}>{aviso}</div>}
      </div>

      {cerradas.length > 0 && (
        <div className="tarjeta" style={{ marginBottom: 22 }}>
          {cerradas.map((p) => (
            <BloqueResultado key={p.id} pregunta={p}
                             respuestas={respuestas.filter((r) => r.pregunta_id === p.id)}
                             participantes={participantes} />
          ))}
        </div>
      )}

      {historico.length > 0 && (
        <div className="tarjeta">
          <h2 style={{ fontSize: "1.1rem", marginBottom: 12 }}>Histórico de pulsos</h2>
          {historico.map((h) => (
            <div className="hist-fila" key={h.id}>
              <span>{h.nombre}</span>
              <span style={{ color: "var(--tenue)", fontSize: ".85rem" }}>{fechaLegible(h.guardado_en)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   APP
   ============================================================ */

function App() {
  const [ruta, setRuta] = useState(window.location.hash);
  const [preguntas, setPreguntas] = useState([]);
  const [corrida, setCorrida] = useState(null);
  const [participante, setParticipante] = useState(null);
  const [participantes, setParticipantes] = useState({});
  const [conteos, setConteos] = useState({});
  const [respuestas, setRespuestas] = useState([]);
  const [mias, setMias] = useState([]);
  const [vista, setVista] = useState("feed");
  const [listo, setListo] = useState(false);
  const [fallo, setFallo] = useState("");

  useEffect(() => {
    const h = () => setRuta(window.location.hash);
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  const cargar = useCallback(async () => {
    try {
      const { data: pr, error: e1 } = await sb.from("pulso_preguntas").select("*").order("orden");
      if (e1) throw e1;
      setPreguntas(pr || []);

      const { data: c } = await sb.from("pulso_corridas").select("*")
        .in("estado", ["en_vivo", "finalizada"]).order("creada_en", { ascending: false }).limit(1);
      const act = c && c[0];
      setCorrida(act || null);
      if (!act) { setListo(true); return; }

      const [{ data: ps }, { data: cs }, { data: rs }] = await Promise.all([
        sb.from("pulso_participantes").select("*").eq("corrida_id", act.id),
        sb.from("pulso_conteos").select("*").eq("corrida_id", act.id),
        sb.from("pulso_respuestas").select("*").eq("corrida_id", act.id),
      ]);

      const mapa = {}; (ps || []).forEach((p) => (mapa[p.dispositivo] = p));
      setParticipantes(mapa);
      setParticipante(mapa[DISPOSITIVO] || null);

      const cm = {}; (cs || []).forEach((x) => (cm[x.pregunta_id] = x.total));
      setConteos(cm);
      setRespuestas(rs || []);
      setMias(LS.get("pulso_mias_" + act.id, []));
      setListo(true);
    } catch (e) {
      const msg = (e && (e.message || e.hint)) || "Error desconocido";
      setFallo(
        /relation|does not exist|schema cache/i.test(msg)
          ? "Las tablas no existen todavía. Ejecuta schema.sql completo en el SQL Editor de Supabase."
          : /JWT|api key|Invalid/i.test(msg)
          ? "La llave de config.js no es válida para este proyecto. Copia de nuevo la publishable key."
          : "No pudimos conectarnos: " + msg
      );
      setListo(true);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const indiceRef = useRef(null);
  useEffect(() => {
    if (!corrida) return;
    if (indiceRef.current !== null && indiceRef.current !== corrida.indice_activo) setVista("feed");
    indiceRef.current = corrida.indice_activo;
  }, [corrida && corrida.indice_activo]);

  useEffect(() => {
    const canal = sb.channel("pulso-vivo")
      .on("postgres_changes", { event: "*", schema: "public", table: "pulso_corridas" }, cargar)
      .on("postgres_changes", { event: "*", schema: "public", table: "pulso_conteos" }, (m) => {
        const n = m.new;
        if (n && n.pregunta_id) setConteos((c) => ({ ...c, [n.pregunta_id]: n.total }));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "pulso_participantes" }, (m) => {
        const n = m.new;
        if (n) setParticipantes((p) => ({ ...p, [n.dispositivo]: n }));
      })
      .subscribe();
    return () => sb.removeChannel(canal);
  }, [cargar]);

  const entrar = async (nombre, anon) => {
    LS.set("pulso_nombre", nombre); LS.set("pulso_anonimo", anon);
    const { data, error } = await sb.from("pulso_participantes")
      .insert({ corrida_id: corrida.id, dispositivo: DISPOSITIVO, nombre, es_anonimo: anon })
      .select().single();
    if (error) throw error;
    setParticipante(data);
    setParticipantes((p) => ({ ...p, [data.dispositivo]: data }));
  };

  const enviar = async (pregunta, valor) => {
    const { error } = await sb.from("pulso_respuestas")
      .insert({ corrida_id: corrida.id, pregunta_id: pregunta.id, dispositivo: DISPOSITIVO, valor });
    if (error) throw error;
    const nuevas = [...mias, pregunta.id];
    setMias(nuevas);
    LS.set("pulso_mias_" + corrida.id, nuevas);
    setConteos((c) => ({ ...c, [pregunta.id]: (c[pregunta.id] || 0) + 1 }));
  };

  if (ruta === "#admin") {
    return (
      <div className="env">
        <header className="cab"><h1>{CONFIG.TITULO}</h1><div className="sub">Administración</div></header>
        <Admin preguntas={preguntas} />
      </div>
    );
  }

  const cabecera = (
    <header className="cab">
      <h1>{CONFIG.TITULO}</h1>
      {corrida && <div className="sub">{fechaLegible(corrida.creada_en)}</div>}
    </header>
  );

  if (!listo) return <div className="cargando">Cargando…</div>;

  if (fallo) {
    return <div className="env">{cabecera}<div className="aviso"><div className="ico">✳</div><p>{fallo}</p></div></div>;
  }

  if (!corrida) {
    return (
      <div className="env">{cabecera}
        <div className="aviso"><div className="ico">✳</div>
          <h2 style={{ fontSize: "1.2rem" }}>Todavía no empezamos</h2>
          <p>Vuelve cuando arranque el encuentro.</p>
        </div>
      </div>
    );
  }

  if (!participante) {
    return <div className="env">{cabecera}<Ingreso onEntrar={entrar} /></div>;
  }

  const total = preguntas.length;
  const activa = preguntas.find((p) => p.orden === corrida.indice_activo);
  const cerradas = preguntas.filter((p) => p.orden < corrida.indice_activo);
  const terminada = corrida.indice_activo > total || corrida.estado === "finalizada";
  const respondida = activa && mias.includes(activa.id);

  if (terminada) {
    return (
      <div className="env">{cabecera}
        <div className="tarjeta" style={{ textAlign: "center", marginBottom: 22 }}>
          <div className="ico" style={{ fontFamily: "var(--display)", fontSize: "1.8rem", color: "var(--dorado)" }}>✳</div>
          <h2 style={{ fontSize: "1.25rem", marginTop: 8 }}>Esto es lo que dijimos</h2>
          <p style={{ color: "var(--tenue)", fontSize: ".93rem", marginTop: 8, marginBottom: 0 }}>
            {Object.keys(participantes).length} personas respondieron.
          </p>
        </div>
        <div className="tarjeta">
          {preguntas.map((p) => (
            <BloqueResultado key={p.id} pregunta={p}
                             respuestas={respuestas.filter((r) => r.pregunta_id === p.id)}
                             participantes={participantes} />
          ))}
        </div>
      </div>
    );
  }

  if (vista === "activa" || cerradas.length === 0) {
    return (
      <div className="env">{cabecera}
        <PreguntaActiva pregunta={activa} corrida={corrida} conteo={conteos[activa.id] || 0}
                        yaRespondio={respondida} onEnviar={enviar}
                        onVolver={() => setVista("feed")} hayCerradas={cerradas.length > 0} />
      </div>
    );
  }

  return (
    <div className="env">
      {cabecera}
      <div className="tarjeta">
        {cerradas.map((p) => (
          <BloqueResultado key={p.id} pregunta={p}
                           respuestas={respuestas.filter((r) => r.pregunta_id === p.id)}
                           participantes={participantes} />
        ))}
      </div>
      <div className="hilo"><span>Vamos en la pregunta {ROMANOS[corrida.indice_activo]}</span></div>
      <div className="salto">
        <button onClick={() => setVista("activa")}>
          {respondida ? "Ver la pregunta activa" : "Ir a la pregunta activa"} ↓
        </button>
      </div>
    </div>
  );
}

try {
  ReactDOM.createRoot(document.getElementById("raiz")).render(<App />);
  window.__APP_OK = true;
} catch (e) {
  if (window.__pintarError) window.__pintarError("La aplicación falló al dibujarse", e.message);
  else throw e;
}
