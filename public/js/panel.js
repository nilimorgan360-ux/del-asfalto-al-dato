(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var datosActuales = null;
  var configActual = null;
  var temporizador = null;

  function numero(valor) {
    return new Intl.NumberFormat("es-ES").format(Number(valor) || 0);
  }

  function porcentaje(parte, total) {
    if (!total) return 0;
    return Math.round((parte / total) * 100);
  }

  function esc(texto) {
    return String(texto == null ? "" : texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function toast(mensaje) {
    var el = $("toast");
    if (!el) return;
    el.textContent = mensaje;
    el.classList.add("visible");
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("visible"); }, 2600);
  }

  function errorLogin(mensaje) {
    var el = $("login-error");
    if (!el) return;
    el.textContent = mensaje;
    el.classList.remove("oculto");
  }

  function limpiarError() {
    var el = $("login-error");
    if (el) el.classList.add("oculto");
  }

  function pistaIniciales(nombre) {
    var partes = (nombre || "Laura Díaz Sánchez").trim().split(/\s+/);
    return ((partes[0] || "L")[0] + (partes[1] ? partes[1][0] : "")).toUpperCase();
  }

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

  function mostrarLogin(configurada, pistas, nombre) {
    $("login").classList.remove("oculto");
    $("login").style.display = "grid";
    $("app").classList.add("oculto");
    if (temporizador) {
      clearInterval(temporizador);
      temporizador = null;
    }
    var setup = !configurada;
    $("campos-login").classList.toggle("oculto", setup);
    $("campos-setup").classList.toggle("oculto", !setup);
    $("login-titulo").textContent = setup ? "Configura tu acceso" : "Entra sin contraseña";
    $("login-sub").textContent = setup
      ? "Primera vez: guarda tus dos correos. Serán la única llave para entrar al panel."
      : "Solo los correos de la propietaria pueden abrir este panel. Escribe el tuyo y entra.";
    $("boton-login").textContent = setup ? "Guardar y entrar" : "Entrar sin contraseña";
    if (setup) {
      $("nombre-setup").value = nombre || "Laura Díaz Sánchez";
    }
    var pistasEl = $("login-pistas");
    if (!setup && pistas && pistas.length) {
      pistasEl.innerHTML = "Correos autorizados: " + pistas.map(function (p) { return "<code>" + esc(p) + "</code>"; }).join(" ");
    } else {
      pistasEl.textContent = "";
    }
  }

  function mostrarApp() {
    $("login").classList.add("oculto");
    $("login").style.display = "none";
    $("app").classList.remove("oculto");
    cargarTodo();
    if (temporizador) clearInterval(temporizador);
    temporizador = setInterval(function () {
      if (document.visibilityState === "visible") cargarResumen(true);
    }, 30000);
  }

  function manejarSesion(respuesta) {
    if (respuesta.status === 401) {
      mostrarLogin(false, [], "");
      return false;
    }
    return true;
  }

  function cargarTodo() {
    cargarResumen();
    cargarConfig();
  }

  function cargarConfig() {
    fetch("/api/propietaria/config", { credentials: "same-origin" })
      .then(function (r) {
        if (!manejarSesion(r)) return null;
        return r.json();
      })
      .then(function (datos) {
        if (!datos) return;
        configActual = datos;
        $("emails-config").value = (datos.emails || []).join("\n");
        $("nombre-config").value = datos.nombre || "";
        $("url-config").value = datos.url_publica || "";
        $("perfil-nombre").textContent = datos.nombre || "Laura Díaz Sánchez";
        $("perfil-avatar").textContent = pistaIniciales(datos.nombre);
        $("url-actual").innerHTML = "Enlace efectivo: <strong>" + esc(datos.url_efectiva || "") + "</strong>";
      })
      .catch(function () {});
  }

  function cargarResumen(silencioso) {
    fetch("/api/resumen", { credentials: "same-origin" })
      .then(function (r) {
        if (!manejarSesion(r)) return null;
        return r.json();
      })
      .then(function (datos) {
        if (!datos) return;
        datosActuales = datos;
        pintarResumen(datos);
      })
      .catch(function () {
        if (!silencioso) toast("No se pudieron cargar los datos");
      });
  }

  function pintarResumen(datos) {
    var t = datos.totales || {};
    var reaccionesTotales = (t.me_gusta || 0) + (t.no_me_gusta || 0);

    $("perfil-nombre").textContent = datos.autora || "Laura";
    $("perfil-avatar").textContent = pistaIniciales(datos.autora);
    $("perfil-personas").textContent = numero(t.personas);
    $("perfil-visitas").textContent = numero(t.visitas);
    $("perfil-reacciones").textContent = numero(reaccionesTotales);
    $("perfil-nota").textContent = t.nota_media ? t.nota_media : "—";

    $("kpis").innerHTML =
      kpi(numero(t.personas), "personas únicas", numero(t.personas_24h) + " en las últimas 24 h") +
      kpi(numero(t.visitas), "visitas totales", numero(t.visitas_24h) + " en las últimas 24 h") +
      kpi(numero(t.qr), "escaneos de QR", porcentaje(t.qr, t.visitas) + "% de las visitas") +
      kpi(numero(t.juego_fin), "partidas terminadas", numero(t.juego_inicio) + " partidas iniciadas") +
      kpi((t.finalizacion || 0) + "%", "finalización del juego", "de quienes empiezan, terminan") +
      kpi(t.nota_media ? t.nota_media + "/100" : "—", "nota media", "puntuación del juego") +
      kpi(numero(t.me_gusta), "me gusta", (t.satisfaccion || 0) + "% de satisfacción") +
      kpi(numero(t.comentarios), "comentarios", numero(t.compartidos) + " veces compartido") +
      kpi(numero(t.permanencia_media) + " s", "permanencia media", "tiempo en página");

    pintarLinea(datos.serie_diaria || []);
    pintarDona(t);
    pintarHoras(datos.por_hora || []);
    pintarFuentes(datos.fuentes || [], t.visitas || 0);
    pintarEmbudo(datos.embudo || [], t.juego_inicio || 0, t.juego_fin || 0);
    pintarDispositivos(datos.dispositivos || [], t.visitas || 0);
    pintarPaginas(datos.paginas || [], t.visitas || 0);
    pintarComentarios(datos.reacciones_recientes || []);
    $("ultima-actualizacion").textContent = "Última actualización: " + (datos.actualizado || "").replace("T", " ");
  }

  function kpi(valor, etiqueta, nota) {
    return (
      '<div class="panel-kpi"><b>' + esc(valor) + "</b><span>" + esc(etiqueta) + "</span><small>" + esc(nota) + "</small></div>"
    );
  }

  function pintarLinea(serie) {
    var contenedor = $("grafico-linea");
    if (!contenedor) return;
    if (!serie.length) {
      contenedor.innerHTML = '<div class="sin-datos">Aún no hay visitas registradas.</div>';
      return;
    }
    var w = 640, h = 220, izq = 30, der = 12, arriba = 14, abajo = 26;
    var maximo = 1;
    serie.forEach(function (d) {
      maximo = Math.max(maximo, d.visitas, d.personas);
    });
    var n = serie.length;
    function x(i) { return izq + (i * (w - izq - der)) / Math.max(1, n - 1); }
    function y(v) { return h - abajo - (v / maximo) * (h - arriba - abajo); }

    var puntosVisitas = serie.map(function (d, i) { return x(i) + "," + y(d.visitas); }).join(" ");
    var puntosPersonas = serie.map(function (d, i) { return x(i) + "," + y(d.personas); }).join(" ");
    var area = "M " + x(0) + " " + y(serie[0].visitas) + " ";
    serie.forEach(function (d, i) { area += "L " + x(i) + " " + y(d.visitas) + " "; });
    area += "L " + x(n - 1) + " " + (h - abajo) + " L " + x(0) + " " + (h - abajo) + " Z";

    var rejilla = "";
    for (var g = 0; g <= 4; g++) {
      var valor = Math.round((maximo / 4) * g);
      var yy = y(valor);
      rejilla +=
        '<line x1="' + izq + '" y1="' + yy + '" x2="' + (w - der) + '" y2="' + yy + '" stroke="rgba(8,26,48,.08)" stroke-width="1"/>' +
        '<text x="' + (izq - 6) + '" y="' + (yy + 4) + '" text-anchor="end" font-size="9" fill="#8d9aa8">' + valor + "</text>";
    }

    var etiquetas = "";
    serie.forEach(function (d, i) {
      if (i % 5 === 0 || i === n - 1) {
        etiquetas +=
          '<text x="' + x(i) + '" y="' + (h - 8) + '" text-anchor="middle" font-size="9" fill="#8d9aa8">' +
          d.fecha.slice(5).replace("-", "/") +
          "</text>";
      }
    });

    var circulos = "";
    serie.forEach(function (d, i) {
      if (d.visitas > 0) {
        circulos +=
          '<circle cx="' + x(i) + '" cy="' + y(d.visitas) + '" r="2.6" fill="#2aa6a0">' +
          "<title>" + d.fecha + ": " + d.visitas + " visitas, " + d.personas + " personas</title></circle>";
      }
    });

    contenedor.innerHTML =
      '<svg viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Serie diaria de visitas y personas únicas">' +
        '<defs><linearGradient id="degradado" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#2aa6a0" stop-opacity=".28"/>' +
          '<stop offset="100%" stop-color="#2aa6a0" stop-opacity="0"/>' +
        "</linearGradient></defs>" +
        rejilla +
        '<path d="' + area + '" fill="url(#degradado)"/>' +
        '<polyline points="' + puntosPersonas + '" fill="none" stroke="#f2a93b" stroke-width="2" stroke-dasharray="5 4"/>' +
        '<polyline points="' + puntosVisitas + '" fill="none" stroke="#2aa6a0" stroke-width="2.4"/>' +
        circulos +
        etiquetas +
      "</svg>";
  }

  function pintarDona(t) {
    var total = (t.me_gusta || 0) + (t.no_me_gusta || 0);
    var pct = total ? Math.round(((t.me_gusta || 0) / total) * 100) : 0;
    var dona = $("dona-panel");
    if (dona) dona.style.setProperty("--pct", pct + "%");
    $("dona-pct").textContent = pct + "%";
    $("dona-texto").innerHTML = total
      ? "<b>" + numero(t.me_gusta) + "</b> de <b>" + numero(total) + "</b> reacciones son positivas"
      : "Sin reacciones todavía";
    $("num-like").textContent = numero(t.me_gusta);
    $("num-dislike").textContent = numero(t.no_me_gusta);
    $("num-comentarios").textContent = numero(t.comentarios);
  }

  function pintarHoras(horas) {
    var contenedor = $("barras-hora");
    if (!contenedor) return;
    var maximo = Math.max.apply(null, horas.concat([1]));
    var horaPico = horas.indexOf(Math.max.apply(null, horas));
    var html = "";
    horas.forEach(function (valor, i) {
      var altura = Math.max(2, Math.round((valor / maximo) * 100));
      html +=
        '<div class="barrita' + (i === horaPico && valor > 0 ? " ambar" : "") + '" ' +
        'style="height:' + altura + '%" data-hora="' + i + ' h · ' + valor + ' visitas" ' +
        'title="' + i + ' h · ' + valor + ' visitas"></div>';
    });
    contenedor.innerHTML = html;
  }

  function nombreFuente(clave) {
    var mapa = {
      qr: "Código QR",
      directo: "Directo",
      sitio: "Navegación interna",
      redes: "Redes sociales",
      referido: "Referidos",
      panel: "Panel"
    };
    return mapa[clave] || clave;
  }

  function pintarFuentes(fuentes, total) {
    var contenedor = $("fuentes");
    if (!contenedor) return;
    if (!fuentes.length) {
      contenedor.innerHTML = '<div class="sin-datos">Aún no hay visitas.</div>';
      return;
    }
    contenedor.innerHTML = fuentes.map(function (f) {
      var pct = porcentaje(f.valor, total);
      return (
        '<div class="fuente-item">' +
          '<div class="fila"><b>' + esc(nombreFuente(f.nombre)) + "</b><span>" + f.valor + " · " + pct + "%</span></div>" +
          '<div class="fuerza"><span style="width:' + Math.max(2, pct) + '%"></span></div>' +
        "</div>"
      );
    }).join("");
  }

  function pintarEmbudo(embudo, inicio, fin) {
    var contenedor = $("embudo");
    if (!contenedor) return;
    if (!inicio) {
      contenedor.innerHTML = '<div class="sin-datos">Aún no hay partidas del juego.</div>';
      return;
    }
    var base = Math.max(inicio, 1);
    var filas = [{ paso: "Inicio", valor: inicio }];
    embudo.forEach(function (e) {
      filas.push({ paso: "Acto " + e.acto, valor: e.valor });
    });
    filas.push({ paso: "Final", valor: fin });
    contenedor.innerHTML = filas.map(function (f) {
      var pct = Math.round((f.valor / base) * 100);
      return (
        '<div class="embudo-item">' +
          '<span class="paso">' + esc(f.paso) + "</span>" +
          '<div class="embudo-barra"><span style="width:' + Math.max(1, pct) + '%">' + (pct > 18 ? pct + "%" : "") + "</span></div>" +
          "<b>" + f.valor + "</b>" +
        "</div>"
      );
    }).join("");
  }

  function pintarDispositivos(dispositivos, total) {
    var contenedor = $("dispositivos");
    if (!contenedor) return;
    if (!dispositivos.length) {
      contenedor.innerHTML = '<div class="sin-datos">Sin datos de dispositivos.</div>';
      return;
    }
    contenedor.innerHTML = dispositivos.map(function (d) {
      var pct = porcentaje(d.valor, total);
      var etiqueta = d.nombre === "movil" ? "Móvil" : d.nombre === "escritorio" ? "Escritorio" : "Desconocido";
      return (
        '<div class="fuente-item">' +
          '<div class="fila"><b>' + esc(etiqueta) + "</b><span>" + d.valor + " · " + pct + "%</span></div>" +
          '<div class="fuerza"><span style="width:' + Math.max(2, pct) + '%"></span></div>' +
        "</div>"
      );
    }).join("");
  }

  function pintarPaginas(paginas, total) {
    var contenedor = $("paginas");
    if (!contenedor) return;
    if (!paginas.length) {
      contenedor.innerHTML = '<div class="sin-datos">Sin páginas registradas.</div>';
      return;
    }
    var nombres = { "/": "Inicio", "/juego": "Juego", "/panel": "Panel", "/qr-card": "Tarjeta QR" };
    contenedor.innerHTML = paginas.map(function (p) {
      var pct = porcentaje(p.valor, total);
      return (
        '<div class="fuente-item">' +
          '<div class="fila"><b>' + esc(nombres[p.nombre] || p.nombre) + "</b><span>" + p.valor + " · " + pct + "%</span></div>" +
          '<div class="fuerza"><span style="width:' + Math.max(2, pct) + '%"></span></div>' +
        "</div>"
      );
    }).join("");
  }

  function pintarComentarios(comentarios) {
    var contenedor = $("comentarios");
    if (!contenedor) return;
    if (!comentarios.length) {
      contenedor.innerHTML = '<div class="sin-datos">Todavía no hay comentarios. Cuando alguien deje uno, aparecerá aquí.</div>';
      return;
    }
    contenedor.innerHTML = comentarios.map(function (c) {
      var iniciales = (c.nombre || "Visitante").trim().split(/\s+/).slice(0, 2).map(function (p) { return p[0] || ""; }).join("").toUpperCase();
      return (
        '<div class="comentario-item">' +
          '<div class="avatar">' + esc(iniciales) + "</div>" +
          '<div><div class="texto">' + esc(c.comentario) + "</div>" +
          '<div class="meta">' + esc(c.nombre || "Visitante") + " · " + esc(fechaRelativa(c.ts)) + (c.puntuacion != null ? " · " + c.puntuacion + "/100" : "") + "</div></div>" +
          '<button class="comentario-borrar" type="button" data-borrar="' + c.id + '" title="Eliminar comentario" aria-label="Eliminar comentario">✕</button>' +
        "</div>"
      );
    }).join("");

    contenedor.querySelectorAll("[data-borrar]").forEach(function (boton) {
      boton.addEventListener("click", function () {
        if (!confirm("¿Eliminar este comentario del muro público?")) return;
        fetch("/api/reaccion/borrar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ id: parseInt(boton.getAttribute("data-borrar"), 10) })
        }).then(function (r) { return r.json(); }).then(function (datos) {
          if (datos.ok) {
            toast("Comentario eliminado");
            cargarResumen(true);
          } else {
            toast(datos.error || "No se pudo eliminar");
          }
        }).catch(function () { toast("No se pudo eliminar"); });
      });
    });
  }

  function configurarFormularios() {
    $("form-login").addEventListener("submit", function (e) {
      e.preventDefault();
      limpiarError();
      var configurada = $("campos-login").classList.contains("oculto") === false;
      if (!configurada) {
        var emails = [$("email1").value.trim(), $("email2").value.trim()].filter(Boolean);
        if (emails.length < 1) {
          errorLogin("Escribe al menos un correo.");
          return;
        }
        var codigo = $("codigo-setup").value.trim();
        if (!codigo) {
          errorLogin("Escribe el código que aparece en la terminal del servidor.");
          return;
        }
        $("boton-login").disabled = true;
        fetch("/api/propietaria/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            emails: emails,
            nombre: $("nombre-setup").value.trim() || "Laura Díaz Sánchez",
            codigo: codigo
          })
        }).then(function (r) { return r.json(); }).then(function (datos) {
          if (!datos.ok) throw new Error(datos.error || "No se pudo configurar");
          mostrarApp();
        }).catch(function (err) {
          errorLogin(err.message || "No se pudo configurar el acceso.");
        }).finally(function () {
          $("boton-login").disabled = false;
        });
        return;
      }
      var email = $("email").value.trim();
      if (!email) {
        errorLogin("Escribe tu correo.");
        return;
      }
      $("boton-login").disabled = true;
      fetch("/api/auth/entrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: email })
      }).then(function (r) { return r.json(); }).then(function (datos) {
        if (!datos.ok) throw new Error(datos.error || "Ese correo no está autorizado.");
        mostrarApp();
      }).catch(function (err) {
        errorLogin(err.message || "No se pudo entrar.");
      }).finally(function () {
        $("boton-login").disabled = false;
      });
    });

    $("actualizar").addEventListener("click", function () {
      cargarTodo();
      toast("Actualizando…");
    });

    $("salir").addEventListener("click", function () {
      fetch("/api/auth/salir", { method: "POST", credentials: "same-origin" })
        .finally(function () { window.location.reload(); });
    });

    $("form-ajustes").addEventListener("submit", function (e) {
      e.preventDefault();
      var emails = $("emails-config").value.split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
      if (!emails.length) {
        toast("Escribe al menos un correo.");
        return;
      }
      fetch("/api/propietaria/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          emails: emails,
          nombre: $("nombre-config").value.trim(),
          url_publica: $("url-config").value.trim()
        })
      }).then(function (r) { return r.json(); }).then(function (datos) {
        if (!datos.ok) throw new Error(datos.error || "No se pudo guardar");
        toast("Ajustes guardados");
        cargarConfig();
      }).catch(function (err) {
        toast(err.message || "No se pudo guardar");
      });
    });

    $("copiar-enlace").addEventListener("click", function () {
      var base = (configActual && (configActual.url_publica || configActual.url_efectiva)) || window.location.origin;
      var enlace = base.replace(/\/$/, "") + "/juego";
      function listo() { toast("Enlace copiado: " + enlace); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(enlace).then(listo).catch(listo);
      } else {
        var area = document.createElement("textarea");
        area.value = enlace;
        document.body.appendChild(area);
        area.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(area);
        listo();
      }
    });

    $("reiniciar-datos").addEventListener("click", function () {
      if (!confirm("Esto borrará TODAS las visitas, partidas y reacciones. ¿Continuar?")) return;
      if (!confirm("Última confirmación: esta acción no se puede deshacer. ¿Borrar las estadísticas?")) return;
      fetch("/api/propietaria/reiniciar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ confirmar: "REINICIAR" })
      }).then(function (r) { return r.json(); }).then(function (datos) {
        if (!datos.ok) throw new Error(datos.error || "No se pudo reiniciar");
        toast("Estadísticas borradas");
        cargarTodo();
      }).catch(function (err) {
        toast(err.message || "No se pudo reiniciar");
      });
    });
  }

  function iniciar() {
    configurarFormularios();
    fetch("/api/auth/estado", { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (estado) {
        if (estado.autenticada) {
          mostrarApp();
          return;
        }
        fetch("/api/config-publica", { credentials: "same-origin" })
          .then(function (r) { return r.json(); })
          .then(function (publica) {
            mostrarLogin(publica.configurada, publica.pistas, publica.nombre);
          })
          .catch(function () {
            mostrarLogin(false, [], "");
          });
      })
      .catch(function () {
        mostrarLogin(false, [], "");
      });
  }

  iniciar();
})();
