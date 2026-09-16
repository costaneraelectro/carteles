/* Generador de Carteles — lógica de armado, detección y exportación */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const EVENTOS = {
    cyber:     { img: "assets/banners/sneaker-corner.png", cls: "cyber", texto: "CYBER DAY" },
    sneaker:   { img: "assets/banners/sneaker-corner.png", cls: "" },
    exclusivo: { img: "assets/banners/exclusivo-falabella.png", cls: "" },
  };

  // Formatea número a pesos chilenos: 379990 -> "$379.990"
  function clp(n) {
    if (n === "" || n === null || n === undefined || isNaN(n)) return "";
    return "$" + Math.round(Number(n)).toLocaleString("es-CL");
  }

  function setText(id, txt) {
    const el = $(id);
    el.textContent = txt || "";
    el.classList.toggle("hidden", !txt);
  }

  function render() {
    // ---- Evento / banner ----
    const evtVal = $("evento").value;
    const evtBar = $("evtBar");
    if (evtVal && EVENTOS[evtVal]) {
      evtBar.classList.remove("hidden");
      evtBar.className = "cartel__evento " + (EVENTOS[evtVal].cls || "");
      $("evtImg").src = EVENTOS[evtVal].img;
    } else {
      evtBar.classList.add("hidden");
    }

    // ---- Producto ----
    setText("oMarca", $("marca").value.toUpperCase());
    setText("oCat", $("categoria").value.toUpperCase());
    setText("oModelo", $("modelo").value);
    const sku = $("sku").value.trim();
    setText("oSku", sku ? "SKU: " + sku : "");

    // ---- Electro toggle ----
    const esElectro = $("depto").value === "electro";
    $("fsElectro").classList.toggle("hidden", !esElectro);
    $("sellos").classList.toggle("hidden", !esElectro);
    $("pElectro").classList.toggle("hidden", !esElectro);

    // ---- Precios / detección de OFERTA ----
    const precio = parseFloat($("precio").value);
    const normal = parseFloat($("precioNormal").value);
    const medio = parseFloat($("precioMedio").value);
    const hayOferta = !isNaN(normal) && !isNaN(precio) && normal > precio;

    const box = $("precioBox");
    box.classList.toggle("oferta", hayOferta);
    $("pTag").textContent = hayOferta ? "PRECIO OFERTA" : "PRECIO NORMAL";

    $("pMain").textContent = clp(precio) || "$0";

    // precio normal tachado (solo en oferta)
    $("pNormalWrap").classList.toggle("hidden", !hayOferta);
    if (hayOferta) $("pNormal").textContent = clp(normal);

    // ---- Electro: cuotas + CAE ----
    if (esElectro) {
      const nc = parseInt($("nCuotas").value, 10);
      let vc = parseFloat($("valorCuota").value);
      if ((isNaN(vc) || vc <= 0) && !isNaN(precio) && nc > 0) vc = precio / nc;
      if (!isNaN(nc) && nc > 0 && !isNaN(vc)) {
        $("pCuotas").innerHTML = nc + " CUOTAS DE <small>" + clp(vc) + "</small>";
      } else {
        $("pCuotas").textContent = "";
      }
      const cae = $("cae").value.trim();
      const ctc = parseFloat($("ctc").value);
      let caeLine = "";
      if (cae) caeLine += "CAE: " + cae;
      if (!isNaN(ctc)) caeLine += (caeLine ? " / " : "") + "CTC: " + clp(ctc);
      $("pCae").textContent = caeLine;

      // "otro medio de pago" dentro del bloque electro
      const em = $("pMedioElectro");
      if (!isNaN(medio)) { em.textContent = clp(medio) + " TODO MEDIO DE PAGO"; em.classList.remove("hidden"); }
      else em.classList.add("hidden");
      $("pMedio").classList.add("hidden");
    } else {
      // no electro: "todo medio de pago" simple bajo el precio (si hay oferta)
      const pm = $("pMedio");
      if (hayOferta && !isNaN(medio)) { pm.textContent = clp(medio) + " · TODO MEDIO DE PAGO"; pm.classList.remove("hidden"); }
      else if (hayOferta) { pm.textContent = "TODO MEDIO DE PAGO"; pm.classList.remove("hidden"); }
      else pm.classList.add("hidden");
    }

    // ---- Vigencia (solo con oferta) ----
    const vig = $("vigencia").value.trim();
    setText("pVigencia", hayOferta && vig ? vig : "");

    // ---- Oportunidad única CMR ----
    const cmrOn = $("cmr").checked;
    $("unicaBox").classList.toggle("hidden", !cmrOn);
    if (cmrOn) $("uMonto").textContent = $("cmrMonto").value.trim() || "$0";
    setText("cmrCondFoot", cmrOn ? $("cmrCond").value.trim() : "");
  }

  // ---- Imagen del producto ----
  $("imagen").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      $("mediaImg").src = ev.target.result;
      $("mediaImg").classList.remove("hidden");
      $("mediaPh").classList.add("hidden");
    };
    reader.readAsDataURL(file);
  });

  // ---- Escuchar todos los inputs ----
  ["evento","depto","marca","sku","categoria","modelo","precio","precioNormal",
   "precioMedio","vigencia","cmr","cmrMonto","cmrCond","nCuotas","valorCuota","cae","ctc"]
    .forEach((id) => {
      const el = $(id);
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    });

  // ---- Escalado del preview al ancho disponible ----
  function fitStage() {
    const stage = $("stageScale");
    const avail = stage.parentElement.clientWidth;
    const scale = Math.min(1, avail / 750);
    stage.style.transform = "scale(" + scale + ")";
    stage.style.height = (1000 * scale) + "px";
  }
  window.addEventListener("resize", fitStage);

  // ---- Exportar ----
  async function snapshot() {
    const node = $("cartel");
    return html2canvas(node, { scale: 2, useCORS: true, backgroundColor: "#ffffff", width: 750, height: 1000 });
  }
  function nombre() {
    return (($("marca").value || "cartel") + "-" + ($("sku").value || Date.now()))
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  $("btnPng").addEventListener("click", async () => {
    const canvas = await snapshot();
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = nombre() + ".png";
    a.click();
  });
  $("btnPdf").addEventListener("click", async () => {
    const canvas = await snapshot();
    const { jsPDF } = window.jspdf;
    // Carta vertical: 8.5 x 11 in. Cartel 7.5x10 centrado.
    const pdf = new jsPDF({ unit: "in", format: "letter", orientation: "portrait" });
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0.5, 0.5, 7.5, 10);
    pdf.save(nombre() + ".pdf");
  });

  // init
  render();
  fitStage();
})();
