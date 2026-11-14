(function () {
  "use strict";

  var CLAVE_VISITANTE = "triciclo_visitante";
  var CLAVE_SESION = "triciclo_sesion";
  var CLAVE_ORIGEN = "triciclo_origen";

  function aleatorio() {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return "id-" + Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);
  }

  function obtenerVisitante() {
    try {
      var guardado = localStorage.getItem(CLAVE_VISITANTE);
      if (guardado) return guardado;
      var nuevo = "v-" + aleatorio();
      localStorage.setItem(CLAVE_VISITANTE, nuevo);
      return nuevo;
    } catch (e) {
      return "v-" + aleatorio();
    }
  }

  function obtenerSesion() {
    try {
      var guardado = sessionStorage.getItem(CLAVE_SESION);
      if (guardado) return guardado;
      var nuevo = "s-" + aleatorio();
      sessionStorage.setItem(CLAVE_SESION, nuevo);
      return nuevo;
    } catch (e) {
      return "s-" + aleatorio();
    }
  }

  function detectarDispositivo() {
    var ancho = window.innerWidth || 0;
    var tactil = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (ancho < 760 || (tactil && ancho < 1100)) return "movil";
    return "escritorio";
  }

  function detectarOrigen() {
    var params = new URLSearchParams(window.location.search);
    var origen = params.get("origen");
    if (origen) {
      try { sessionStorage.setItem(CLAVE_ORIGEN, origen); } catch (e) {}
      return origen;
    }
    try {
      var guardado = sessionStorage.getItem(CLAVE_ORIGEN);
      if (guardado) return guardado;
    } catch (e) {}
    if (document.referrer) {
      try {
        var ref = new URL(document.referrer);
        if (ref.origin === window.location.origin) return "sitio";
        if (/wa\.me|whatsapp|t\.me|telegram|facebook|instagram/.test(ref.hostname)) {
          return "redes";
        }
        return "referido";
      } catch (e) {
        return "referido";
      }
    }
    return "directo";
  }

  var visitante = obtenerVisitante();
  var sesion = obtenerSesion();
  var dispositivo = detectarDispositivo();
  var origen = detectarOrigen();
  var pagina = document.body.getAttribute("data-pagina") || window.location.pathname;
  var inicio = Date.now();
  var enviadoPermanencia = false;

  function enviar(datos, usarBeacon) {
    var cuerpo = JSON.stringify(datos);
    if (usarBeacon && navigator.sendBeacon) {
      try {
        navigator.sendBeacon("/api/evento", new Blob([cuerpo], { type: "application/json" }));
        return;
      } catch (e) {}
    }
    try {
      fetch("/api/evento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: cuerpo,
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  function evento(tipo, meta, valor, paginaPersonalizada) {
    enviar({
      tipo: tipo,
      pagina: paginaPersonalizada || pagina,
      visitante: visitante,
      sesion: sesion,
      valor: valor === undefined ? null : valor,
      meta: meta || {},
      referente: document.referrer || "",
      origen: origen,
      dispositivo: dispositivo
    });
  }

  window.Analitica = {
    evento: evento,
    visitante: visitante,
    sesion: sesion,
    origen: origen,
    dispositivo: dispositivo,
    pagina: pagina
  };

  evento("pagina_vista", {
    titulo: document.title,
    idioma: navigator.language || "",
    pantalla: (window.innerWidth || 0) + "x" + (window.innerHeight || 0)
  });

  var umbrales = [25, 50, 75, 100];
  var alcanzados = {};
  function medirScroll() {
    var total = document.documentElement.scrollHeight - window.innerHeight;
    if (total <= 0) return;
    var pct = Math.min(100, Math.round((window.scrollY / total) * 100));
    for (var i = 0; i < umbrales.length; i++) {
      var u = umbrales[i];
      if (pct >= u && !alcanzados[u]) {
        alcanzados[u] = true;
        evento("scroll_profundidad", { porcentaje: u }, u);
      }
    }
  }

  var temporizador;
  window.addEventListener("scroll", function () {
    if (temporizador) return;
    temporizador = setTimeout(function () {
      temporizador = null;
      medirScroll();
    }, 250);
  }, { passive: true });

  function cerrarTiempo() {
    if (enviadoPermanencia) return;
    enviadoPermanencia = true;
    var segundos = Math.round((Date.now() - inicio) / 1000);
    if (segundos < 2 || segundos > 7200) return;
    enviar({
      tipo: "permanencia",
      pagina: pagina,
      visitante: visitante,
      sesion: sesion,
      valor: segundos,
      meta: {},
      referente: document.referrer || "",
      origen: origen,
      dispositivo: dispositivo
    }, true);
  }

  window.addEventListener("pagehide", cerrarTiempo);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") cerrarTiempo();
  });

  document.addEventListener("click", function (e) {
    var enlace = e.target.closest("[data-evento]");
    if (!enlace) return;
    var nombre = enlace.getAttribute("data-evento");
    var destino = enlace.getAttribute("href") || "";
    evento(nombre, { destino: destino });
  });
})();
