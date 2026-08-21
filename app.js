/* Compilado desde app.jsx. Este es el archivo que corre el navegador. */
const {
  useState,
  useEffect,
  useRef,
  useCallback
} = React;

/* ============================================================
   CLIENTE Y UTILIDADES
   ============================================================ */

const LLAVE = CONFIG.SUPABASE_PUBLISHABLE_KEY || CONFIG.SUPABASE_ANON_KEY;
let sb;
try {
  sb = supabase.createClient(CONFIG.SUPABASE_URL, LLAVE);
} catch (e) {
  if (window.__pintarError) {
    window.__pintarError("No se pudo conectar con Supabase", e.message + "\n\nRevisa que SUPABASE_URL en config.js sea la dirección completa, con https://");
  }
  throw e;
}
const LS = {
  get(k, d) {
    try {
      const v = localStorage.getItem(k);
      return v === null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  }
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
const AJ = () => window.__AJUSTES || {};
const TITULO = () => AJ().titulo || CONFIG.TITULO || "Sondeo";
const BAJADA = () => AJ().bajada !== undefined && AJ().bajada !== null ? AJ().bajada : (CONFIG.BAJADA || "");

const ROMANOS = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
function fechaLegible(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

/* ============================================================
   AVATARES — 15 aves en ciclo no repetitivo
   ============================================================ */

function Ave({
  i = 0,
  size = 28
}) {
  const forma = (i % 15 + 15) % 15 % 5;
  const color = COLORES_AVE[Math.floor((i % 15 + 15) % 15 / 5) % 3];
  const cuerpos = [/*#__PURE__*/React.createElement("g", {
    key: "0"
  }, /*#__PURE__*/React.createElement("ellipse", {
    cx: "10.5",
    cy: "14",
    rx: "6.5",
    ry: "5.6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15.5",
    cy: "8.6",
    r: "3.9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18.8 7.6 L23 8.9 L18.8 10.2 Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4.6 12.4 L1 9.6 L4 15.6 Z"
  })), /*#__PURE__*/React.createElement("g", {
    key: "1"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1.5 15.5 Q7.5 6.5 12 12.8 Q16.5 6.5 22.5 15.5 Q16.5 12.2 12 16.4 Q7.5 12.2 1.5 15.5 Z"
  })), /*#__PURE__*/React.createElement("g", {
    key: "2"
  }, /*#__PURE__*/React.createElement("ellipse", {
    cx: "12",
    cy: "12",
    rx: "5.2",
    ry: "4.3"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15.8",
    cy: "8.4",
    r: "3.1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18.4 7.6 L23.5 8.6 L18.4 9.8 Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7.6 13.6 L1.5 20.5 L4.4 20.8 L9.4 15.4 Z"
  })), /*#__PURE__*/React.createElement("g", {
    key: "3"
  }, /*#__PURE__*/React.createElement("ellipse", {
    cx: "11",
    cy: "11",
    rx: "6",
    ry: "4.4"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "7.4",
    r: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18.6 6.8 L23 7.8 L18.6 8.9 Z"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "8.4",
    y: "14.4",
    width: "1.5",
    height: "7.4",
    rx: ".7"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "12.6",
    y: "14.4",
    width: "1.5",
    height: "7.4",
    rx: ".7"
  })), /*#__PURE__*/React.createElement("g", {
    key: "4"
  }, /*#__PURE__*/React.createElement("ellipse", {
    cx: "12",
    cy: "14",
    rx: "7",
    ry: "6.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.4 8.6 L5 3.6 L9.6 6.6 Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17.6 8.6 L19 3.6 L14.4 6.6 Z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9.4",
    cy: "12.4",
    r: "1.6",
    fill: "#FFFDF7"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "14.6",
    cy: "12.4",
    r: "1.6",
    fill: "#FFFDF7"
  }))];
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: color,
    style: {
      flexShrink: 0,
      display: "block"
    },
    "aria-hidden": "true"
  }, cuerpos[forma]);
}
function colorAve(i) {
  return COLORES_AVE[Math.floor((i % 15 + 15) % 15 / 5) % 3];
}

/* ============================================================
   CONTADOR EN VIVO
   ============================================================ */

function Contador({
  total
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "contador"
  }, /*#__PURE__*/React.createElement("span", {
    className: "contador-num"
  }, total), /*#__PURE__*/React.createElement("span", {
    className: "contador-txt"
  }, total === 1 ? "respuesta" : "respuestas"), /*#__PURE__*/React.createElement("span", {
    className: "pista"
  }, /*#__PURE__*/React.createElement("i", null)));
}

/* ============================================================
   CONTROLES POR TIPO DE PREGUNTA
   ============================================================ */

function ControlPalabra({
  cfg,
  valor,
  setValor
}) {
  const max = cfg.max_caracteres || 20;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
    className: "campo",
    style: {
      fontFamily: "var(--display)",
      fontSize: "1.4rem",
      textAlign: "center"
    },
    value: valor || "",
    maxLength: max,
    autoComplete: "off",
    placeholder: "Una palabra",
    onChange: e => setValor(e.target.value.replace(/\s+/g, " ").trimStart())
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: ".8rem",
      color: "var(--tenue)",
      textAlign: "right",
      marginTop: 6
    }
  }, (valor || "").length, "/", max));
}
function ControlDilema({
  cfg,
  valor,
  setValor
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "dilema"
  }, cfg.opciones.map(o => /*#__PURE__*/React.createElement("button", {
    key: o,
    className: valor === o ? "sel" : "",
    onClick: () => setValor(o),
    "aria-pressed": valor === o
  }, o)));
}
function ControlOpcionUnica({
  cfg,
  valor,
  setValor
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ops"
  }, cfg.opciones.map(o => /*#__PURE__*/React.createElement("button", {
    key: o,
    className: "op" + (valor === o ? " sel" : ""),
    onClick: () => setValor(o),
    "aria-pressed": valor === o
  }, /*#__PURE__*/React.createElement("span", {
    className: "marca"
  }), /*#__PURE__*/React.createElement("span", null, o))));
}
function ControlMultiple({
  cfg,
  valor,
  setValor
}) {
  const sel = valor || [];
  const max = cfg.max_selecciones || 2;
  const alternar = o => {
    if (sel.includes(o)) setValor(sel.filter(x => x !== o));else if (sel.length < max) setValor([...sel, o]);
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ops"
  }, cfg.opciones.map(o => {
    const activa = sel.includes(o);
    const bloq = !activa && sel.length >= max;
    return /*#__PURE__*/React.createElement("button", {
      key: o,
      className: "op cuad" + (activa ? " sel" : "") + (bloq ? " bloq" : ""),
      onClick: () => alternar(o),
      "aria-pressed": activa
    }, /*#__PURE__*/React.createElement("span", {
      className: "marca"
    }), /*#__PURE__*/React.createElement("span", null, o));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: ".84rem",
      color: "var(--tenue)",
      marginTop: 10,
      textAlign: "right"
    }
  }, sel.length, " de ", max));
}
function ControlPlano({
  cfg,
  valor,
  setValor
}) {
  const caja = useRef(null);
  const marcar = e => {
    const r = caja.current.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    const x = Math.min(1, Math.max(-1, (p.clientX - r.left) / r.width * 2 - 1));
    const y = Math.min(1, Math.max(-1, 1 - (p.clientY - r.top) / r.height * 2));
    setValor({
      x: +x.toFixed(3),
      y: +y.toFixed(3)
    });
  };
  const ex = cfg.eje_x,
    ey = cfg.eje_y;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "plano",
    ref: caja,
    onClick: marcar,
    onTouchStart: marcar,
    onTouchMove: marcar,
    role: "application",
    "aria-label": "Plano de dos ejes. Toca para ubicar tu respuesta."
  }, /*#__PURE__*/React.createElement("span", {
    className: "ejeh"
  }), /*#__PURE__*/React.createElement("span", {
    className: "ejev"
  }), /*#__PURE__*/React.createElement("span", {
    className: "rot",
    style: {
      left: 12,
      top: "50%",
      transform: "translateY(-50%)"
    }
  }, ex.izquierda), /*#__PURE__*/React.createElement("span", {
    className: "rot",
    style: {
      right: 12,
      top: "50%",
      transform: "translateY(-50%)"
    }
  }, ex.derecha), /*#__PURE__*/React.createElement("span", {
    className: "rot",
    style: {
      top: 12,
      left: "50%",
      transform: "translateX(-50%)"
    }
  }, ey.arriba), /*#__PURE__*/React.createElement("span", {
    className: "rot",
    style: {
      bottom: 12,
      left: "50%",
      transform: "translateX(-50%)"
    }
  }, ey.abajo), valor && /*#__PURE__*/React.createElement("span", {
    className: "marcador",
    style: {
      left: `${(valor.x + 1) / 2 * 100}%`,
      top: `${(1 - valor.y) / 2 * 100}%`
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "glosas"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glosa"
  }, /*#__PURE__*/React.createElement("b", null, ex.izquierda, ":"), " ", ex.glosa_izquierda), /*#__PURE__*/React.createElement("div", {
    className: "glosa"
  }, /*#__PURE__*/React.createElement("b", null, ex.derecha, ":"), " ", ex.glosa_derecha), /*#__PURE__*/React.createElement("div", {
    className: "glosa"
  }, /*#__PURE__*/React.createElement("b", null, ey.arriba, ":"), " ", ey.glosa_arriba), /*#__PURE__*/React.createElement("div", {
    className: "glosa"
  }, /*#__PURE__*/React.createElement("b", null, ey.abajo, ":"), " ", ey.glosa_abajo)));
}
function ControlReparto({
  cfg,
  valor,
  setValor
}) {
  const total = cfg.total || 10;
  const v = valor || cfg.opciones.reduce((a, o) => ({
    ...a,
    [o]: 0
  }), {});
  const usado = Object.values(v).reduce((a, b) => a + b, 0);
  const resto = total - usado;
  const mover = (o, d) => {
    const n = Math.max(0, (v[o] || 0) + d);
    if (d > 0 && resto <= 0) return;
    setValor({
      ...v,
      [o]: n
    });
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "rep-resto"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: ".9rem"
    }
  }, resto === 0 ? "Ya repartiste todo" : "Puntos por repartir"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: resto === 0 ? "var(--teal)" : "var(--verde-oscuro)"
    }
  }, resto)), cfg.opciones.map(o => /*#__PURE__*/React.createElement("div", {
    className: "rep-fila",
    key: o
  }, /*#__PURE__*/React.createElement("span", {
    className: "rep-nom"
  }, o), /*#__PURE__*/React.createElement("span", {
    className: "rep-ctrl"
  }, /*#__PURE__*/React.createElement("button", {
    className: "rep-btn",
    onClick: () => mover(o, -1),
    disabled: !v[o],
    "aria-label": "Quitar un punto a " + o
  }, "−"), /*#__PURE__*/React.createElement("span", {
    className: "rep-val"
  }, v[o] || 0), /*#__PURE__*/React.createElement("button", {
    className: "rep-btn",
    onClick: () => mover(o, 1),
    disabled: resto <= 0,
    "aria-label": "Sumar un punto a " + o
  }, "+")))));
}
function ControlParrafo({
  cfg,
  valor,
  setValor
}) {
  const v = valor || {
    titulo: "",
    texto: ""
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "campo",
    placeholder: cfg.campo_titulo || "Título",
    value: v.titulo,
    onChange: e => setValor({
      ...v,
      titulo: e.target.value
    })
  }), /*#__PURE__*/React.createElement("textarea", {
    className: "campo",
    placeholder: cfg.campo_texto || "Cuéntanos",
    value: v.texto,
    onChange: e => setValor({
      ...v,
      texto: e.target.value
    })
  }));
}
const CONTROLES = {
  palabra_unica: ControlPalabra,
  dilema_binario: ControlDilema,
  opcion_unica: ControlOpcionUnica,
  seleccion_multiple: ControlMultiple,
  coordenada_2d: ControlPlano,
  reparto_puntos: ControlReparto,
  parrafo: ControlParrafo
};
function esValida(tipo, valor, cfg) {
  if (valor === null || valor === undefined) return false;
  switch (tipo) {
    case "palabra_unica":
      return String(valor).trim().length > 0;
    case "dilema_binario":
    case "opcion_unica":
      return !!valor;
    case "seleccion_multiple":
      return Array.isArray(valor) && valor.length > 0;
    case "coordenada_2d":
      return typeof valor.x === "number";
    case "reparto_puntos":
      return Object.values(valor || {}).reduce((a, b) => a + b, 0) === (cfg.total || 10);
    case "parrafo":
      return (valor.titulo || "").trim().length > 0 && (valor.texto || "").trim().length > 0;
    default:
      return false;
  }
}
function mensajeInvalido(tipo, valor, cfg) {
  switch (tipo) {
    case "palabra_unica":
      return "Escribe una palabra para continuar";
    case "dilema_binario":
      return "Elige uno de los dos";
    case "opcion_unica":
      return "Elige una opción";
    case "seleccion_multiple":
      return "Elige al menos una opción";
    case "coordenada_2d":
      return "Toca el plano para ubicar tu respuesta";
    case "reparto_puntos":
      {
        const usado = Object.values(valor || {}).reduce((a, b) => a + b, 0);
        return `Te faltan ${(cfg.total || 10) - usado} puntos por repartir`;
      }
    case "parrafo":
      return "Completa el título y el texto";
    default:
      return "Falta completar la respuesta";
  }
}

/* ============================================================
   VISUALIZACIÓN DE RESULTADOS
   ============================================================ */

function ResNube({
  respuestas
}) {
  const cuenta = {};
  respuestas.forEach(r => {
    const p = String(r.valor).trim().toLowerCase();
    if (!p) return;
    cuenta[p] = (cuenta[p] || 0) + 1;
  });
  const lista = Object.entries(cuenta).sort((a, b) => b[1] - a[1]);
  if (!lista.length) return /*#__PURE__*/React.createElement(Vacio, null);
  const max = lista[0][1];
  return /*#__PURE__*/React.createElement("div", {
    className: "nube"
  }, lista.map(([p, n], i) => /*#__PURE__*/React.createElement("span", {
    key: p,
    title: n + (n === 1 ? " vez" : " veces"),
    style: {
      fontSize: (17 + n / max * 30).toFixed(0) + "px",
      color: PALETA[i % PALETA.length],
      fontWeight: n > max / 2 ? 600 : 400
    }
  }, p)));
}
function ResMedidor({
  respuestas,
  cfg
}) {
  const [a, b] = cfg.opciones;
  const na = respuestas.filter(r => r.valor === a).length;
  const nb = respuestas.filter(r => r.valor === b).length;
  const t = na + nb;
  if (!t) return /*#__PURE__*/React.createElement(Vacio, null);
  const pa = Math.round(na / t * 100);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "medidor"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flexGrow: Math.max(na, 0.12),
      background: "var(--teal)",
      color: "#F7F4EC"
    }
  }, pa, "%"), /*#__PURE__*/React.createElement("div", {
    style: {
      flexGrow: Math.max(nb, 0.12),
      background: "var(--terracota)",
      color: "#FFFDF7"
    }
  }, 100 - pa, "%")), /*#__PURE__*/React.createElement("div", {
    className: "medidor-pies"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--teal)"
    }
  }, "■"), " ", a, " · ", na), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "right"
    }
  }, b, " · ", nb, " ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--terracota)"
    }
  }, "■"))));
}
function ResBarras({
  respuestas,
  cfg,
  multiple
}) {
  const cuenta = {};
  cfg.opciones.forEach(o => cuenta[o] = 0);
  respuestas.forEach(r => {
    const vs = multiple ? r.valor : [r.valor];
    (vs || []).forEach(v => {
      if (cuenta[v] !== undefined) cuenta[v]++;
    });
  });
  const lista = Object.entries(cuenta).sort((a, b) => b[1] - a[1]);
  const total = respuestas.length;
  if (!total) return /*#__PURE__*/React.createElement(Vacio, null);
  const max = Math.max(...lista.map(x => x[1]), 1);
  let duplas = null;
  if (multiple) {
    const c = {};
    respuestas.forEach(r => {
      if (Array.isArray(r.valor) && r.valor.length === 2) {
        const k = [...r.valor].sort().join(" + ");
        c[k] = (c[k] || 0) + 1;
      }
    });
    const top = Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 2).filter(x => x[1] > 1);
    if (top.length) duplas = top;
  }
  return /*#__PURE__*/React.createElement("div", null, lista.map(([o, n], i) => /*#__PURE__*/React.createElement("div", {
    className: "barra-fila",
    key: o
  }, /*#__PURE__*/React.createElement("div", {
    className: "barra-top"
  }, /*#__PURE__*/React.createElement("span", null, o), /*#__PURE__*/React.createElement("b", null, n, " · ", Math.round(n / total * 100), "%")), /*#__PURE__*/React.createElement("div", {
    className: "barra"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: n / max * 100 + "%",
      background: PALETA[i % PALETA.length]
    }
  })))), duplas && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: ".86rem",
      color: "var(--tenue)",
      marginTop: 14
    }
  }, "Duplas más elegidas: ", duplas.map(([k, n]) => `${k} (${n})`).join(" · ")));
}
function ResDispersion({
  respuestas,
  cfg,
  participantes
}) {
  if (!respuestas.length) return /*#__PURE__*/React.createElement(Vacio, null);
  const ex = cfg.eje_x,
    ey = cfg.eje_y;
  const px = respuestas.reduce((a, r) => a + r.valor.x, 0) / respuestas.length;
  const py = respuestas.reduce((a, r) => a + r.valor.y, 0) / respuestas.length;
  const cuad = r => r.valor.y >= 0 ? r.valor.x < 0 ? "íntimo y luminoso" : "coral y luminoso" : r.valor.x < 0 ? "íntimo y oscuro" : "coral y oscuro";
  const c = {};
  respuestas.forEach(r => {
    const k = cuad(r);
    c[k] = (c[k] || 0) + 1;
  });
  const dom = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "disp"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      top: "50%",
      height: 1,
      background: "var(--linea)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: "50%",
      width: 1,
      background: "var(--linea)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "rot",
    style: {
      position: "absolute",
      left: 10,
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: ".7rem",
      color: "var(--tenue)",
      textTransform: "uppercase",
      letterSpacing: ".1em"
    }
  }, ex.izquierda), /*#__PURE__*/React.createElement("span", {
    className: "rot",
    style: {
      position: "absolute",
      right: 10,
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: ".7rem",
      color: "var(--tenue)",
      textTransform: "uppercase",
      letterSpacing: ".1em"
    }
  }, ex.derecha), /*#__PURE__*/React.createElement("span", {
    className: "rot",
    style: {
      position: "absolute",
      top: 10,
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: ".7rem",
      color: "var(--tenue)",
      textTransform: "uppercase",
      letterSpacing: ".1em"
    }
  }, ey.arriba), /*#__PURE__*/React.createElement("span", {
    className: "rot",
    style: {
      position: "absolute",
      bottom: 10,
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: ".7rem",
      color: "var(--tenue)",
      textTransform: "uppercase",
      letterSpacing: ".1em"
    }
  }, ey.abajo), respuestas.map((r, i) => {
    const p = participantes[r.dispositivo];
    return /*#__PURE__*/React.createElement("span", {
      className: "pt",
      key: i,
      style: {
        left: `${(r.valor.x + 1) / 2 * 100}%`,
        top: `${(1 - r.valor.y) / 2 * 100}%`,
        background: p ? colorAve(p.avatar) : "var(--salvia)"
      }
    });
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: `${(px + 1) / 2 * 100}%`,
      top: `${(1 - py) / 2 * 100}%`,
      width: 34,
      height: 34,
      borderRadius: "50%",
      transform: "translate(-50%,-50%)",
      border: "2px dashed var(--coral)",
      pointerEvents: "none"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: ".86rem",
      color: "var(--tenue)",
      marginTop: 12
    }
  }, "El círculo punteado marca el promedio del grupo.", dom && ` La zona más elegida fue ${dom[0]} (${dom[1]} de ${respuestas.length}).`));
}
function ResReparto({
  respuestas,
  cfg
}) {
  if (!respuestas.length) return /*#__PURE__*/React.createElement(Vacio, null);
  const sum = {};
  cfg.opciones.forEach(o => sum[o] = 0);
  let concentrados = 0;
  respuestas.forEach(r => {
    let maxv = 0;
    cfg.opciones.forEach(o => {
      const v = r.valor && r.valor[o] || 0;
      sum[o] += v;
      if (v > maxv) maxv = v;
    });
    if (maxv >= 5) concentrados++;
  });
  const lista = Object.entries(sum).sort((a, b) => b[1] - a[1]);
  const totalPuntos = lista.reduce((a, b) => a + b[1], 0) || 1;
  const max = Math.max(...lista.map(x => x[1]), 1);
  return /*#__PURE__*/React.createElement("div", null, lista.map(([o, n], i) => /*#__PURE__*/React.createElement("div", {
    className: "barra-fila",
    key: o
  }, /*#__PURE__*/React.createElement("div", {
    className: "barra-top"
  }, /*#__PURE__*/React.createElement("span", null, o), /*#__PURE__*/React.createElement("b", null, (n / respuestas.length).toFixed(1), " pts · ", Math.round(n / totalPuntos * 100), "%")), /*#__PURE__*/React.createElement("div", {
    className: "barra"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: n / max * 100 + "%",
      background: PALETA[i % PALETA.length]
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: ".86rem",
      color: "var(--tenue)",
      marginTop: 14
    }
  }, "Promedio de puntos por persona. ", concentrados, " de ", respuestas.length, " ", concentrados === 1 ? "concentró" : "concentraron", " 5 o más puntos en una sola opción."));
}
function Tarjeta({
  r,
  p
}) {
  const [abierta, setAbierta] = useState(false);
  const largo = (r.valor.texto || "").length > 260;
  return /*#__PURE__*/React.createElement("div", {
    className: "tar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tar-cab"
  }, /*#__PURE__*/React.createElement(Ave, {
    i: p ? p.avatar : 0,
    size: 30
  }), /*#__PURE__*/React.createElement("span", {
    className: "tar-nom"
  }, p && p.nombre ? p.nombre : "Anónimo")), /*#__PURE__*/React.createElement("div", {
    className: "tar-tit"
  }, r.valor.titulo), /*#__PURE__*/React.createElement("div", {
    className: "tar-txt" + (largo && !abierta ? " corta" : "")
  }, r.valor.texto), largo && /*#__PURE__*/React.createElement("button", {
    className: "tar-mas",
    onClick: () => setAbierta(!abierta)
  }, abierta ? "Mostrar menos" : "Leer completo"));
}
function ResGrid({
  respuestas,
  participantes
}) {
  if (!respuestas.length) return /*#__PURE__*/React.createElement(Vacio, null);
  return /*#__PURE__*/React.createElement("div", {
    className: "grid-tar"
  }, respuestas.map((r, i) => /*#__PURE__*/React.createElement(Tarjeta, {
    key: i,
    r: r,
    p: participantes[r.dispositivo]
  })));
}
function Vacio() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--tenue)",
      fontSize: ".92rem",
      padding: "16px 0"
    }
  }, "Nadie respondió esta pregunta.");
}
function Resultado({
  pregunta,
  respuestas,
  participantes
}) {
  const cfg = pregunta.config || {};
  switch (pregunta.tipo) {
    case "palabra_unica":
      return /*#__PURE__*/React.createElement(ResNube, {
        respuestas: respuestas
      });
    case "dilema_binario":
      return /*#__PURE__*/React.createElement(ResMedidor, {
        respuestas: respuestas,
        cfg: cfg
      });
    case "opcion_unica":
      return /*#__PURE__*/React.createElement(ResBarras, {
        respuestas: respuestas,
        cfg: cfg
      });
    case "seleccion_multiple":
      return /*#__PURE__*/React.createElement(ResBarras, {
        respuestas: respuestas,
        cfg: cfg,
        multiple: true
      });
    case "coordenada_2d":
      return /*#__PURE__*/React.createElement(ResDispersion, {
        respuestas: respuestas,
        cfg: cfg,
        participantes: participantes
      });
    case "reparto_puntos":
      return /*#__PURE__*/React.createElement(ResReparto, {
        respuestas: respuestas,
        cfg: cfg
      });
    case "parrafo":
      return /*#__PURE__*/React.createElement(ResGrid, {
        respuestas: respuestas,
        participantes: participantes
      });
    default:
      return null;
  }
}
function BloqueResultado({
  pregunta,
  respuestas,
  participantes
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "res-bloque"
  }, /*#__PURE__*/React.createElement("div", {
    className: "res-preg"
  }, pregunta.enunciado), /*#__PURE__*/React.createElement("div", {
    className: "res-meta"
  }, "Pregunta ", ROMANOS[pregunta.orden], " · ", respuestas.length, " ", respuestas.length === 1 ? "respuesta" : "respuestas"), /*#__PURE__*/React.createElement(Resultado, {
    pregunta: pregunta,
    respuestas: respuestas,
    participantes: participantes
  }));
}

/* ============================================================
   PANTALLA DE INGRESO
   ============================================================ */

function Ingreso({
  onEntrar
}) {
  const [nombre, setNombre] = useState(LS.get("pulso_nombre", ""));
  const [anon, setAnon] = useState(LS.get("pulso_anonimo", false));
  const [err, setErr] = useState("");
  const [cargando, setCargando] = useState(false);
  const entrar = async () => {
    if (!anon && !nombre.trim()) {
      setErr("Escribe tu nombre o elige responder en anónimo");
      return;
    }
    setErr("");
    setCargando(true);
    try {
      await onEntrar(nombre.trim(), anon);
    } catch (e) {
      setErr("No pudimos registrarte. Revisa la conexión e inténtalo otra vez.");
      setCargando(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "tarjeta",
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "1.3rem",
      marginBottom: 6
    }
  }, "Antes de empezar"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--tenue)",
      fontSize: ".95rem",
      marginTop: 0,
      marginBottom: 20
    }
  }, BAJADA()), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontSize: ".88rem",
      fontWeight: 500,
      marginBottom: 8
    }
  }, "¿Cómo te llamas?"), /*#__PURE__*/React.createElement("input", {
    className: "campo",
    value: nombre,
    disabled: anon,
    placeholder: anon ? "Vas a responder en anónimo" : "Tu nombre",
    onChange: e => {
      setNombre(e.target.value);
      setErr("");
    },
    style: {
      opacity: anon ? .5 : 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "op cuad" + (anon ? " sel" : ""),
    style: {
      marginTop: 14
    },
    onClick: () => {
      setAnon(!anon);
      setErr("");
    },
    "aria-pressed": anon
  }, /*#__PURE__*/React.createElement("span", {
    className: "marca"
  }), /*#__PURE__*/React.createElement("span", null, "Prefiero responder en anónimo")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: ".84rem",
      color: "var(--tenue)",
      marginTop: 10
    }
  }, "Nadie ve las respuestas de los demás hasta que la pregunta se cierra. Si eliges el anonimato, tu nombre no se guarda en ningún lado."), err && /*#__PURE__*/React.createElement("div", {
    className: "error"
  }, err), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      width: "100%",
      marginTop: 18
    },
    onClick: entrar,
    disabled: cargando
  }, cargando ? "Entrando…" : "Entrar"));
}

/* ============================================================
   PREGUNTA ACTIVA
   ============================================================ */

function PreguntaActiva({
  pregunta,
  corrida,
  conteo,
  yaRespondio,
  onEnviar,
  onVolver,
  hayCerradas
}) {
  const [valor, setValor] = useState(null);
  const [err, setErr] = useState("");
  const [enviando, setEnviando] = useState(false);
  const cfg = pregunta.config || {};
  const Control = CONTROLES[pregunta.tipo];
  useEffect(() => {
    setValor(null);
    setErr("");
  }, [pregunta.id]);
  const enviar = async () => {
    if (!esValida(pregunta.tipo, valor, cfg)) {
      setErr(mensajeInvalido(pregunta.tipo, valor, cfg));
      return;
    }
    setErr("");
    setEnviando(true);
    try {
      await onEnviar(pregunta, valor);
    } catch (e) {
      setErr(e && e.code === "23505" ? "Ya habías respondido esta pregunta." : "No se pudo enviar. Puede que la pregunta ya esté cerrada.");
      setEnviando(false);
    }
  };
  if (yaRespondio) {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "tarjeta"
    }, /*#__PURE__*/React.createElement("div", {
      className: "preg-num"
    }, "Pregunta ", ROMANOS[pregunta.orden]), /*#__PURE__*/React.createElement("div", {
      className: "preg-txt"
    }, pregunta.enunciado), /*#__PURE__*/React.createElement("div", {
      className: "ok",
      style: {
        marginTop: 20
      }
    }, "Tu respuesta quedó registrada."), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--tenue)",
        fontSize: ".92rem",
        marginTop: 14,
        marginBottom: 18
      }
    }, "Los resultados aparecen cuando se cierra la pregunta."), /*#__PURE__*/React.createElement(Contador, {
      total: conteo
    })), hayCerradas && /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        marginTop: 20
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn-fant",
      onClick: onVolver
    }, "Ver las preguntas cerradas")));
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "tarjeta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "preg-num"
  }, "Pregunta ", ROMANOS[pregunta.orden]), /*#__PURE__*/React.createElement("div", {
    className: "preg-txt"
  }, pregunta.enunciado), pregunta.ayuda && /*#__PURE__*/React.createElement("div", {
    className: "preg-ayuda"
  }, pregunta.ayuda), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement(Control, {
    cfg: cfg,
    valor: valor,
    setValor: v => {
      setValor(v);
      setErr("");
    }
  })), err && /*#__PURE__*/React.createElement("div", {
    className: "error"
  }, err), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      width: "100%",
      marginTop: 20
    },
    onClick: enviar,
    disabled: enviando
  }, enviando ? "Enviando…" : "Enviar mi respuesta"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22,
      paddingTop: 18,
      borderTop: "1px solid var(--linea)"
    }
  }, /*#__PURE__*/React.createElement(Contador, {
    total: conteo
  }))), hayCerradas && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-fant",
    onClick: onVolver
  }, "Ver las preguntas cerradas")));
}

/* ============================================================
   INFORME IMPRIMIBLE
   ============================================================ */

function Informe({
  corrida,
  preguntas,
  respuestas,
  participantes,
  onCerrar
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const porPregunta = p => respuestas.filter(r => r.pregunta_id === p.id);
  const personas = Object.values(participantes);
  const textoValor = (p, v) => {
    switch (p.tipo) {
      case "seleccion_multiple":
        return (v || []).join(" · ");
      case "coordenada_2d":
        return `x ${v.x} / y ${v.y}`;
      case "reparto_puntos":
        return Object.entries(v).filter(([, n]) => n > 0).map(([o, n]) => `${o}: ${n}`).join(" · ");
      case "parrafo":
        return `${v.titulo} — ${v.texto}`;
      default:
        return String(v);
    }
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "no-print",
    style: {
      display: "flex",
      gap: 9,
      flexWrap: "wrap",
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => window.print()
  }, "Descargar PDF"), /*#__PURE__*/React.createElement("button", {
    className: "btn-fant",
    onClick: () => {
      const esc = s => '"' + String(s === undefined || s === null ? "" : s).replace(/"/g, '""') + '"';
      const filas = [["Participante", "Anónimo", "Pregunta", "Tipo", "Respuesta", "Enviada"]];
      preguntas.forEach(p => {
        respuestas.filter(r => r.pregunta_id === p.id).forEach(r => {
          const per = participantes[r.dispositivo];
          filas.push([per && per.nombre ? per.nombre : "Anónimo", per && per.es_anonimo ? "sí" : "no", p.enunciado, p.tipo, textoValor(p, r.valor), r.creada_en]);
        });
      });
      const csv = "\uFEFF" + filas.map(f => f.map(esc).join(",")).join("\n");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      a.download = corrida.nombre.replace(/\s+/g, "_") + ".csv";
      a.click();
    }
  }, "Descargar CSV"), /*#__PURE__*/React.createElement("button", {
    className: "btn-fant",
    onClick: onCerrar
  }, "Volver al panel")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 30
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: "1.7rem"
    }
  }, corrida.nombre), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--tenue)",
      fontSize: ".9rem",
      marginTop: 6
    }
  }, fechaLegible(corrida.creada_en), " · ", personas.length, " ", personas.length === 1 ? "participante" : "participantes")), preguntas.map(p => /*#__PURE__*/React.createElement(BloqueResultado, {
    key: p.id,
    pregunta: p,
    respuestas: porPregunta(p),
    participantes: participantes
  })), /*#__PURE__*/React.createElement("div", {
    className: "pag"
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "1.3rem",
      marginTop: 40,
      marginBottom: 18
    }
  }, "Respuestas individuales"), personas.map(per => {
    const suyas = respuestas.filter(r => r.dispositivo === per.dispositivo);
    if (!suyas.length) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: per.id,
      style: {
        marginBottom: 26,
        breakInside: "avoid"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement(Ave, {
      i: per.avatar,
      size: 26
    }), /*#__PURE__*/React.createElement("b", {
      style: {
        fontFamily: "var(--display)",
        fontSize: "1.05rem",
        fontWeight: 500
      }
    }, per.nombre || "Anónimo")), preguntas.map(p => {
      const r = suyas.find(x => x.pregunta_id === p.id);
      if (!r) return null;
      return /*#__PURE__*/React.createElement("div", {
        key: p.id,
        style: {
          fontSize: ".9rem",
          lineHeight: 1.5,
          marginBottom: 7,
          paddingLeft: 12,
          borderLeft: "2px solid var(--linea)"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--tenue)"
        }
      }, ROMANOS[p.orden], ". "), textoValor(p, r.valor));
    }));
  }));
}

/* ============================================================
   PANEL DE ADMINISTRACIÓN
   ============================================================ */

function Admin({
  preguntas
}) {
  const [sesion, setSesion] = useState(null);
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [err, setErr] = useState("");
  const [corrida, setCorrida] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [participantes, setParticipantes] = useState({});
  const [conteos, setConteos] = useState({});
  const [historico, setHistorico] = useState([]);
  const [guardado, setGuardado] = useState(null);
  const [vista, setVista] = useState("panel");
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);
  useEffect(() => {
    sb.auth.getSession().then(({
      data
    }) => setSesion(data.session));
    const {
      data: sub
    } = sb.auth.onAuthStateChange((_e, s) => setSesion(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  const cargar = useCallback(async () => {
    const {
      data: c
    } = await sb.from("pulso_corridas").select("*").in("estado", ["en_vivo", "finalizada"]).order("creada_en", {
      ascending: false
    }).limit(1);
    const act = c && c[0];
    setCorrida(act || null);
    if (!act) return;
    const [{
      data: rs
    }, {
      data: ps
    }, {
      data: cs
    }, {
      data: hs
    }] = await Promise.all([sb.from("pulso_respuestas").select("*").eq("corrida_id", act.id), sb.from("pulso_participantes").select("*").eq("corrida_id", act.id), sb.from("pulso_conteos").select("*").eq("corrida_id", act.id), sb.from("pulso_historico").select("id,nombre,guardado_en").order("guardado_en", {
      ascending: false
    })]);
    setRespuestas(rs || []);
    const mapa = {};
    (ps || []).forEach(p => mapa[p.dispositivo] = p);
    setParticipantes(mapa);
    const cm = {};
    (cs || []).forEach(x => cm[x.pregunta_id] = x.total);
    setConteos(cm);
    setHistorico(hs || []);
  }, []);
  useEffect(() => {
    if (sesion) cargar();
  }, [sesion, cargar]);
  useEffect(() => {
    if (!sesion) return;
    const canal = sb.channel("admin-pulso").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "pulso_conteos"
    }, cargar).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "pulso_participantes"
    }, cargar).subscribe();
    return () => sb.removeChannel(canal);
  }, [sesion, cargar]);
  const entrar = async () => {
    setErr("");
    const {
      error
    } = await sb.auth.signInWithPassword({
      email,
      password: clave
    });
    if (error) setErr("Correo o contraseña incorrectos");
  };
  if (!sesion) {
    return /*#__PURE__*/React.createElement("div", {
      className: "tarjeta",
      style: {
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "1.25rem",
        marginBottom: 16
      }
    }, "Panel del administrador"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 11
      }
    }, /*#__PURE__*/React.createElement("input", {
      className: "campo",
      type: "email",
      placeholder: "Correo",
      value: email,
      onChange: e => setEmail(e.target.value)
    }), /*#__PURE__*/React.createElement("input", {
      className: "campo",
      type: "password",
      placeholder: "Contraseña",
      value: clave,
      onChange: e => setClave(e.target.value),
      onKeyDown: e => e.key === "Enter" && entrar()
    })), err && /*#__PURE__*/React.createElement("div", {
      className: "error"
    }, err), /*#__PURE__*/React.createElement("button", {
      className: "btn",
      style: {
        width: "100%",
        marginTop: 16
      },
      onClick: entrar
    }, "Entrar"), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: "#",
      style: {
        fontSize: ".86rem",
        color: "var(--tenue)"
      }
    }, "Volver al pulso")));
  }
  if (!corrida) return /*#__PURE__*/React.createElement("div", {
    className: "cargando"
  }, "No hay ninguna corrida. Crea una desde el panel de Supabase.");
  const total = preguntas.length;
  const activa = preguntas.find(p => p.orden === corrida.indice_activo);
  const cerradas = preguntas.filter(p => p.orden < corrida.indice_activo);
  const terminada = corrida.indice_activo > total;
  const cerrarPregunta = async () => {
    setOcupado(true);
    const nuevo = corrida.indice_activo + 1;
    await sb.from("pulso_corridas").update({
      indice_activo: nuevo,
      estado: nuevo > total ? "finalizada" : "en_vivo",
      cerrada_en: nuevo > total ? new Date().toISOString() : null
    }).eq("id", corrida.id);
    await cargar();
    setOcupado(false);
  };
  const guardar = async () => {
    setOcupado(true);
    const datos = {
      preguntas,
      respuestas,
      participantes: Object.values(participantes),
      creada_en: corrida.creada_en
    };
    const {
      error
    } = await sb.from("pulso_historico").insert({
      nombre: corrida.nombre,
      corrida_id: corrida.id,
      datos
    });
    setAviso(error ? "No se pudo guardar." : "Pulso guardado en el histórico.");
    await cargar();
    setOcupado(false);
    setTimeout(() => setAviso(""), 4000);
  };
  const reiniciar = async () => {
    if (!confirm("Se archiva este pulso y empieza uno nuevo con las mismas preguntas. ¿Continuar?")) return;
    setOcupado(true);
    await sb.from("pulso_corridas").update({
      estado: "archivada"
    }).eq("id", corrida.id);
    const f = new Date().toLocaleDateString("es", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    await sb.from("pulso_corridas").insert({
      nombre: "Pulso de lectura " + f,
      indice_activo: 1,
      estado: "en_vivo"
    });
    await cargar();
    setOcupado(false);
    setAviso("Pulso reiniciado. Los lectores ya pueden empezar de nuevo.");
    setTimeout(() => setAviso(""), 4000);
  };
  const descargarCSV = () => {
    const esc = s => '"' + String(s === undefined || s === null ? "" : s).replace(/"/g, '""') + '"';
    const filas = [["Participante", "Anónimo", "Pregunta", "Tipo", "Respuesta", "Enviada"]];
    respuestas.forEach(r => {
      const p = preguntas.find(x => x.id === r.pregunta_id);
      const per = participantes[r.dispositivo];
      filas.push([per && per.nombre ? per.nombre : "Anónimo", per && per.es_anonimo ? "sí" : "no", p ? p.enunciado : "", p ? p.tipo : "", typeof r.valor === "object" ? JSON.stringify(r.valor) : r.valor, r.creada_en]);
    });
    const csv = "\uFEFF" + filas.map(f => f.map(esc).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], {
      type: "text/csv;charset=utf-8"
    }));
    a.download = corrida.nombre.replace(/\s+/g, "_") + ".csv";
    a.click();
  };
  const abrirGuardado = async (id) => {
    setOcupado(true);
    const { data, error } = await sb.from("pulso_historico").select("*").eq("id", id).single();
    setOcupado(false);
    if (error || !data) {
      setAviso("No se pudo abrir ese pulso.");
      setTimeout(() => setAviso(""), 4000);
      return;
    }
    const d = data.datos || {};
    const mapa = {};
    (d.participantes || []).forEach(p => mapa[p.dispositivo] = p);
    setGuardado({
      corrida: { nombre: data.nombre, creada_en: d.creada_en || data.guardado_en },
      preguntas: d.preguntas || [],
      respuestas: d.respuestas || [],
      participantes: mapa
    });
  };
  if (guardado) {
    return /*#__PURE__*/React.createElement(Informe, {
      corrida: guardado.corrida,
      preguntas: guardado.preguntas,
      respuestas: guardado.respuestas,
      participantes: guardado.participantes,
      onCerrar: () => setGuardado(null)
    });
  }
  if (vista === "editor") {
    if (!window.PulsoEditor) {
      return /*#__PURE__*/React.createElement("div", {
        className: "cargando"
      }, "Falta editor.js. Súbelo junto a index.html.");
    }
    return /*#__PURE__*/React.createElement(window.PulsoEditor, {
      sb: sb,
      onCerrar: () => {
        setVista("panel");
        cargar();
      }
    });
  }
  if (vista === "informe") {
    return /*#__PURE__*/React.createElement(Informe, {
      corrida: corrida,
      preguntas: preguntas,
      respuestas: respuestas,
      participantes: participantes,
      onCerrar: () => setVista("panel")
    });
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "adm-barra"
  }, /*#__PURE__*/React.createElement("h2", null, corrida.nombre), /*#__PURE__*/React.createElement("div", {
    className: "adm-est"
  }, terminada ? `Ronda terminada · ${Object.keys(participantes).length} participantes` : `Pregunta ${corrida.indice_activo} de ${total} · ${Object.keys(participantes).length} participantes`), !terminada && activa && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      paddingTop: 14,
      borderTop: "1px solid rgba(247,244,236,.2)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--display)",
      fontSize: "1.05rem",
      lineHeight: 1.3
    }
  }, activa.enunciado), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontSize: ".9rem",
      opacity: .8
    }
  }, conteos[activa.id] || 0, " ", (conteos[activa.id] || 0) === 1 ? "respuesta recibida" : "respuestas recibidas")), /*#__PURE__*/React.createElement("div", {
    className: "adm-acc"
  }, !terminada && /*#__PURE__*/React.createElement("button", {
    className: "pri",
    onClick: cerrarPregunta,
    disabled: ocupado
  }, "Cerrar pregunta"), terminada && /*#__PURE__*/React.createElement("button", {
    className: "pri",
    onClick: guardar,
    disabled: ocupado
  }, "Guardar pulso"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setVista("editor")
  }, "Preguntas y ajustes"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setVista("informe")
  }, "Ver informe y PDF"), /*#__PURE__*/React.createElement("button", {
    onClick: descargarCSV
  }, "Descargar CSV"), /*#__PURE__*/React.createElement("button", {
    onClick: reiniciar,
    disabled: ocupado
  }, "Reiniciar pulso"), /*#__PURE__*/React.createElement("button", {
    onClick: () => sb.auth.signOut()
  }, "Salir")), aviso && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      fontSize: ".88rem",
      color: "var(--mostaza)"
    }
  }, aviso)), cerradas.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "tarjeta",
    style: {
      marginBottom: 22
    }
  }, cerradas.slice().reverse().map(p => /*#__PURE__*/React.createElement(BloqueResultado, {
    key: p.id,
    pregunta: p,
    respuestas: respuestas.filter(r => r.pregunta_id === p.id),
    participantes: participantes
  }))), /*#__PURE__*/React.createElement("div", {
    className: "tarjeta"
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "1.1rem",
      marginBottom: 12
    }
  }, "Histórico de pulsos"), historico.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--tenue)",
      fontSize: ".9rem",
      margin: 0
    }
  }, "Todavía no has guardado ninguno. Al terminar una ronda, presiona “Guardar pulso” y aparecerá acá.") : historico.map(h => /*#__PURE__*/React.createElement("button", {
    className: "hist-fila",
    key: h.id,
    style: {
      width: "100%",
      textAlign: "left",
      cursor: "pointer"
    },
    onClick: () => abrirGuardado(h.id)
  }, /*#__PURE__*/React.createElement("span", null, h.nombre), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--tenue)",
      fontSize: ".85rem",
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexShrink: 0
    }
  }, fechaLegible(h.guardado_en), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--dorado)"
    }
  }, "→"))))));
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
  const arranco = useRef(false);
  useEffect(() => {
    const h = () => setRuta(window.location.hash);
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  const cargar = useCallback(async () => {
    try {
      const { data: aj } = await sb.from("pulso_ajustes").select("*");
      if (aj) {
        const m = {};
        aj.forEach(x => m[x.clave] = x.valor);
        window.__AJUSTES = m;
      }
      const {
        data: pr,
        error: e1
      } = await sb.from("pulso_preguntas").select("*").order("orden");
      if (e1) throw e1;
      setPreguntas(pr || []);
      const {
        data: c
      } = await sb.from("pulso_corridas").select("*").in("estado", ["en_vivo", "finalizada"]).order("creada_en", {
        ascending: false
      }).limit(1);
      const act = c && c[0];
      setCorrida(act || null);
      if (!act) {
        setListo(true);
        return;
      }
      const [{
        data: ps
      }, {
        data: cs
      }, {
        data: rs
      }] = await Promise.all([sb.from("pulso_participantes").select("*").eq("corrida_id", act.id), sb.from("pulso_conteos").select("*").eq("corrida_id", act.id), sb.from("pulso_respuestas").select("*").eq("corrida_id", act.id)]);
      const mapa = {};
      (ps || []).forEach(p => mapa[p.dispositivo] = p);
      setParticipantes(mapa);
      setParticipante(mapa[DISPOSITIVO] || null);
      const cm = {};
      (cs || []).forEach(x => cm[x.pregunta_id] = x.total);
      setConteos(cm);
      setRespuestas(rs || []);
      setMias(LS.get("pulso_mias_" + act.id, []));
      arranco.current = true;
      setListo(true);
    } catch (e) {
      const msg = e && (e.message || e.hint) || "Error desconocido";
      window.__ultimoError = e;
      console.error("[pulso] falló la carga:", e);
      if (arranco.current) {
        setListo(true);
        return;
      }
      setFallo(/relation|does not exist|schema cache/i.test(msg) ? "Las tablas no existen todavía. Ejecuta schema.sql completo en el SQL Editor de Supabase." : /JWT|api key|Invalid/i.test(msg) ? "La llave de config.js no es válida para este proyecto. Copia de nuevo la publishable key." : "No pudimos conectarnos: " + msg);
      setListo(true);
    }
  }, []);
  useEffect(() => {
    cargar();
  }, [cargar]);
  const indiceRef = useRef(null);
  useEffect(() => {
    if (!corrida) return;
    if (indiceRef.current !== null && indiceRef.current !== corrida.indice_activo) setVista("feed");
    indiceRef.current = corrida.indice_activo;
  }, [corrida && corrida.indice_activo]);
  useEffect(() => {
    const canal = sb.channel("pulso-vivo").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "pulso_corridas"
    }, cargar).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "pulso_conteos"
    }, m => {
      const n = m.new;
      if (n && n.pregunta_id) setConteos(c => ({
        ...c,
        [n.pregunta_id]: n.total
      }));
    }).on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "pulso_participantes"
    }, m => {
      const n = m.new;
      if (n) setParticipantes(p => ({
        ...p,
        [n.dispositivo]: n
      }));
    }).subscribe();
    return () => sb.removeChannel(canal);
  }, [cargar]);
  const entrar = async (nombre, anon) => {
    LS.set("pulso_nombre", nombre);
    LS.set("pulso_anonimo", anon);
    const {
      data,
      error
    } = await sb.from("pulso_participantes").insert({
      corrida_id: corrida.id,
      dispositivo: DISPOSITIVO,
      nombre,
      es_anonimo: anon
    }).select().single();
    if (error) throw error;
    setParticipante(data);
    setParticipantes(p => ({
      ...p,
      [data.dispositivo]: data
    }));
  };
  const enviar = async (pregunta, valor) => {
    const {
      error
    } = await sb.from("pulso_respuestas").insert({
      corrida_id: corrida.id,
      pregunta_id: pregunta.id,
      dispositivo: DISPOSITIVO,
      valor
    });
    if (error) throw error;
    const nuevas = [...mias, pregunta.id];
    setMias(nuevas);
    LS.set("pulso_mias_" + corrida.id, nuevas);
    setConteos(c => ({
      ...c,
      [pregunta.id]: (c[pregunta.id] || 0) + 1
    }));
  };
  if (ruta === "#admin") {
    return /*#__PURE__*/React.createElement("div", {
      className: "env"
    }, /*#__PURE__*/React.createElement("header", {
      className: "cab"
    }, /*#__PURE__*/React.createElement("h1", null, TITULO()), /*#__PURE__*/React.createElement("div", {
      className: "sub"
    }, "Administración")), /*#__PURE__*/React.createElement(Admin, {
      preguntas: preguntas
    }));
  }
  const cabecera = /*#__PURE__*/React.createElement("header", {
    className: "cab"
  }, /*#__PURE__*/React.createElement("h1", null, TITULO()), corrida && /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, fechaLegible(corrida.creada_en)));
  if (!listo) return /*#__PURE__*/React.createElement("div", {
    className: "cargando"
  }, "Cargando…");
  if (fallo) {
    return /*#__PURE__*/React.createElement("div", {
      className: "env"
    }, cabecera, /*#__PURE__*/React.createElement("div", {
      className: "aviso"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ico"
    }, "✳"), /*#__PURE__*/React.createElement("p", null, fallo), /*#__PURE__*/React.createElement("button", {
      className: "btn-fant",
      style: {
        marginTop: 18
      },
      onClick: () => {
        setFallo("");
        setListo(false);
        cargar();
      }
    }, "Reintentar")));
  }
  if (!corrida) {
    return /*#__PURE__*/React.createElement("div", {
      className: "env"
    }, cabecera, /*#__PURE__*/React.createElement("div", {
      className: "aviso"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ico"
    }, "✳"), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "1.2rem"
      }
    }, "Todavía no empezamos"), /*#__PURE__*/React.createElement("p", null, "Vuelve cuando arranque el encuentro.")));
  }
  if (!participante) {
    return /*#__PURE__*/React.createElement("div", {
      className: "env"
    }, cabecera, /*#__PURE__*/React.createElement(Ingreso, {
      onEntrar: entrar
    }));
  }
  const total = preguntas.length;
  const activa = preguntas.find(p => p.orden === corrida.indice_activo);
  const cerradas = preguntas.filter(p => p.orden < corrida.indice_activo);
  const terminada = corrida.indice_activo > total || corrida.estado === "finalizada";
  const respondida = activa && mias.includes(activa.id);
  if (terminada) {
    return /*#__PURE__*/React.createElement("div", {
      className: "env"
    }, cabecera, /*#__PURE__*/React.createElement("div", {
      className: "tarjeta",
      style: {
        textAlign: "center",
        marginBottom: 22
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "ico",
      style: {
        fontFamily: "var(--display)",
        fontSize: "1.8rem",
        color: "var(--dorado)"
      }
    }, "✳"), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "1.25rem",
        marginTop: 8
      }
    }, "Esto es lo que dijimos"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--tenue)",
        fontSize: ".93rem",
        marginTop: 8,
        marginBottom: 0
      }
    }, Object.keys(participantes).length, " personas respondieron.")), /*#__PURE__*/React.createElement("div", {
      className: "tarjeta"
    }, preguntas.map(p => /*#__PURE__*/React.createElement(BloqueResultado, {
      key: p.id,
      pregunta: p,
      respuestas: respuestas.filter(r => r.pregunta_id === p.id),
      participantes: participantes
    }))));
  }
  if (vista === "activa" || cerradas.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      className: "env"
    }, cabecera, /*#__PURE__*/React.createElement(PreguntaActiva, {
      pregunta: activa,
      corrida: corrida,
      conteo: conteos[activa.id] || 0,
      yaRespondio: respondida,
      onEnviar: enviar,
      onVolver: () => setVista("feed"),
      hayCerradas: cerradas.length > 0
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "env"
  }, cabecera, /*#__PURE__*/React.createElement("div", {
    className: "salto-top"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setVista("activa")
  }, respondida ? "Ver la pregunta activa" : "Siguiente pregunta", " →")), /*#__PURE__*/React.createElement("div", {
    className: "hilo"
  }, /*#__PURE__*/React.createElement("span", null, cerradas.length === 1 ? "La primera respuesta del grupo" : "Lo que hemos respondido")), /*#__PURE__*/React.createElement("div", {
    className: "tarjeta"
  }, cerradas.slice().reverse().map(p => /*#__PURE__*/React.createElement(BloqueResultado, {
    key: p.id,
    pregunta: p,
    respuestas: respuestas.filter(r => r.pregunta_id === p.id),
    participantes: participantes
  }))));
}
try {
  ReactDOM.createRoot(document.getElementById("raiz")).render(/*#__PURE__*/React.createElement(App, null));
  window.__APP_OK = true;
} catch (e) {
  if (window.__pintarError) window.__pintarError("La aplicación falló al dibujarse", e.message);else throw e;
}