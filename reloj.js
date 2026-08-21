/* Reloj. Compilado desde reloj.jsx */
/* ============================================================
   RELOJ
   Cuenta regresiva anclada a la hora del servidor.
   Expone window.PulsoTiempo y window.CuentaRegresiva
   ============================================================ */

const {
  useState: rS,
  useEffect: rE,
  useRef: rR
} = React;
let DESFASE = 0; // milisegundos entre el reloj del servidor y el del dispositivo
let SINCRONIZADO = false;
const PulsoTiempo = {
  async sincronizar(sb) {
    try {
      const t0 = Date.now();
      const {
        data,
        error
      } = await sb.rpc("pulso_ahora");
      if (error || !data) return false;
      const t1 = Date.now();
      const viaje = (t1 - t0) / 2; // ida y vuelta, se descuenta la mitad
      DESFASE = new Date(data).getTime() + viaje - t1;
      SINCRONIZADO = true;
      return true;
    } catch (e) {
      return false;
    }
  },
  sincronizado() {
    return SINCRONIZADO;
  },
  // Hora del servidor estimada, en milisegundos
  ahora() {
    return Date.now() + DESFASE;
  },
  // Segundos que quedan. null = sin reloj. 0 = se acabó.
  restante(corrida, pregunta) {
    if (!corrida || !pregunta) return null;
    if (corrida.modo === "abierto") return null;
    if (!pregunta.segundos || pregunta.segundos <= 0) return null;
    if (!corrida.pregunta_abierta_en) return null;
    const fin = new Date(corrida.pregunta_abierta_en).getTime() + pregunta.segundos * 1000;
    return Math.max(0, Math.ceil((fin - PulsoTiempo.ahora()) / 1000));
  },
  expirada(corrida, pregunta) {
    const r = PulsoTiempo.restante(corrida, pregunta);
    return r !== null && r <= 0;
  },
  // La ronda en vivo todavía no arrancó
  sinArrancar(corrida) {
    return corrida && corrida.modo !== "abierto" && !corrida.pregunta_abierta_en;
  },
  formato(seg) {
    if (seg === null || seg === undefined) return "";
    const m = Math.floor(seg / 60),
      s = seg % 60;
    return m > 0 ? m + ":" + String(s).padStart(2, "0") : String(s);
  }
};

/* ---------- cuenta regresiva visible ---------- */
function CuentaRegresiva({
  corrida,
  pregunta,
  onExpirar,
  compacta
}) {
  const [seg, setSeg] = rS(() => PulsoTiempo.restante(corrida, pregunta));
  const disparado = rR(false);
  rE(() => {
    disparado.current = false;
    setSeg(PulsoTiempo.restante(corrida, pregunta));
  }, [corrida && corrida.pregunta_abierta_en, pregunta && pregunta.id]);
  rE(() => {
    const t = setInterval(() => {
      const r = PulsoTiempo.restante(corrida, pregunta);
      setSeg(r);
      if (r !== null && r <= 0 && !disparado.current) {
        disparado.current = true;
        if (onExpirar) onExpirar();
      }
    }, 300);
    return () => clearInterval(t);
  }, [corrida, pregunta, onExpirar]);
  if (seg === null) return null;
  const total = pregunta.segundos || 1;
  const proporcion = Math.max(0, Math.min(1, seg / total));
  const urgente = seg <= 10;
  const color = seg <= 5 ? "var(--coral)" : urgente ? "var(--dorado)" : "var(--teal)";
  if (compacta) {
    return /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--display)",
        fontSize: "1.1rem",
        color,
        fontVariantNumeric: "tabular-nums"
      }
    }, PulsoTiempo.formato(seg));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      marginBottom: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: ".76rem",
      letterSpacing: ".12em",
      textTransform: "uppercase",
      color: "var(--tenue)"
    }
  }, seg === 0 ? "Se acabó el tiempo" : "Tiempo para responder"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--display)",
      fontSize: urgente ? "2rem" : "1.6rem",
      lineHeight: 1,
      color,
      fontVariantNumeric: "tabular-nums",
      transition: "font-size .2s ease"
    }
  }, PulsoTiempo.formato(seg))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      background: "rgba(18,49,40,.09)",
      borderRadius: 999,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: proporcion * 100 + "%",
      background: color,
      borderRadius: 999,
      transition: "width .3s linear, background .3s ease"
    }
  })));
}
window.PulsoTiempo = PulsoTiempo;
window.CuentaRegresiva = CuentaRegresiva;