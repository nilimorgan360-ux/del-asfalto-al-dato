(function () {
  "use strict";

  var enlace = window.location.origin + "/juego";

  document.querySelectorAll("[data-enlace-juego]").forEach(function (el) {
    if (el.tagName === "CODE") {
      el.textContent = enlace;
    } else {
      el.setAttribute("href", enlace);
    }
  });

  var copiar = document.getElementById("copiar-qr");
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
      if (window.Analitica) window.Analitica.evento("copiar_enlace", { destino: enlace });
    });
  }

  var imprimir = document.getElementById("imprimir-qr");
  if (imprimir) {
    imprimir.addEventListener("click", function () {
      if (window.Analitica) window.Analitica.evento("imprimir_qr", { destino: enlace });
      window.print();
    });
  }
})();
