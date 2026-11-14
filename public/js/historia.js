(function () {
  "use strict";

  var observar = document.querySelectorAll(".revelar");
  if ("IntersectionObserver" in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visible");
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -40px 0px" });
    observar.forEach(function (el) { observador.observe(el); });
  } else {
    observar.forEach(function (el) { el.classList.add("visible"); });
  }

  function pintarBarras(contenedor, datos, opciones) {
    if (!contenedor) return;
    var maximo = Math.max.apply(null, datos.map(function (d) { return d.valor; })) || 1;
    var html = "";
    datos.forEach(function (d, i) {
      var altura = Math.max(4, Math.round((d.valor / maximo) * 100));
      html +=
        '<div class="barra-col">' +
          '<span class="barra-valor">' + d.valor + '</span>' +
          '<div class="barra' + (opciones && opciones.ambar && i === opciones.ambar - 1 ? " ambar" : "") + '" style="--altura:' + altura + '%"></div>' +
          '<span class="barra-etiqueta">' + d.etiqueta + '</span>' +
        '</div>';
    });
    contenedor.innerHTML = html;
  }

  function pintarHorizontales(contenedor, datos, sufijo) {
    if (!contenedor) return;
    var maximo = Math.max.apply(null, datos.map(function (d) { return d.valor; })) || 1;
    var html = "";
    datos.forEach(function (d) {
      var ancho = Math.max(3, Math.round((d.valor / maximo) * 100));
      html +=
        '<div class="fila-horizontal">' +
          '<span class="nombre" title="' + d.nombre + '">' + d.nombre + '</span>' +
          '<span class="pista"><span style="--ancho:' + ancho + '%"></span></span>' +
          '<span class="num">' + d.valor + (sufijo || "") + '</span>' +
        '</div>';
    });
    contenedor.innerHTML = html;
  }

  pintarBarras(document.getElementById("grafico-precios"), [
    { etiqueta: "3.0–3.5k", valor: 4 },
    { etiqueta: "3.5–4.0k", valor: 7 },
    { etiqueta: "4.0–4.5k", valor: 4 },
    { etiqueta: "4.5–5.0k", valor: 3 },
    { etiqueta: "5.0–5.2k", valor: 2 }
  ], { ambar: 2 });

  pintarHorizontales(document.getElementById("grafico-municipios"), [
    { nombre: "10 de Octubre", valor: 5 },
    { nombre: "Centro Habana", valor: 3 },
    { nombre: "La Lisa", valor: 2 },
    { nombre: "Cerro", valor: 2 },
    { nombre: "Plaza de la Revolución", valor: 2 },
    { nombre: "Cotorro", valor: 2 },
    { nombre: "Playa", valor: 2 },
    { nombre: "Habana del Este", valor: 2 }
  ]);

  pintarHorizontales(document.getElementById("grafico-precio-municipio"), [
    { nombre: "Habana del Este", valor: 4600 },
    { nombre: "Plaza de la Revolución", valor: 4500 },
    { nombre: "Playa", valor: 4300 },
    { nombre: "Cerro", valor: 4000 },
    { nombre: "Cotorro", valor: 4000 },
    { nombre: "Centro Habana", valor: 3941 },
    { nombre: "La Lisa", valor: 3500 },
    { nombre: "10 de Octubre", valor: 3440 }
  ], "");

  pintarHorizontales(document.getElementById("grafico-marcas"), [
    { nombre: "KVITOVA", valor: 4 },
    { nombre: "JINPENG", valor: 3 },
    { nombre: "JINPENG PANTHER", valor: 2 },
    { nombre: "IZUKI", valor: 2 },
    { nombre: "CAIMAN 53", valor: 1 }
  ]);

  var dona = document.querySelector("[data-dona]");
  if (dona) {
    var observadorDona = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          dona.style.setProperty("--pct", dona.getAttribute("data-dona") + "%");
          observadorDona.unobserve(dona);
        }
      });
    }, { threshold: 0.4 });
    observadorDona.observe(dona);
  }

  document.querySelectorAll("[data-enlace-juego]").forEach(function (el) {
    el.textContent = window.location.origin + "/juego";
  });

  document.querySelectorAll("[data-copiar]").forEach(function (boton) {
    boton.addEventListener("click", function () {
      var valor = boton.getAttribute("data-copiar") === "juego"
        ? window.location.origin + "/juego"
        : window.location.href;
      var texto = boton.getAttribute("data-texto") || "Enlace copiado";
      function listo() {
        var original = boton.textContent;
        boton.textContent = texto;
        setTimeout(function () { boton.textContent = original; }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(valor).then(listo).catch(function () { listo(); });
      } else {
        var area = document.createElement("textarea");
        area.value = valor;
        document.body.appendChild(area);
        area.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(area);
        listo();
      }
      if (window.Analitica) window.Analitica.evento("copiar_enlace", { destino: valor });
    });
  });

  var CLAVE = "triciclo_reaccion";
  var estado = { valor: "", comentario: "", nombre: "" };
  try {
    var guardado = JSON.parse(localStorage.getItem(CLAVE) || "{}");
    if (guardado && guardado.valor) estado = guardado;
  } catch (e) {}

  var botonLike = document.querySelector("[data-reaccion='me_gusta']");
  var botonDislike = document.querySelector("[data-reaccion='no_me_gusta']");
  var campoComentario = document.getElementById("reaccion-comentario");
  var campoNombre = document.getElementById("reaccion-nombre");
  var botonEnviar = document.getElementById("reaccion-enviar");
  var estadoTexto = document.getElementById("reaccion-estado");
  var muro = document.getElementById("muro");
  var conteoLike = document.getElementById("conteo-like");
  var conteoDislike = document.getElementById("conteo-dislike");

  function pintarSeleccion() {
    if (botonLike) botonLike.classList.toggle("activo", estado.valor === "me_gusta");
    if (botonDislike) botonDislike.classList.toggle("activo", estado.valor === "no_me_gusta");
  }

  if (campoComentario && estado.comentario) campoComentario.value = estado.comentario;
  if (campoNombre && estado.nombre) campoNombre.value = estado.nombre;
  pintarSeleccion();

  function elegir(valor) {
    estado.valor = valor;
    pintarSeleccion();
    if (estadoTexto) {
      estadoTexto.textContent = "Reacción elegida. Puedes añadir un comentario.";
      estadoTexto.className = "reaccion-gracias";
    }
  }

  if (botonLike) botonLike.addEventListener("click", function () { elegir("me_gusta"); });
  if (botonDislike) botonDislike.addEventListener("click", function () { elegir("no_me_gusta"); });

  function fechaRelativa(texto) {
    if (!texto) return "";
    var fecha = new Date(texto.replace(" ", "T"));
    if (isNaN(fecha.getTime())) return "";
    var segundos = Math.round((Date.now() - fecha.getTime()) / 1000);
    if (segundos < 60) return "ahora";
    if (segundos < 3600) return "hace " + Math.floor(segundos / 60) + " min";
    if (segundos < 86400) return "hace " + Math.floor(segundos / 3600) + " h";
    if (segundos < 604800) return "hace " + Math.floor(segundos / 86400) + " d";
    return fecha.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  }

  function iniciales(nombre) {
    var partes = (nombre || "Visitante").trim().split(/\s+/);
    return ((partes[0] || "V")[0] + (partes[1] ? partes[1][0] : "")).toUpperCase();
  }

  function cargarMuro() {
    if (!muro) return;
    fetch("/api/muro").then(function (r) { return r.json(); }).then(function (datos) {
      if (conteoLike) conteoLike.textContent = datos.me_gusta || 0;
      if (conteoDislike) conteoDislike.textContent = datos.no_me_gusta || 0;
      if (!datos.comentarios || !datos.comentarios.length) {
        muro.innerHTML = '<div class="muro-vacio">Todavía no hay comentarios. Sé la primera persona en dejar el suyo.</div>';
        return;
      }
      muro.innerHTML = "";
      datos.comentarios.forEach(function (c) {
        var item = document.createElement("div");
        item.className = "muro-item";
        var avatar = document.createElement("div");
        avatar.className = "avatar";
        avatar.textContent = iniciales(c.nombre);
        var cuerpo = document.createElement("div");
        var cabeza = document.createElement("div");
        cabeza.className = "muro-cabeza";
        var fuerte = document.createElement("strong");
        fuerte.textContent = c.nombre || "Visitante";
        cabeza.appendChild(fuerte);
        var cuando = document.createElement("span");
        cuando.textContent = fechaRelativa(c.ts);
        cabeza.appendChild(cuando);
        if (c.valor === "me_gusta") {
          var corazon = document.createElement("span");
          corazon.className = "corazon";
          corazon.textContent = "♥";
          cabeza.appendChild(corazon);
        }
        var texto = document.createElement("p");
        texto.textContent = c.comentario;
        cuerpo.appendChild(cabeza);
        cuerpo.appendChild(texto);
        item.appendChild(avatar);
        item.appendChild(cuerpo);
        muro.appendChild(item);
      });
    }).catch(function () {});
  }

  if (botonEnviar) {
    botonEnviar.addEventListener("click", function () {
      if (!estado.valor) {
        if (estadoTexto) {
          estadoTexto.textContent = "Primero elige me gusta o no me gusta.";
          estadoTexto.className = "reaccion-gracias";
          estadoTexto.style.color = "#a53228";
        }
        return;
      }
      estado.comentario = campoComentario ? campoComentario.value.trim() : "";
      estado.nombre = campoNombre ? campoNombre.value.trim() : "";
      botonEnviar.disabled = true;
      botonEnviar.textContent = "Enviando…";
      fetch("/api/reaccion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor: estado.valor,
          comentario: estado.comentario,
          nombre: estado.nombre,
          visitante: window.Analitica ? window.Analitica.visitante : "",
          pagina: "/",
          origen: window.Analitica ? window.Analitica.origen : "directo",
          dispositivo: window.Analitica ? window.Analitica.dispositivo : "desconocido"
        })
      }).then(function (r) { return r.json(); }).then(function (datos) {
        if (!datos.ok) throw new Error(datos.error || "Error");
        try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) {}
        if (conteoLike) conteoLike.textContent = datos.me_gusta;
        if (conteoDislike) conteoDislike.textContent = datos.no_me_gusta;
        if (estadoTexto) {
          estadoTexto.textContent = "¡Gracias! Tu reacción ya forma parte de la ruta.";
          estadoTexto.className = "reaccion-gracias";
          estadoTexto.style.color = "";
        }
        cargarMuro();
      }).catch(function () {
        if (estadoTexto) {
          estadoTexto.textContent = "No se pudo enviar. Inténtalo de nuevo.";
          estadoTexto.style.color = "#a53228";
        }
      }).finally(function () {
        botonEnviar.disabled = false;
        botonEnviar.textContent = "Enviar mi reacción";
      });
    });
  }

  cargarMuro();

  function cargarEstadisticas() {
    var campos = {
      visitas: "vivo-visitas",
      personas: "vivo-personas",
      qr: "vivo-qr",
      juego_fin: "vivo-partidas",
      me_gusta: "vivo-me-gusta"
    };
    fetch("/api/estadisticas").then(function (r) { return r.json(); }).then(function (datos) {
      Object.keys(campos).forEach(function (clave) {
        var el = document.getElementById(campos[clave]);
        if (el) el.textContent = (datos[clave] || 0).toLocaleString("es-ES");
      });
    }).catch(function () {});
  }

  cargarEstadisticas();
  setInterval(cargarEstadisticas, 60000);

  document.querySelectorAll("[data-compartir]").forEach(function (boton) {
    boton.addEventListener("click", function () {
      var enlace = window.location.origin + "/juego";
      var texto = "Jugué La Ruta del Triciclo: una historia de ciencia de datos sobre el mercado de triciclos de La Habana. ¿Te atreves?";
      if (navigator.share) {
        navigator.share({ title: "Del asfalto al dato", text: texto, url: enlace }).catch(function () {});
      } else {
        window.open("https://wa.me/?text=" + encodeURIComponent(texto + " " + enlace), "_blank");
      }
      if (window.Analitica) window.Analitica.evento("compartir", { destino: enlace });
    });
  });
})();
