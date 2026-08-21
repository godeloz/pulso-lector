/* Editor de preguntas. Compilado desde editor.jsx */
/* ============================================================
   EDITOR DE PREGUNTAS Y AJUSTES
   Se expone como window.PulsoEditor y lo usa el panel de admin.
   ============================================================ */

const {
  useState: uS,
  useEffect: uE
} = React;
const TIPOS = [{
  id: "palabra_unica",
  nombre: "Palabra única",
  pista: "Una sola palabra. Se ve como nube.",
  seg: 45
}, {
  id: "dilema_binario",
  nombre: "Dilema binario",
  pista: "Dos opciones, sin punto medio.",
  seg: 30
}, {
  id: "opcion_unica",
  nombre: "Opción única",
  pista: "Elige una de varias. Barras.",
  seg: 45
}, {
  id: "seleccion_multiple",
  nombre: "Selección múltiple",
  pista: "Varias opciones con tope.",
  seg: 60
}, {
  id: "coordenada_2d",
  nombre: "Plano de dos ejes",
  pista: "Toca un punto. Nube de puntos.",
  seg: 90
}, {
  id: "reparto_puntos",
  nombre: "Reparto de puntos",
  pista: "Distribuye un total. Revela jerarquía.",
  seg: 120
}, {
  id: "parrafo",
  nombre: "Texto largo",
  pista: "Título y texto. Grid de tarjetas.",
  seg: 240
}];
const VISIBILIDAD = [{
  id: "tras_responder",
  nombre: "Después de responder",
  pista: "Recomendado. Evita que se copien entre sí."
}, {
  id: "al_cerrar",
  nombre: "Solo al cerrarse",
  pista: "Nadie ve nada hasta que acaba el tiempo."
}, {
  id: "siempre",
  nombre: "Siempre visibles",
  pista: "Cuidado: sesga a quien responde después."
}];
function nombreTipo(id) {
  const t = TIPOS.find(x => x.id === id);
  return t ? t.nombre : id;
}
function configPorDefecto(tipo) {
  switch (tipo) {
    case "palabra_unica":
      return {
        max_caracteres: 20
      };
    case "dilema_binario":
      return {
        opciones: ["", ""]
      };
    case "opcion_unica":
      return {
        opciones: ["", "", ""]
      };
    case "seleccion_multiple":
      return {
        max_selecciones: 2,
        opciones: ["", "", ""]
      };
    case "coordenada_2d":
      return {
        eje_x: {
          izquierda: "",
          derecha: "",
          glosa_izquierda: "",
          glosa_derecha: ""
        },
        eje_y: {
          arriba: "",
          abajo: "",
          glosa_arriba: "",
          glosa_abajo: ""
        }
      };
    case "reparto_puntos":
      return {
        total: 10,
        opciones: ["", "", ""]
      };
    case "parrafo":
      return {
        campo_titulo: "Título",
        campo_texto: "Cuéntanos"
      };
    default:
      return {};
  }
}

/* ---------- editor de una lista de opciones ---------- */
function ListaOpciones({
  opciones,
  setOpciones,
  fijas
}) {
  const cambiar = (i, v) => {
    const n = [...opciones];
    n[i] = v;
    setOpciones(n);
  };
  return /*#__PURE__*/React.createElement("div", null, opciones.map((o, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 8,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--tenue)",
      fontSize: ".82rem",
      width: 18,
      flexShrink: 0
    }
  }, i + 1), /*#__PURE__*/React.createElement("input", {
    className: "campo",
    value: o,
    placeholder: "Opción " + (i + 1),
    onChange: e => cambiar(i, e.target.value),
    style: {
      padding: "10px 13px"
    }
  }), !fijas && opciones.length > 2 && /*#__PURE__*/React.createElement("button", {
    className: "rep-btn",
    style: {
      flexShrink: 0
    },
    "aria-label": "Quitar opción",
    onClick: () => setOpciones(opciones.filter((_, j) => j !== i))
  }, "−"))), !fijas && opciones.length < 10 && /*#__PURE__*/React.createElement("button", {
    className: "btn-fant",
    style: {
      padding: "8px 16px",
      fontSize: ".88rem",
      minHeight: 38
    },
    onClick: () => setOpciones([...opciones, ""])
  }, "Agregar opción"));
}

/* ---------- campos de configuración según el tipo ---------- */
function CamposTipo({
  tipo,
  config,
  setConfig
}) {
  const set = (k, v) => setConfig({
    ...config,
    [k]: v
  });
  const setEje = (eje, k, v) => setConfig({
    ...config,
    [eje]: {
      ...config[eje],
      [k]: v
    }
  });
  const et = {
    display: "block",
    fontSize: ".84rem",
    fontWeight: 500,
    margin: "16px 0 7px"
  };
  if (tipo === "palabra_unica") {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: et
    }, "Máximo de caracteres"), /*#__PURE__*/React.createElement("input", {
      className: "campo",
      type: "number",
      min: "3",
      max: "60",
      value: config.max_caracteres || 20,
      onChange: e => set("max_caracteres", parseInt(e.target.value) || 20)
    }));
  }
  if (tipo === "dilema_binario") {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: et
    }, "Las dos opciones"), /*#__PURE__*/React.createElement(ListaOpciones, {
      opciones: config.opciones || ["", ""],
      fijas: true,
      setOpciones: o => set("opciones", o)
    }));
  }
  if (tipo === "opcion_unica") {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: et
    }, "Opciones"), /*#__PURE__*/React.createElement(ListaOpciones, {
      opciones: config.opciones || ["", ""],
      setOpciones: o => set("opciones", o)
    }));
  }
  if (tipo === "seleccion_multiple") {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: et
    }, "Cuántas puede elegir como máximo"), /*#__PURE__*/React.createElement("input", {
      className: "campo",
      type: "number",
      min: "1",
      max: "6",
      value: config.max_selecciones || 2,
      onChange: e => set("max_selecciones", parseInt(e.target.value) || 2)
    }), /*#__PURE__*/React.createElement("label", {
      style: et
    }, "Opciones"), /*#__PURE__*/React.createElement(ListaOpciones, {
      opciones: config.opciones || ["", ""],
      setOpciones: o => set("opciones", o)
    }));
  }
  if (tipo === "reparto_puntos") {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: et
    }, "Puntos a repartir"), /*#__PURE__*/React.createElement("input", {
      className: "campo",
      type: "number",
      min: "3",
      max: "100",
      value: config.total || 10,
      onChange: e => set("total", parseInt(e.target.value) || 10)
    }), /*#__PURE__*/React.createElement("label", {
      style: et
    }, "Entre estas opciones"), /*#__PURE__*/React.createElement(ListaOpciones, {
      opciones: config.opciones || ["", ""],
      setOpciones: o => set("opciones", o)
    }));
  }
  if (tipo === "parrafo") {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: et
    }, "Etiqueta del campo corto"), /*#__PURE__*/React.createElement("input", {
      className: "campo",
      value: config.campo_titulo || "",
      placeholder: "Título y autor",
      onChange: e => set("campo_titulo", e.target.value)
    }), /*#__PURE__*/React.createElement("label", {
      style: et
    }, "Etiqueta del campo largo"), /*#__PURE__*/React.createElement("input", {
      className: "campo",
      value: config.campo_texto || "",
      placeholder: "¿Por qué nos vamos a enamorar?",
      onChange: e => set("campo_texto", e.target.value)
    }));
  }
  if (tipo === "coordenada_2d") {
    const ex = config.eje_x || {},
      ey = config.eje_y || {};
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "rgba(201,150,47,.1)",
        borderRadius: 10,
        padding: "12px 14px",
        marginTop: 16,
        fontSize: ".85rem",
        color: "var(--tenue)"
      }
    }, "Cada extremo lleva un nombre corto (se ve en el plano) y una glosa que explica qué significa. Sin las glosas, la gente no sabe dónde tocar."), /*#__PURE__*/React.createElement("label", {
      style: et
    }, "Eje horizontal · extremo izquierdo"), /*#__PURE__*/React.createElement("input", {
      className: "campo",
      value: ex.izquierda || "",
      placeholder: "Íntimo",
      onChange: e => setEje("eje_x", "izquierda", e.target.value)
    }), /*#__PURE__*/React.createElement("input", {
      className: "campo",
      style: {
        marginTop: 8
      },
      value: ex.glosa_izquierda || "",
      placeholder: "Qué significa ese extremo",
      onChange: e => setEje("eje_x", "glosa_izquierda", e.target.value)
    }), /*#__PURE__*/React.createElement("label", {
      style: et
    }, "Eje horizontal · extremo derecho"), /*#__PURE__*/React.createElement("input", {
      className: "campo",
      value: ex.derecha || "",
      placeholder: "Coral",
      onChange: e => setEje("eje_x", "derecha", e.target.value)
    }), /*#__PURE__*/React.createElement("input", {
      className: "campo",
      style: {
        marginTop: 8
      },
      value: ex.glosa_derecha || "",
      placeholder: "Qué significa ese extremo",
      onChange: e => setEje("eje_x", "glosa_derecha", e.target.value)
    }), /*#__PURE__*/React.createElement("label", {
      style: et
    }, "Eje vertical · arriba"), /*#__PURE__*/React.createElement("input", {
      className: "campo",
      value: ey.arriba || "",
      placeholder: "Luminoso",
      onChange: e => setEje("eje_y", "arriba", e.target.value)
    }), /*#__PURE__*/React.createElement("input", {
      className: "campo",
      style: {
        marginTop: 8
      },
      value: ey.glosa_arriba || "",
      placeholder: "Qué significa ese extremo",
      onChange: e => setEje("eje_y", "glosa_arriba", e.target.value)
    }), /*#__PURE__*/React.createElement("label", {
      style: et
    }, "Eje vertical · abajo"), /*#__PURE__*/React.createElement("input", {
      className: "campo",
      value: ey.abajo || "",
      placeholder: "Oscuro",
      onChange: e => setEje("eje_y", "abajo", e.target.value)
    }), /*#__PURE__*/React.createElement("input", {
      className: "campo",
      style: {
        marginTop: 8
      },
      value: ey.glosa_abajo || "",
      placeholder: "Qué significa ese extremo",
      onChange: e => setEje("eje_y", "glosa_abajo", e.target.value)
    }));
  }
  return null;
}

/* ---------- formulario de una pregunta ---------- */
function FormPregunta({
  inicial,
  onGuardar,
  onCancelar
}) {
  const nueva = !inicial.id;
  const [tipo, setTipo] = uS(inicial.tipo || "");
  const [enunciado, setEnunciado] = uS(inicial.enunciado || "");
  const [ayuda, setAyuda] = uS(inicial.ayuda || "");
  const [segundos, setSegundos] = uS(inicial.segundos === undefined ? 60 : inicial.segundos);
  const [visibles, setVisibles] = uS(inicial.resultados_visibles || "tras_responder");
  const [config, setConfig] = uS(inicial.config || {});
  const [err, setErr] = uS("");
  const elegirTipo = t => {
    setTipo(t);
    setConfig(configPorDefecto(t));
    const def = TIPOS.find(x => x.id === t);
    if (nueva && def) setSegundos(def.seg);
  };
  const validar = () => {
    if (!tipo) return "Elige un tipo de pregunta";
    if (!enunciado.trim()) return "Escribe el enunciado";
    const ops = config.opciones;
    if (ops) {
      const limpias = ops.map(o => o.trim()).filter(Boolean);
      if (limpias.length < 2) return "Necesitas al menos dos opciones con texto";
      if (tipo === "dilema_binario" && limpias.length !== 2) return "El dilema necesita exactamente dos opciones";
      if (new Set(limpias).size !== limpias.length) return "Hay opciones repetidas";
      if (tipo === "seleccion_multiple" && (config.max_selecciones || 2) >= limpias.length) return "El máximo a elegir debe ser menor que la cantidad de opciones";
    }
    if (tipo === "coordenada_2d") {
      const ex = config.eje_x || {},
        ey = config.eje_y || {};
      if (!ex.izquierda || !ex.derecha || !ey.arriba || !ey.abajo) return "Los cuatro extremos del plano necesitan nombre";
    }
    if (tipo === "reparto_puntos" && (config.total || 0) < 3) return "El total de puntos debe ser al menos 3";
    return "";
  };
  const guardar = () => {
    const e = validar();
    if (e) {
      setErr(e);
      return;
    }
    const limpio = {
      ...config
    };
    if (limpio.opciones) limpio.opciones = limpio.opciones.map(o => o.trim()).filter(Boolean);
    onGuardar({
      id: inicial.id,
      orden: inicial.orden,
      tipo,
      enunciado: enunciado.trim(),
      ayuda: ayuda.trim() || null,
      segundos: Math.max(0, parseInt(segundos) || 0),
      resultados_visibles: visibles,
      config: limpio
    });
  };
  const et = {
    display: "block",
    fontSize: ".84rem",
    fontWeight: 500,
    margin: "16px 0 7px"
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "tarjeta"
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "1.15rem",
      marginBottom: 4
    }
  }, nueva ? "Nueva pregunta" : "Editar pregunta"), nueva && !tipo && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: et
  }, "¿Qué tipo de pregunta?"), /*#__PURE__*/React.createElement("div", {
    className: "ops"
  }, TIPOS.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    className: "op",
    onClick: () => elegirTipo(t.id),
    style: {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500
    }
  }, t.nombre), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: ".82rem",
      color: "var(--tenue)"
    }
  }, t.pista)))), /*#__PURE__*/React.createElement("button", {
    className: "btn-fant",
    style: {
      marginTop: 16
    },
    onClick: onCancelar
  }, "Cancelar")), tipo && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: ".82rem",
      color: "var(--dorado)",
      letterSpacing: ".1em",
      textTransform: "uppercase",
      marginTop: 6
    }
  }, nombreTipo(tipo)), /*#__PURE__*/React.createElement("label", {
    style: et
  }, "Enunciado"), /*#__PURE__*/React.createElement("textarea", {
    className: "campo",
    style: {
      minHeight: 80
    },
    value: enunciado,
    placeholder: "La pregunta tal como la va a leer la gente",
    onChange: e => {
      setEnunciado(e.target.value);
      setErr("");
    }
  }), /*#__PURE__*/React.createElement("label", {
    style: et
  }, "Ayuda ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--tenue)",
      fontWeight: 400
    }
  }, "(opcional)")), /*#__PURE__*/React.createElement("input", {
    className: "campo",
    value: ayuda,
    placeholder: "Instrucción breve bajo el enunciado",
    onChange: e => setAyuda(e.target.value)
  }), /*#__PURE__*/React.createElement(CamposTipo, {
    tipo: tipo,
    config: config,
    setConfig: c => {
      setConfig(c);
      setErr("");
    }
  }), /*#__PURE__*/React.createElement("label", {
    style: et
  }, "Tiempo para responder"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "campo",
    type: "number",
    min: "0",
    max: "900",
    value: segundos,
    style: {
      maxWidth: 120
    },
    onChange: e => setSegundos(e.target.value)
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: ".88rem",
      color: "var(--tenue)"
    }
  }, "segundos ", parseInt(segundos) === 0 ? "· sin límite" : "")), /*#__PURE__*/React.createElement("label", {
    style: et
  }, "¿Cuándo se ven los resultados?"), /*#__PURE__*/React.createElement("div", {
    className: "ops"
  }, VISIBILIDAD.map(v => /*#__PURE__*/React.createElement("button", {
    key: v.id,
    className: "op" + (visibles === v.id ? " sel" : ""),
    onClick: () => setVisibles(v.id),
    style: {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500
    }
  }, v.nombre), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: ".82rem",
      color: "var(--tenue)"
    }
  }, v.pista)))), err && /*#__PURE__*/React.createElement("div", {
    className: "error"
  }, err), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 9,
      marginTop: 20,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: guardar
  }, "Guardar pregunta"), /*#__PURE__*/React.createElement("button", {
    className: "btn-fant",
    onClick: onCancelar
  }, "Cancelar"))));
}

/* ---------- editor completo ---------- */
function PulsoEditor({
  sb,
  onCerrar
}) {
  const [preguntas, setPreguntas] = uS([]);
  const [ajustes, setAjustes] = uS({
    titulo: "",
    bajada: ""
  });
  const [editando, setEditando] = uS(null);
  const [aviso, setAviso] = uS("");
  const [cargando, setCargando] = uS(true);
  const [hayRespuestas, setHayRespuestas] = uS(false);
  const avisar = t => {
    setAviso(t);
    setTimeout(() => setAviso(""), 3500);
  };
  const cargar = async () => {
    const [{
      data: p
    }, {
      data: a
    }, {
      count
    }] = await Promise.all([sb.from("pulso_preguntas").select("*").order("orden"), sb.from("pulso_ajustes").select("*"), sb.from("pulso_respuestas").select("id", {
      count: "exact",
      head: true
    })]);
    setPreguntas(p || []);
    const map = {};
    (a || []).forEach(x => map[x.clave] = x.valor);
    setAjustes({
      titulo: map.titulo || "",
      bajada: map.bajada || ""
    });
    setHayRespuestas((count || 0) > 0);
    setCargando(false);
  };
  uE(() => {
    cargar();
  }, []);
  const guardarPregunta = async p => {
    if (p.id) {
      const {
        error
      } = await sb.from("pulso_preguntas").update({
        tipo: p.tipo,
        enunciado: p.enunciado,
        ayuda: p.ayuda,
        segundos: p.segundos,
        resultados_visibles: p.resultados_visibles,
        config: p.config
      }).eq("id", p.id);
      avisar(error ? "No se pudo guardar: " + error.message : "Pregunta actualizada");
    } else {
      const orden = (preguntas.reduce((m, x) => Math.max(m, x.orden), 0) || 0) + 1;
      const {
        error
      } = await sb.from("pulso_preguntas").insert({
        orden,
        tipo: p.tipo,
        enunciado: p.enunciado,
        ayuda: p.ayuda,
        segundos: p.segundos,
        resultados_visibles: p.resultados_visibles,
        config: p.config
      });
      avisar(error ? "No se pudo crear: " + error.message : "Pregunta agregada");
    }
    setEditando(null);
    cargar();
  };
  const duplicar = async p => {
    const orden = (preguntas.reduce((m, x) => Math.max(m, x.orden), 0) || 0) + 1;
    const {
      error
    } = await sb.from("pulso_preguntas").insert({
      orden,
      tipo: p.tipo,
      enunciado: p.enunciado + " (copia)",
      ayuda: p.ayuda,
      segundos: p.segundos,
      resultados_visibles: p.resultados_visibles,
      config: p.config
    });
    avisar(error ? "No se pudo duplicar" : "Pregunta duplicada al final");
    cargar();
  };
  const eliminar = async p => {
    if (!confirm("Se elimina la pregunta y sus respuestas. ¿Seguro?")) return;
    const {
      error
    } = await sb.from("pulso_preguntas").delete().eq("id", p.id);
    avisar(error ? "No se pudo eliminar" : "Pregunta eliminada");
    cargar();
  };
  const mover = async (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= preguntas.length) return;
    const a = preguntas[i],
      b = preguntas[j];
    await Promise.all([sb.from("pulso_preguntas").update({
      orden: b.orden
    }).eq("id", a.id), sb.from("pulso_preguntas").update({
      orden: a.orden
    }).eq("id", b.id)]);
    cargar();
  };
  const guardarAjustes = async () => {
    const filas = [{
      clave: "titulo",
      valor: ajustes.titulo.trim() || "Sondeo"
    }, {
      clave: "bajada",
      valor: ajustes.bajada.trim()
    }];
    const {
      error
    } = await sb.from("pulso_ajustes").upsert(filas, {
      onConflict: "clave"
    });
    avisar(error ? "No se pudieron guardar los ajustes" : "Ajustes guardados");
  };
  if (cargando) return /*#__PURE__*/React.createElement("div", {
    className: "cargando"
  }, "Cargando el editor…");
  if (editando) {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormPregunta, {
      inicial: editando,
      onGuardar: guardarPregunta,
      onCancelar: () => setEditando(null)
    }));
  }
  const totalSeg = preguntas.reduce((a, p) => a + (p.segundos || 0), 0);
  const mins = Math.round(totalSeg / 60);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "adm-barra"
  }, /*#__PURE__*/React.createElement("h2", null, "Preguntas y ajustes"), /*#__PURE__*/React.createElement("div", {
    className: "adm-est"
  }, preguntas.length, " ", preguntas.length === 1 ? "pregunta" : "preguntas", totalSeg > 0 && ` · unos ${mins} min de ronda`), /*#__PURE__*/React.createElement("div", {
    className: "adm-acc"
  }, /*#__PURE__*/React.createElement("button", {
    className: "pri",
    onClick: () => setEditando({})
  }, "Agregar pregunta"), /*#__PURE__*/React.createElement("button", {
    onClick: onCerrar
  }, "Volver al panel")), aviso && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      fontSize: ".88rem",
      color: "var(--mostaza)"
    }
  }, aviso)), hayRespuestas && /*#__PURE__*/React.createElement("div", {
    className: "tarjeta",
    style: {
      marginBottom: 18,
      borderColor: "rgba(226,89,63,.4)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: ".9rem",
      lineHeight: 1.55
    }
  }, /*#__PURE__*/React.createElement("b", null, "Ya hay respuestas guardadas."), " Si cambias una pregunta ahora, las respuestas viejas quedan asociadas a un enunciado que nadie vio. Para armar un sondeo distinto, guarda el pulso actual y reinícialo antes de editar.")), /*#__PURE__*/React.createElement("div", {
    className: "tarjeta",
    style: {
      marginBottom: 18
    }
  }, preguntas.length === 0 && /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--tenue)",
      fontSize: ".92rem",
      margin: 0
    }
  }, "No hay preguntas todavía. Agrega la primera con el botón de arriba."), preguntas.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      padding: "14px 0",
      borderBottom: i < preguntas.length - 1 ? "1px solid var(--linea)" : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--display)",
      color: "var(--dorado)",
      fontSize: ".95rem",
      minWidth: 22,
      flexShrink: 0
    }
  }, i + 1), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: ".97rem",
      lineHeight: 1.4
    }
  }, p.enunciado), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: ".8rem",
      color: "var(--tenue)",
      marginTop: 5
    }
  }, nombreTipo(p.tipo), " · ", p.segundos ? p.segundos + " s" : "sin límite", p.resultados_visibles === "siempre" && " · resultados siempre visibles", p.resultados_visibles === "al_cerrar" && " · resultados al cerrar")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 5,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "rep-btn",
    style: {
      width: 32,
      height: 32,
      fontSize: ".9rem"
    },
    onClick: () => mover(i, -1),
    disabled: i === 0,
    "aria-label": "Subir"
  }, "↑"), /*#__PURE__*/React.createElement("button", {
    className: "rep-btn",
    style: {
      width: 32,
      height: 32,
      fontSize: ".9rem"
    },
    onClick: () => mover(i, 1),
    disabled: i === preguntas.length - 1,
    "aria-label": "Bajar"
  }, "↓"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      marginTop: 10,
      paddingLeft: 34
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      fontSize: ".84rem",
      color: "var(--verde)",
      fontWeight: 500,
      textDecoration: "underline",
      textUnderlineOffset: 3
    },
    onClick: () => setEditando(p)
  }, "Editar"), /*#__PURE__*/React.createElement("button", {
    style: {
      fontSize: ".84rem",
      color: "var(--verde)",
      fontWeight: 500,
      textDecoration: "underline",
      textUnderlineOffset: 3
    },
    onClick: () => duplicar(p)
  }, "Duplicar"), /*#__PURE__*/React.createElement("button", {
    style: {
      fontSize: ".84rem",
      color: "var(--coral)",
      fontWeight: 500,
      textDecoration: "underline",
      textUnderlineOffset: 3
    },
    onClick: () => eliminar(p)
  }, "Eliminar"))))), /*#__PURE__*/React.createElement("div", {
    className: "tarjeta"
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "1.1rem",
      marginBottom: 4
    }
  }, "Ajustes generales"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--tenue)",
      fontSize: ".88rem",
      marginTop: 0
    }
  }, "Lo que ve la gente al entrar. Sirve para cualquier tema, no solo lecturas."), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontSize: ".84rem",
      fontWeight: 500,
      margin: "14px 0 7px"
    }
  }, "Título"), /*#__PURE__*/React.createElement("input", {
    className: "campo",
    value: ajustes.titulo,
    placeholder: "Nuestras próximas lecturas",
    onChange: e => setAjustes({
      ...ajustes,
      titulo: e.target.value
    })
  }), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontSize: ".84rem",
      fontWeight: 500,
      margin: "14px 0 7px"
    }
  }, "Bajada"), /*#__PURE__*/React.createElement("input", {
    className: "campo",
    value: ajustes.bajada,
    placeholder: "Frase breve en la pantalla de ingreso",
    onChange: e => setAjustes({
      ...ajustes,
      bajada: e.target.value
    })
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      marginTop: 18
    },
    onClick: guardarAjustes
  }, "Guardar ajustes")));
}
window.PulsoEditor = PulsoEditor;