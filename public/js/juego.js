(function () {
  "use strict";

  var ACTOS = [
    {
      n: 1,
      acto: "La chispa",
      titulo: "Observar antes de medir",
      entrada: [
        "Todo empezó en una calle de La Habana: un triciclo eléctrico pasó cargado hasta el techo. Luego otro. Y otro.",
        "Nadie tenía los números: ni cuántos eran, ni cuánto costaban, ni quién los usaba. Antes de abrir una hoja de cálculo había que decidir qué mirar."
      ],
      dato: "El método empieza antes del teclado: observar la ciudad y preguntar a quienes la usan.",
      reto: {
        tipo: "opciones",
        pregunta: "Antes de abrir la hoja de cálculo, ¿qué harías primero?",
        explicacion: "La evidencia no empieza en el teclado. Primero se observa la calle y se pregunta a operadores y compradores; después se decide qué medir.",
        opciones: [
          { texto: "Comprar el triciclo más caro para probarlo.", correcta: false, retro: "Probar un solo caso no describe un mercado." },
          { texto: "Observar la calle y preguntar a quienes la usan.", correcta: true },
          { texto: "Buscar solo precios en internet.", correcta: false, retro: "La web muestra el precio publicado, pero no las barreras ni el uso real." },
          { texto: "Rellenar los datos que faltan con suposiciones.", correcta: false, retro: "Una suposición no es un dato: hay que salir a recogerlo." }
        ]
      }
    },
    {
      n: 2,
      acto: "El terreno",
      titulo: "Salir a la calle y escuchar",
      entrada: [
        "La muestra tiene dos mitades: 12 anuncios web, que muestran el precio publicado; y 8 entrevistas, que muestran el precio negociado y las barreras reales.",
        "Juntas forman 20 historias y una sola base. Salir a la calle fue la decisión que cambió el proyecto."
      ],
      dato: "12 anuncios + 8 entrevistas = 20 registros. Dos maneras de mirar el mismo mercado.",
      reto: {
        tipo: "opciones",
        pregunta: "¿Qué aporta cada fuente a la investigación?",
        explicacion: "Los portales dicen una cosa; las personas dicen otra. La web muestra el precio que se publica y las entrevistas revelan el precio que se negocia, el uso real y las barreras que no salen en los anuncios.",
        opciones: [
          { texto: "La web muestra el precio publicado; las entrevistas, el precio negociado y las barreras reales.", correcta: true },
          { texto: "La web muestra las barreras; las entrevistas, las marcas.", correcta: false, retro: "Es al revés: las barreras aparecen sobre todo al conversar." },
          { texto: "Las dos fuentes dicen exactamente lo mismo.", correcta: false, retro: "Si dijeran lo mismo, una de las dos sobraría." },
          { texto: "Solo las entrevistas sirven; los anuncios no aportan nada.", correcta: false, retro: "Los 12 anuncios aportan precio, marca y municipio: son media muestra." }
        ]
      }
    },
    {
      n: 3,
      acto: "Los números",
      titulo: "Cuando el mercado empieza a hablar",
      entrada: [
        "Con la base limpia, el mercado habló: precios entre $3,000 y $5,200, con un promedio de $3,941. La banda más común es $3,500–$4,000 (7 de 20 registros).",
        "Tres de cada cuatro triciclos se compran para carga. 10 de Octubre concentra una de cada cuatro historias. KVITOVA y JINPENG suman el 58% de los anuncios web."
      ],
      dato: "El precio no es un capricho: hay que cruzarlo con presupuesto, autonomía y legalidad.",
      reto: {
        tipo: "tarjetas",
        pregunta: "Necesitas un triciclo para carga, con papeles en regla y un presupuesto máximo de $4,000. ¿Cuál eliges?",
        explicacion: "El JINPENG de La Lisa entra en presupuesto ($4,000), es el de mayor autonomía de las tres opciones (50 km), tiene 600 W y está 'En regla'. La KVITOVA es más barata, pero no acredita legalidad; la IZUKI se pasa del presupuesto.",
        opciones: [
          {
            marca: "KVITOVA",
            precio: 3500,
            autonomia: "40 km",
            potencia: "500 W",
            municipio: "10 de Octubre",
            legal: "-",
            correcta: false,
            retro: "Es la más barata, pero la legalidad no está acreditada y su autonomía es menor."
          },
          {
            marca: "JINPENG",
            precio: 4000,
            autonomia: "50 km",
            potencia: "600 W",
            municipio: "La Lisa",
            legal: "En regla",
            correcta: true
          },
          {
            marca: "IZUKI",
            precio: 5000,
            autonomia: "45 km",
            potencia: "550 W",
            municipio: "Playa",
            legal: "-",
            correcta: false,
            retro: "Se pasa del presupuesto y tampoco acredita legalidad."
          }
        ]
      }
    },
    {
      n: 4,
      acto: "Las grietas",
      titulo: "El bache que no se ve",
      entrada: [
        "En las ocho entrevistas aparecieron ocho obstáculos distintos: falta de documentos, precios altos, horarios limitados, trámites lentos, falta de infraestructura, burocracia, falta de mantenimiento y requisitos estrictos.",
        "Ninguno se repite en la hoja de cálculo; todos se repiten en la vida real."
      ],
      dato: "La barrera más cara es la que no se ve: la falta de información.",
      reto: {
        tipo: "opciones",
        pregunta: "¿Cuál de estas barreras es la más difícil de ver y la más cara para un operador?",
        explicacion: "La falta de información obliga a descubrir sobre la marcha qué documentos se necesitan, cuánto cuesta legalizar y cómo se negocia. Es un costo que no aparece en el precio del vehículo.",
        opciones: [
          { texto: "La falta de información: no saber qué se necesita, cuánto cuesta o cómo legalizar.", correcta: true },
          { texto: "Los precios altos.", correcta: false, retro: "El precio se ve y se compara; la falta de información, no." },
          { texto: "La falta de documentos.", correcta: false, retro: "Es una barrera visible; la historia apunta a lo que no se sabe de antemano." },
          { texto: "La burocracia.", correcta: false, retro: "La burocracia es parte del problema, pero la raíz es no saber cómo navegarla." }
        ]
      }
    },
    {
      n: 5,
      acto: "La luz",
      titulo: "Una ventaja sostenible",
      entrada: [
        "Solo uno de cada doce anuncios web incluye panel solar: el 8.3% de la muestra. Más que un accesorio, la energía solar puede ser una ventaja competitiva en un mercado donde la autonomía y el costo operativo lo son todo.",
        "El viaje continúa: ampliar la muestra, mirar la ley de frente, segmentar mejor y evaluar el panel solar."
      ],
      dato: "1 de 12 anuncios web incluye panel solar. La sostenibilidad puede ser el próximo diferencial.",
      reto: {
        tipo: "opciones",
        pregunta: "Si tu margen depende del costo por kilómetro, ¿qué decisión es más inteligente con los datos actuales?",
        explicacion: "Con solo 1 de 12 anuncios con panel solar, la decisión sensata es medir: comparar autonomía, costo por kilómetro y precio antes de pagar más. La sostenibilidad es una hipótesis que hay que evaluar, no un adorno.",
        opciones: [
          { texto: "Ignorar el panel solar: es solo un adorno.", correcta: false, retro: "Ignorar una ventaja potencial también es una decisión, pero no está basada en datos." },
          { texto: "Evaluarlo midiendo autonomía y costo por km antes de pagar más.", correcta: true },
          { texto: "Comprar siempre el modelo más caro.", correcta: false, retro: "Más caro no significa mejor costo por kilómetro." },
          { texto: "Esperar sin medir a que el mercado cambie.", correcta: false, retro: "Esperar sin datos es otra forma de no investigar." }
        ]
      }
    }
  ];

  var PUNTOS_POR_ACTO = 20;
  var $ = function (id) { return document.getElementById(id); };

  var params = new URLSearchParams(window.location.search);
  var actoParam = parseInt(params.get("acto") || "1", 10);
  var inicioActo = actoParam >= 1 && actoParam <= 5 ? actoParam : 1;

  var estado = {
    nombre: "",
    indice: 0,
    puntos: 0,
    aciertos: 0,
    respuestas: [],
    respondido: false,
    iniciado: false,
    inicioActo: inicioActo
  };

  function esc(texto) {
    return String(texto == null ? "" : texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function evento(tipo, meta, valor) {
    if (window.Analitica) window.Analitica.evento(tipo, meta || {}, valor);
  }

  function prepararInicio() {
    var nombreGuardado = "";
    var mejor = "";
    try {
      nombreGuardado = localStorage.getItem("triciclo_nombre") || "";
      mejor = localStorage.getItem("triciclo_mejor") || "";
    } catch (e) {}
    if (nombreGuardado) $("nombre-jugador").value = nombreGuardado;
    if (mejor) $("mejor-marca").textContent = "Tu mejor marca hasta ahora: " + mejor + "/100.";
    if (estado.inicioActo > 1) {
      var nota = $("nota-acto");
      nota.classList.remove("oculto");
      nota.innerHTML = "Has entrado por el acto " + estado.inicioActo + ". Para la puntuación completa, <button type=\"button\" class=\"btn btn-pequeno btn-claro\" id=\"desde-principio\">empieza desde el acto 1</button>.";
      var boton = $("desde-principio");
      if (boton) {
        boton.addEventListener("click", function () {
          estado.inicioActo = 1;
          nota.classList.add("oculto");
        });
      }
    }
    $("empezar").addEventListener("click", comenzar);
  }

  function comenzar() {
    var nombre = $("nombre-jugador").value.trim();
    estado.nombre = nombre;
    if (nombre) {
      try { localStorage.setItem("triciclo_nombre", nombre); } catch (e) {}
    }
    estado.iniciado = true;
    evento("juego_inicio", { acto_inicio: estado.inicioActo, con_nombre: !!nombre });
    $("pantalla-inicio").classList.add("oculto");
    $("pantalla-acto").classList.remove("oculto");
    $("ruta-hud").classList.remove("oculto");
    $("ruta-hud").setAttribute("aria-hidden", "false");
    mostrarActo(estado.inicioActo - 1);
  }

  function pintarHud() {
    var hud = $("ruta-hud");
    var html = "";
    ACTOS.forEach(function (acto, i) {
      var clase = "ruta-nodo";
      if (i < estado.indice) clase += " hecho";
      if (i === estado.indice) clase += " activo";
      html +=
        '<div class="' + clase + '">' +
          '<div class="ruta-punto">' + (i < estado.indice ? "✓" : acto.n) + "</div>" +
          "<span>" + esc(acto.acto) + "</span>" +
        "</div>";
    });
    hud.innerHTML = html;
    $("progreso-texto").innerHTML = "Acto <b>" + ACTOS[estado.indice].n + "</b> / 5";
  }

  function mostrarActo(indice) {
    estado.indice = indice;
    estado.respondido = false;
    var acto = ACTOS[indice];
    pintarHud();
    evento("acto_visto", { acto: acto.n });

    var entrada = acto.entrada.map(function (p) { return '<p class="entrada">' + esc(p) + "</p>"; }).join("");
    var reto = acto.reto;
    var opciones = "";

    if (reto.tipo === "tarjetas") {
      opciones = reto.opciones.map(function (o, i) {
        var legal = o.legal === "En regla";
        return (
          '<button class="tarjeta-opcion" type="button" data-opcion="' + i + '">' +
            '<span class="marca-coche">' + esc(o.marca) + "</span>" +
            '<span class="precio">$' + o.precio.toLocaleString("es-ES") + " <small>USD</small></span>" +
            "<ul>" +
              "<li>Autonomía: <b>" + esc(o.autonomia) + "</b></li>" +
              "<li>Potencia: <b>" + esc(o.potencia) + "</b></li>" +
              "<li>Municipio: <b>" + esc(o.municipio) + "</b></li>" +
            "</ul>" +
            '<span class="legal' + (legal ? " ok" : "") + '">' + (legal ? "En regla" : "Legalidad: -") + "</span>" +
          "</button>"
        );
      }).join("");
    } else {
      var letras = ["A", "B", "C", "D"];
      opciones = reto.opciones.map(function (o, i) {
        return (
          '<button class="opcion" type="button" data-opcion="' + i + '">' +
            '<span class="letra">' + letras[i] + "</span>" +
            "<span>" + esc(o.texto) + "</span>" +
          "</button>"
        );
      }).join("");
    }

    $("pantalla-acto").innerHTML =
      '<article class="acto-escenario">' +
        '<div class="acto-banda">' +
          '<span class="numero">' + String(acto.n).padStart(2, "0") + "</span>" +
          '<span class="rotulo">Acto ' + acto.n + " · " + esc(acto.acto) + "</span>" +
          '<span class="puntos">' + PUNTOS_POR_ACTO + " puntos</span>" +
        "</div>" +
        '<div class="acto-cuerpo">' +
          "<h2>" + esc(acto.titulo) + "</h2>" +
          entrada +
          '<div class="dato-caja"><div><b>Dato de la investigación</b><p>' + esc(acto.dato) + "</p></div></div>" +
          '<div class="reto">' +
            '<div class="reto-etiqueta">Reto del acto</div>' +
            "<h3>" + esc(reto.pregunta) + "</h3>" +
            (reto.tipo === "tarjetas" ? '<div class="tarjetas-reto">' + opciones + "</div>" : '<div class="opciones">' + opciones + "</div>") +
            '<div id="feedback-acto"></div>' +
          "</div>" +
        "</div>" +
      "</article>";

    $("pantalla-acto").querySelectorAll("[data-opcion]").forEach(function (boton) {
      boton.addEventListener("click", function () {
        responder(parseInt(boton.getAttribute("data-opcion"), 10));
      });
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function responder(indiceOpcion) {
    if (estado.respondido) return;
    estado.respondido = true;
    var acto = ACTOS[estado.indice];
    var reto = acto.reto;
    var elegida = reto.opciones[indiceOpcion];
    var indiceCorrecto = reto.opciones.findIndex(function (o) { return o.correcta; });
    var correcta = !!elegida.correcta;
    var puntos = correcta ? PUNTOS_POR_ACTO : 0;

    estado.puntos += puntos;
    if (correcta) estado.aciertos += 1;
    estado.respuestas.push({
      acto: acto.n,
      eleccion: elegida.texto || elegida.marca,
      correcta: correcta
    });

    var botones = $("pantalla-acto").querySelectorAll("[data-opcion]");
    botones.forEach(function (boton, i) {
      boton.setAttribute("disabled", "disabled");
      if (i === indiceCorrecto) boton.classList.add("correcta");
      if (i === indiceOpcion && !correcta) boton.classList.add("incorrecta");
      if (i === indiceOpcion) boton.classList.add("elegida");
    });

    var esUltimo = estado.indice === ACTOS.length - 1;
    var detalle = "";
    if (!correcta) {
      detalle = elegida.retro ? " " + elegida.retro : "";
    }
    var feedback =
      '<div class="feedback ' + (correcta ? "bien" : "mal") + '">' +
        '<div class="feedback-cabeza">' + (correcta ? "✓ ¡Buena decisión!" : "✕ Casi. Mira lo que dicen los datos.") + "</div>" +
        "<p>" + esc(reto.explicacion) + esc(detalle) + "</p>" +
        '<div class="feedback-acciones">' +
          '<span class="feedback-puntos">+' + puntos + " puntos · Total <b>" + estado.puntos + "</b></span>" +
          '<button class="btn btn-teal btn-pequeno" type="button" id="siguiente-acto">' +
            (esUltimo ? "Ver mi resultado →" : "Continuar al acto " + (acto.n + 1) + " →") +
          "</button>" +
        "</div>" +
      "</div>";
    $("feedback-acto").innerHTML = feedback;

    evento("acto_completado", {
      acto: acto.n,
      correcta: correcta,
      puntos: puntos,
      eleccion: elegida.texto || elegida.marca
    }, puntos);

    $("siguiente-acto").addEventListener("click", function () {
      if (esUltimo) {
        mostrarFinal();
      } else {
        $("pantalla-acto").classList.add("oculto");
        $("pantalla-acto").classList.remove("pantalla");
        mostrarActo(estado.indice + 1);
        $("pantalla-acto").classList.remove("oculto");
        $("pantalla-acto").classList.add("pantalla");
      }
    });
  }

  function calcularNivel(pct) {
    if (pct >= 95) {
      return {
        titulo: "Piensas como una<br><em>científica de datos</em>",
        nivel: "Nivel: científica de datos",
        texto: "Leíste la ciudad con evidencia: observaste, comparaste fuentes y decidiste con presupuesto, autonomía y legalidad sobre la mesa."
      };
    }
    if (pct >= 75) {
      return {
        titulo: "Tienes ojo<br><em>de analista de calle</em>",
        nivel: "Nivel: analista de calle",
        texto: "Entiendes que los datos viven en la calle y que cada precio cuenta una historia. Un último cruce de variables y la ruta es tuya."
      };
    }
    if (pct >= 50) {
      return {
        titulo: "Vas bien:<br><em>aprendiz de asfalto</em>",
        nivel: "Nivel: aprendiz de asfalto",
        texto: "Ya distingues lo que se publica de lo que se vive. Vuelve a recorrer la ruta y mira lo que las entrevistas revelan."
      };
    }
    return {
      titulo: "La ciudad<br><em>te está llamando</em>",
      nivel: "Nivel: curiosa/o de la ciudad",
      texto: "Toda investigación empieza con una pregunta. Vuelve a jugar con los datos en la mano: la diferencia entre intuición y evidencia es la ruta."
    };
  }

  function mostrarFinal() {
    var respondidas = estado.respuestas.length;
    var posibles = respondidas * PUNTOS_POR_ACTO;
    var pct = posibles ? Math.round((estado.puntos / posibles) * 100) : 0;
    var nivel = calcularNivel(pct);
    var mejor = 0;
    try { mejor = parseInt(localStorage.getItem("triciclo_mejor") || "0", 10) || 0; } catch (e) {}
    var nuevoRecord = pct > mejor;
    if (nuevoRecord) {
      try { localStorage.setItem("triciclo_mejor", String(pct)); } catch (e) {}
    }

    $("pantalla-acto").classList.add("oculto");
    var final = $("pantalla-final");
    final.classList.remove("oculto");
    final.innerHTML =
      '<div class="final-juego">' +
        '<div class="medalla" style="--puntaje:' + pct + '%"><div class="puntaje">' + pct + "<small>/100</small></div></div>" +
        '<span class="kicker" style="justify-content:center">Resultado de la ruta</span>' +
        "<h2>" + nivel.titulo + "</h2>" +
        '<span class="nivel">' + esc(nivel.nivel) + "</span>" +
        '<p class="final-texto">' + esc(nivel.texto) + "</p>" +
        '<div class="final-metricas">' +
          "<div><b>" + estado.aciertos + "/" + respondidas + "</b><span>decisiones acertadas</span></div>" +
          "<div><b>20</b><span>historias detrás</span></div>" +
          "<div><b>8</b><span>municipios</span></div>" +
        "</div>" +
        '<div class="modal-dato">' +
          "<div><b>$3,941</b><span>precio promedio</span></div>" +
          "<div><b>75%</b><span>se usa para carga</span></div>" +
          "<div><b>1 de 12</b><span>con panel solar</span></div>" +
        "</div>" +
        '<div class="compartir">' +
          '<a class="btn btn-teal btn-pequeno" id="compartir-wa" href="#" target="_blank" rel="noopener">Compartir por WhatsApp</a>' +
          '<a class="btn btn-claro btn-pequeno" id="compartir-tg" href="#" target="_blank" rel="noopener">Telegram</a>' +
          '<button class="btn btn-claro btn-pequeno" type="button" id="copiar-final">Copiar enlace</button>' +
        "</div>" +
        '<div class="caja-reaccion-juego">' +
          "<h3>¿Te gustó la ruta?</h3>" +
          "<p>Tu reacción es anónima y me ayuda a medir el alcance de la campaña.</p>" +
          '<div class="reaccion-botones">' +
            '<button class="btn-reaccion" type="button" id="final-like"><span class="icono" aria-hidden="true">♥</span> Me gusta <b id="final-like-num">0</b></button>' +
            '<button class="btn-reaccion no" type="button" id="final-dislike"><span class="icono" aria-hidden="true">♡</span> No me gusta <b id="final-dislike-num">0</b></button>' +
          "</div>" +
          '<div class="reaccion-campos">' +
            '<div class="campo"><label for="final-nombre">Tu nombre (opcional)</label><input id="final-nombre" maxlength="40" placeholder="Visitante"></div>' +
            '<div class="campo"><label for="final-comentario">¿Qué te llevas? (opcional)</label><textarea id="final-comentario" maxlength="280" placeholder="Una frase, una duda, una idea…"></textarea></div>' +
            '<button class="btn btn-teal btn-bloque" type="button" id="final-enviar">Enviar mi reacción</button>' +
            '<p id="final-estado" role="status"></p>' +
          "</div>" +
        "</div>" +
        '<div class="final-enlaces">' +
          '<a href="/#historia">Leer la historia completa</a>' +
          '<a href="/#reacciones">Ver el muro de reacciones</a>' +
          '<a href="/#datos">Ver los datos del proyecto</a>' +
          '<a href="/juego" id="jugar-otra">Volver a jugar</a>' +
        "</div>" +
        (nuevoRecord ? '<p class="login-pistas" style="text-align:center;margin-top:1rem;color:var(--teal-2);font-weight:700">¡Nueva mejor marca personal!</p>' : "") +
      "</div>";

    final.classList.add("pantalla");
    pintarHudFinal();
    evento("juego_fin", {
      aciertos: estado.aciertos,
      respondidas: respondidas,
      nivel: nivel.nivel,
      acto_inicio: estado.inicioActo
    }, pct);

    if (pct >= 50) lanzarConfeti();
    configurarFinal();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function pintarHudFinal() {
    var hud = $("ruta-hud");
    hud.innerHTML = ACTOS.map(function (acto) {
      return (
        '<div class="ruta-nodo hecho">' +
          '<div class="ruta-punto">✓</div>' +
          "<span>" + esc(acto.acto) + "</span>" +
        "</div>"
      );
    }).join("");
    $("progreso-texto").innerHTML = "Ruta <b>completada</b>";
  }

  function lanzarConfeti() {
    var contenedor = $("confeti");
    var colores = ["#2aa6a0", "#f2a93b", "#f7f3ea", "#e2574c", "#173a60"];
    for (var i = 0; i < 90; i++) {
      var pieza = document.createElement("span");
      pieza.style.left = Math.random() * 100 + "vw";
      pieza.style.background = colores[Math.floor(Math.random() * colores.length)];
      pieza.style.animationDuration = (2.4 + Math.random() * 2.2) + "s";
      pieza.style.animationDelay = (Math.random() * 0.7) + "s";
      pieza.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      contenedor.appendChild(pieza);
    }
    setTimeout(function () { contenedor.innerHTML = ""; }, 6500);
  }

  function configurarFinal() {
    var enlace = window.location.origin + "/juego";
    var texto = "Hice La Ruta del Triciclo y saqué " + estado.puntos + " puntos. Una historia de ciencia de datos sobre el mercado de triciclos de La Habana. ¿Te atreves?";
    var wa = $("compartir-wa");
    var tg = $("compartir-tg");
    if (wa) {
      wa.href = "https://wa.me/?text=" + encodeURIComponent(texto + " " + enlace);
      wa.addEventListener("click", function () { evento("compartir", { red: "whatsapp", destino: enlace }); });
    }
    if (tg) {
      tg.href = "https://t.me/share/url?url=" + encodeURIComponent(enlace) + "&text=" + encodeURIComponent(texto);
      tg.addEventListener("click", function () { evento("compartir", { red: "telegram", destino: enlace }); });
    }
    var copiar = $("copiar-final");
    if (copiar) {
      copiar.addEventListener("click", function () {
        function listo() {
          copiar.textContent = "¡Enlace copiado!";
          setTimeout(function () { copiar.textContent = "Copiar enlace"; }, 1800);
        }
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
        evento("copiar_enlace", { destino: enlace });
      });
    }

    var reaccion = { valor: "", comentario: "", nombre: estado.nombre || "" };
    try {
      var guardada = JSON.parse(localStorage.getItem("triciclo_reaccion") || "{}");
      if (guardada && guardada.valor) reaccion = Object.assign(reaccion, guardada);
    } catch (e) {}
    var nombreCampo = $("final-nombre");
    var comentarioCampo = $("final-comentario");
    var like = $("final-like");
    var dislike = $("final-dislike");
    var enviar = $("final-enviar");
    var estadoTexto = $("final-estado");
    if (nombreCampo) nombreCampo.value = reaccion.nombre || estado.nombre || "";
    if (comentarioCampo) comentarioCampo.value = reaccion.comentario || "";

    function pintar() {
      if (like) like.classList.toggle("activo", reaccion.valor === "me_gusta");
      if (dislike) dislike.classList.toggle("activo", reaccion.valor === "no_me_gusta");
    }
    pintar();

    if (like) like.addEventListener("click", function () {
      reaccion.valor = "me_gusta";
      pintar();
      if (estadoTexto) { estadoTexto.textContent = "Reacción elegida. Puedes añadir un comentario."; estadoTexto.style.color = ""; }
    });
    if (dislike) dislike.addEventListener("click", function () {
      reaccion.valor = "no_me_gusta";
      pintar();
      if (estadoTexto) { estadoTexto.textContent = "Reacción elegida. Puedes añadir un comentario."; estadoTexto.style.color = ""; }
    });

    if (enviar) {
      enviar.addEventListener("click", function () {
        if (!reaccion.valor) {
          if (estadoTexto) {
            estadoTexto.textContent = "Primero elige me gusta o no me gusta.";
            estadoTexto.style.color = "#a53228";
          }
          return;
        }
        reaccion.comentario = comentarioCampo ? comentarioCampo.value.trim() : "";
        reaccion.nombre = nombreCampo ? nombreCampo.value.trim() : "";
        enviar.disabled = true;
        enviar.textContent = "Enviando…";
        fetch("/api/reaccion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            valor: reaccion.valor,
            comentario: reaccion.comentario,
            nombre: reaccion.nombre,
            puntuacion: Math.round((estado.puntos / (estado.respuestas.length * PUNTOS_POR_ACTO)) * 100),
            visitante: window.Analitica ? window.Analitica.visitante : "",
            pagina: "/juego",
            origen: window.Analitica ? window.Analitica.origen : "directo",
            dispositivo: window.Analitica ? window.Analitica.dispositivo : "desconocido"
          })
        }).then(function (r) { return r.json(); }).then(function (datos) {
          if (!datos.ok) throw new Error(datos.error || "Error");
          try { localStorage.setItem("triciclo_reaccion", JSON.stringify(reaccion)); } catch (e) {}
          if ($("final-like-num")) $("final-like-num").textContent = datos.me_gusta;
          if ($("final-dislike-num")) $("final-dislike-num").textContent = datos.no_me_gusta;
          if (estadoTexto) {
            estadoTexto.textContent = "¡Gracias! Tu reacción ya forma parte de la ruta.";
            estadoTexto.style.color = "";
          }
        }).catch(function () {
          if (estadoTexto) {
            estadoTexto.textContent = "No se pudo enviar. Inténtalo de nuevo.";
            estadoTexto.style.color = "#a53228";
          }
        }).finally(function () {
          enviar.disabled = false;
          enviar.textContent = "Enviar mi reacción";
        });
      });
    }

    fetch("/api/muro").then(function (r) { return r.json(); }).then(function (datos) {
      if ($("final-like-num")) $("final-like-num").textContent = datos.me_gusta || 0;
      if ($("final-dislike-num")) $("final-dislike-num").textContent = datos.no_me_gusta || 0;
    }).catch(function () {});
  }

  prepararInicio();
})();
