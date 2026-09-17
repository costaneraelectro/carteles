/* Generador de Carteles — Falabella */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);

  /* ---------- Config (localStorage) ---------- */
  const CFG_KEY = "carteles_cfg_v1";
  const DEFAULT_LEGAL =
    "EL PAGO CON TARJETAS PUEDE TENER COSTOS ASOCIADOS. CONSULTAR AL EMISOR PARA MAYOR INFORMACIÓN. " +
    "INFÓRMESE SOBRE LA GARANTÍA ESTATAL DE LOS DEPÓSITOS EN SU BANCO O EN WWW.CMFCHILE.CL. COSTO TOTAL " +
    "DEL CRÉDITO (CTC) INCLUYE IMPUESTO DE TIMBRES Y ESTAMPILLAS. CANJE Y ACUMULACIÓN DE PUNTOS SUJETOS A " +
    "TÉRMINOS Y CONDICIONES DEL REGLAMENTO DEL PROGRAMA CMR PUNTOS VIGENTE.";
  const DEFAULT_HEADER = "TENEMOS MÁS DE LO QUE PODEMOS MOSTRAR |ONLINE|"; // |x| = verde

  const DEFAULT_CFG = {
    header: DEFAULT_HEADER,
    legal: DEFAULT_LEGAL,
    // banners de evento (para el selector)
    eventos: [
      { id: "exclusivo", label: "Exclusivo falabella.com", src: "assets/banners/exclusivo-falabella.png" },
      { id: "sneaker",   label: "Sneaker Corner",          src: "assets/banners/sneaker-corner.png" },
      { id: "cyber",     label: "CyberDay Electro",        src: "" },
    ],
    // slots fijos (sellos/logos)
    slots: {
      badgeUnica:  { label: "Sello Oportunidad única + CMR", src: "" },
      cmrPuntos:   { label: "Logo CMR puntos (pie)",         src: "assets/logos/cmr-puntos.png" },
    },
  };

  let CFG = load();
  function load() {
    try {
      const raw = localStorage.getItem(CFG_KEY);
      if (raw) return Object.assign(structuredClone(DEFAULT_CFG), JSON.parse(raw));
    } catch (e) {}
    return structuredClone(DEFAULT_CFG);
  }
  function save() { try { localStorage.setItem(CFG_KEY, JSON.stringify(CFG)); } catch (e) {} }

  /* ---------- Utilidades ---------- */
  const clp = (n) => (n === "" || n == null || isNaN(n)) ? "" : "$" + Math.round(Number(n)).toLocaleString("es-CL");
  const num = (id) => { const v = parseFloat($(id).value); return isNaN(v) ? NaN : v; };

  // Factores tabla 12 cuotas @ CAE 39,93% (derivados de carteles reales)
  const F_CUOTA = 0.101296;
  const F_CTC = 1.22347;

  /* ---------- Tabs ---------- */
  document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    $("pane-cartel").classList.toggle("hidden", t.dataset.tab !== "cartel");
    $("pane-config").classList.toggle("hidden", t.dataset.tab !== "config");
  }));

  /* ---------- Poblar selector de eventos ---------- */
  function fillEventos() {
    const sel = $("evento");
    const prev = sel.value;
    sel.innerHTML = '<option value="">Ninguno (header online)</option>';
    CFG.eventos.forEach((e) => {
      const o = document.createElement("option");
      o.value = e.id; o.textContent = e.label + (e.src ? "" : " (sin imagen)");
      sel.appendChild(o);
    });
    sel.value = prev;
  }

  /* ---------- Header con resaltado |verde| ---------- */
  function headerHTML(txt) {
    return (txt || "").replace(/\|([^|]+)\|/g, '<b>$1</b>');
  }

  /* ====================================================================
     RENDER DEL CARTEL
     ==================================================================== */
  let manualImg = null, qrData = null;

  function render() {
    const tipo = $("tipo").value;           // normal | oferta | cmr
    const esCmr = tipo === "cmr";
    const esOferta = tipo === "oferta";
    const electro = $("electro").checked;

    /* Evento / header */
    const evId = $("evento").value;
    const ev = CFG.eventos.find((e) => e.id === evId);
    if (ev && ev.src) {
      $("evtBar").classList.remove("hidden");
      $("evtImg").src = ev.src;
      $("header").classList.add("hidden");
    } else {
      $("evtBar").classList.add("hidden");
      $("header").classList.remove("hidden");
      $("headerTxt").innerHTML = headerHTML(CFG.header);
    }

    /* QR */
    const qrOn = $("showQr").checked && qrData;
    $("qrImg").classList.toggle("hidden", !qrOn);
    if (qrOn) $("qrImg").src = qrData;

    /* Imagen producto */
    const showImg = $("showImg").checked;
    const media = $("media");
    if (showImg) {
      media.classList.remove("hidden");
      const sku = $("sku").value.trim();
      let src = manualImg;
      if (!src && sku) src = "https://media.falabella.com/falabellaCL/" + encodeURIComponent(sku) + "/public";
      if (src) { $("mediaImg").src = src; $("mediaImg").classList.remove("hidden"); $("mediaPh").classList.add("hidden"); }
      else { $("mediaImg").classList.add("hidden"); $("mediaPh").classList.remove("hidden"); }
    } else media.classList.add("hidden");

    /* Info */
    $("oMarca").textContent = $("marca").value.toUpperCase();
    $("oCat").textContent = $("categoria").value.toUpperCase();
    const modelo = $("modelo").value.trim(), sku = $("sku").value.trim();
    $("oModelo").innerHTML = (modelo ? "<b>" + modelo + "</b>" : "") + (modelo && sku ? " / " : "") + (sku || "");

    /* Badge CMR */
    const badge = $("badge");
    if (esCmr) {
      badge.classList.remove("hidden");
      const s = CFG.slots.badgeUnica.src;
      badge.innerHTML = s
        ? '<img src="' + s + '" alt="Oportunidad única CMR" />'
        : '<span class="fallback"><span class="fb-unica"><small>Oportunidad</small><b>única</b></span><span class="fb-cmr">CMR</span></span>';
    } else badge.classList.add("hidden");

    /* Campos de precio visibles según tipo */
    $("fCmr").classList.toggle("hidden", !esCmr);
    $("fMedio").classList.toggle("hidden", !(esCmr || esOferta));
    $("fNormal").classList.toggle("hidden", tipo === "normal");
    $("lblPrecio").textContent = esCmr ? "Precio (referencia)" : esOferta ? "Precio oferta TMP" : "Precio";

    /* ¿Mostrar cuotas? oferta: electro y precio>100k. cmr: siempre que sea electro-ish -> mostramos si hay precioCmr */
    const precio = num("precio");
    const precioCmr = num("precioCmr");
    const precioNormal = num("precioNormal");
    const precioMedio = num("precioMedio");

    const baseCuota = esCmr ? precioCmr : precio;
    let mostrarCuotas = false;
    if (esCmr) mostrarCuotas = !isNaN(baseCuota);
    else if (esOferta) mostrarCuotas = electro && !isNaN(precio) && precio > 100000;
    else mostrarCuotas = electro && !isNaN(precio) && precio > 100000;

    /* Auto cuota / CTC */
    const nc = parseInt($("nCuotas").value, 10) || 12;
    const caeTxt = $("cae").value.trim() || "39,93%";
    let vc = num("valorCuota");
    let ctc = num("ctc");
    if (isNaN(vc) && !isNaN(baseCuota)) vc = nc === 12 ? Math.round(baseCuota * F_CUOTA) : Math.round(baseCuota / nc);
    if (isNaN(ctc) && !isNaN(baseCuota)) ctc = nc === 12 ? Math.round(baseCuota * F_CTC) : Math.round(vc * nc);

    const cuotasBlock = mostrarCuotas && !isNaN(vc)
      ? '<div class="p-cuotas">' + nc + ' CUOTAS DE ' + clp(vc) + '</div>' +
        '<div class="p-cae">CAE: ' + caeTxt + ' / CTC: ' + clp(ctc) + '</div>'
      : "";

    /* Construir bloque de precios */
    const P = $("precios");
    let html = "";
    if (esCmr) {
      // Precio CMR (rojo) + cuotas + [otro medio] + normal  — grandes
      html += '<div class="p-line"><div class="p-val lg p-rojo">' + (clp(precioCmr) || "$0") + '</div></div>';
      html += cuotasBlock;
      if (!isNaN(precioMedio))
        html += '<div class="p-line"><div class="p-val md p-negro">' + clp(precioMedio) + '</div><div class="p-sub">OTRO MEDIO DE PAGO</div></div>';
      if (!isNaN(precioNormal))
        html += '<div class="p-line"><div class="p-val md p-negro">' + clp(precioNormal) + '</div><div class="p-sub">PRECIO NORMAL</div></div>';
    } else if (esOferta) {
      html += '<div class="p-tag p-rojo">OFERTA TODO MEDIO DE PAGO</div>';
      html += '<div class="p-line"><div class="p-val xl p-rojo">' + (clp(precio) || "$0") + '</div></div>';
      html += cuotasBlock;
      if (!isNaN(precioNormal))
        html += '<div class="p-line"><div class="p-val md p-negro">' + clp(precioNormal) + '</div><div class="p-sub">PRECIO NORMAL</div></div>';
    } else {
      html += '<div class="p-line"><div class="p-val xl p-negro">' + (clp(precio) || "$0") + '</div><div class="p-sub">PRECIO NORMAL</div></div>';
      html += cuotasBlock;
    }
    P.innerHTML = html;

    /* Footer */
    const d = $("vigDesde").value.trim(), h = $("vigHasta").value.trim();
    $("fVig").textContent = (d || h) ? ("VIGENCIA: " + d + (h ? "  " + h : "")) : "";
    $("fLegal").textContent = CFG.legal;
    $("fPag").textContent = $("pagina").value.trim();
    const cmrLogo = CFG.slots.cmrPuntos.src;
    $("fCmrLogo").style.display = cmrLogo ? "" : "none";
    if (cmrLogo) $("fCmrLogo").src = cmrLogo;
  }

  /* ---------- Toggles dependientes ---------- */
  $("showImg").addEventListener("change", () => { $("imgManualWrap").classList.toggle("hidden", !$("showImg").checked); render(); });
  $("showQr").addEventListener("change", () => { $("qrWrap").classList.toggle("hidden", !$("showQr").checked); render(); });

  $("imagen").addEventListener("change", (e) => readFile(e, (d) => { manualImg = d; render(); }));
  $("qr").addEventListener("change", (e) => readFile(e, (d) => { qrData = d; render(); }));
  function readFile(e, cb) { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = (x) => cb(x.target.result); r.readAsDataURL(f); }

  /* ---------- Escuchar inputs ---------- */
  ["tipo","evento","marca","sku","categoria","modelo","precio","precioCmr","precioMedio","precioNormal",
   "electro","nCuotas","cae","valorCuota","ctc","vigDesde","vigHasta","pagina"]
    .forEach((id) => { $(id).addEventListener("input", render); $(id).addEventListener("change", render); });

  /* ====================================================================
     CONFIG UI
     ==================================================================== */
  function renderConfig() {
    // banners
    const list = $("bannerlist"); list.innerHTML = "";
    CFG.eventos.forEach((ev, i) => list.appendChild(bannerRow(ev, i)));
    // slots
    const sl = $("slotlist"); sl.innerHTML = "";
    Object.keys(CFG.slots).forEach((k) => sl.appendChild(slotRow(k, CFG.slots[k])));
    $("cfgHeader").value = CFG.header;
    $("cfgLegal").value = CFG.legal;
    fillEventos();
  }

  function thumb(src) {
    const t = document.createElement("div"); t.className = "thumb";
    if (src) { const im = document.createElement("img"); im.src = src; t.appendChild(im); }
    else t.textContent = "—";
    return t;
  }

  function bannerRow(ev, i) {
    const row = document.createElement("div"); row.className = "banneritem";
    row.appendChild(thumb(ev.src));
    const meta = document.createElement("div"); meta.className = "meta";
    const inp = document.createElement("input"); inp.value = ev.label;
    inp.addEventListener("input", () => { ev.label = inp.value; save(); fillEventos(); });
    const sm = document.createElement("small"); sm.textContent = "id: " + ev.id;
    meta.appendChild(inp); meta.appendChild(sm);
    row.appendChild(meta);
    const ops = document.createElement("div"); ops.className = "ops";
    ops.appendChild(uploadBtn((d) => { ev.src = d; save(); renderConfig(); render(); }));
    const del = document.createElement("button"); del.className = "del"; del.textContent = "Borrar";
    del.addEventListener("click", () => { CFG.eventos.splice(i, 1); save(); renderConfig(); render(); });
    ops.appendChild(del);
    row.appendChild(ops);
    return row;
  }

  function slotRow(key, slot) {
    const row = document.createElement("div"); row.className = "banneritem";
    row.appendChild(thumb(slot.src));
    const meta = document.createElement("div"); meta.className = "meta";
    const b = document.createElement("div"); b.style.fontWeight = "700"; b.style.fontSize = "13px"; b.textContent = slot.label;
    const sm = document.createElement("small"); sm.textContent = slot.src ? "cargado" : "sin imagen — súbela";
    meta.appendChild(b); meta.appendChild(sm);
    row.appendChild(meta);
    const ops = document.createElement("div"); ops.className = "ops";
    ops.appendChild(uploadBtn((d) => { slot.src = d; save(); renderConfig(); render(); }));
    if (slot.src) {
      const del = document.createElement("button"); del.className = "del"; del.textContent = "Quitar";
      del.addEventListener("click", () => { slot.src = ""; save(); renderConfig(); render(); });
      ops.appendChild(del);
    }
    row.appendChild(ops);
    return row;
  }

  function uploadBtn(cb) {
    const wrap = document.createElement("button"); wrap.textContent = "Subir";
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.style.display = "none";
    inp.addEventListener("change", (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = (x) => cb(x.target.result); r.readAsDataURL(f); });
    wrap.addEventListener("click", () => inp.click());
    wrap.appendChild(inp);
    return wrap;
  }

  $("addBanner").addEventListener("click", () => {
    const id = "ev" + Date.now();
    CFG.eventos.push({ id, label: "Nuevo banner", src: "" });
    save(); renderConfig();
  });
  $("cfgHeader").addEventListener("input", () => { CFG.header = $("cfgHeader").value; save(); render(); });
  $("cfgLegal").addEventListener("input", () => { CFG.legal = $("cfgLegal").value; save(); render(); });
  $("resetCfg").addEventListener("click", () => {
    if (!confirm("¿Restaurar configuración por defecto? Se perderán los banners subidos en este navegador.")) return;
    CFG = structuredClone(DEFAULT_CFG); save(); renderConfig(); render();
  });

  /* ====================================================================
     EXPORT
     ==================================================================== */
  async function snapshot() {
    return html2canvas($("cartel"), { scale: 2, useCORS: true, backgroundColor: "#ffffff", width: 750, height: 1000 });
  }
  const nombre = () => (($("marca").value || "cartel") + "-" + ($("sku").value || Date.now()))
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  $("btnPng").addEventListener("click", async () => {
    try {
      const c = await snapshot();
      const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = nombre() + ".png"; a.click();
    } catch (e) { alert("No se pudo exportar. Si la imagen viene del SKU, puede bloquear la descarga (CORS). Sube la imagen manual."); }
  });
  $("btnPdf").addEventListener("click", async () => {
    try {
      const c = await snapshot();
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: "in", format: "letter", orientation: "portrait" });
      pdf.addImage(c.toDataURL("image/png"), "PNG", 0.5, 0.5, 7.5, 10);
      pdf.save(nombre() + ".pdf");
    } catch (e) { alert("No se pudo exportar. Si la imagen viene del SKU, puede bloquear la descarga (CORS). Sube la imagen manual."); }
  });

  /* ---------- Fit preview ---------- */
  function fitStage() {
    const s = $("stageScale");
    const scale = Math.min(1, s.parentElement.clientWidth / 750);
    s.style.transform = "scale(" + scale + ")"; s.style.height = (1000 * scale) + "px";
  }
  window.addEventListener("resize", fitStage);

  /* ---------- Init ---------- */
  renderConfig();
  render();
  fitStage();
})();
