/* Generador de Carteles — Falabella */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);

  /* ---------- Tipos ---------- */
  const TIPOS = {
    normal_cae:    { oferta: false, ou: false, cae: true },
    normal_sincae: { oferta: false, ou: false, cae: false },
    oferta_cae:    { oferta: true,  ou: false, cae: true },
    oferta_sincae: { oferta: true,  ou: false, cae: false },
    ou_cae:        { oferta: false, ou: true,  cae: true },
    ou_sincae:     { oferta: false, ou: true,  cae: false },
  };

  /* ---------- Config ---------- */
  const CFG_KEY = "carteles_cfg_v2";
  const DEFAULT_LEGAL =
    "EL PAGO CON TARJETAS PUEDE TENER COSTOS ASOCIADOS. CONSULTAR AL EMISOR PARA MAYOR INFORMACIÓN. INFÓRMESE " +
    "SOBRE LA GARANTÍA ESTATAL DE LOS DEPÓSITOS EN SU BANCO O EN WWW.CMFCHILE.CL. COSTO TOTAL DEL CRÉDITO (CTC) " +
    "INCLUYE IMPUESTO DE TIMBRES Y ESTAMPILLAS. CANJE Y ACUMULACIÓN DE PUNTOS SUJETOS A TÉRMINOS Y CONDICIONES DEL " +
    "REGLAMENTO DEL PROGRAMA FPUNTOS VIGENTE.";

  const DEFAULT_CFG = {
    legal: DEFAULT_LEGAL,
    proxy: "https://api.allorigins.win/raw?url=",
    eventos: [
      { id: "online",    label: "Tenemos más online (por defecto)", src: "assets/banners/tenemos-mas.png", franja: false },
      { id: "exclusivo", label: "Exclusivo falabella.com",          src: "assets/banners/exclusivo-falabella.png", franja: true },
      { id: "cyber",     label: "CyberDay Electro",                 src: "assets/banners/cyber.png", franja: true },
      { id: "sneaker",   label: "Sneaker Corner",                   src: "assets/banners/sneaker-corner.png", franja: true },
    ],
    slots: {
      badgeUnica: { label: "Sello Oportunidad única + CMR", src: "" },
      cmrCard:    { label: "Mini tarjeta CMR (junto a cuotas)", src: "" },
      fpuntos:    { label: "Logo Fpuntos (pie)", src: "assets/logos/fpuntos.png" },
    },
  };

  let CFG = load();
  function load() {
    try { const r = localStorage.getItem(CFG_KEY); if (r) return Object.assign(structuredClone(DEFAULT_CFG), JSON.parse(r)); } catch (e) {}
    return structuredClone(DEFAULT_CFG);
  }
  function save() { try { localStorage.setItem(CFG_KEY, JSON.stringify(CFG)); } catch (e) {} }

  /* ---------- Utils ---------- */
  const clp = (n) => (n === "" || n == null || isNaN(n)) ? "" : "$" + Math.round(Number(n)).toLocaleString("es-CL");
  const num = (id) => { const v = parseFloat($(id).value); return isNaN(v) ? NaN : v; };
  const F_CUOTA = 0.101296, F_CTC = 1.22347;

  /* ---------- Tabs ---------- */
  document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    $("pane-cartel").classList.toggle("hidden", t.dataset.tab !== "cartel");
    $("pane-config").classList.toggle("hidden", t.dataset.tab !== "config");
  }));

  /* ---------- Selector de banner ---------- */
  function fillEventos() {
    const sel = $("evento"), prev = sel.value;
    sel.innerHTML = "";
    CFG.eventos.forEach((e) => {
      const o = document.createElement("option");
      o.value = e.id; o.textContent = e.label + (e.src ? "" : " (sin imagen)");
      sel.appendChild(o);
    });
    sel.value = prev || (CFG.eventos[0] && CFG.eventos[0].id) || "";
  }

  /* ---------- Imagen manual / QR ---------- */
  let manualImg = null;
  $("imagen").addEventListener("change", (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = (x) => { manualImg = x.target.result; render(); }; r.readAsDataURL(f); });

  let qrObj = null;
  function drawQR(link) {
    const box = $("qrBox"); box.innerHTML = "";
    if (!link) return;
    try { qrObj = new QRCode(box, { text: link, width: 260, height: 260, correctLevel: QRCode.CorrectLevel.M }); } catch (e) {}
  }

  /* ====================================================================
     RENDER
     ==================================================================== */
  function render() {
    const t = TIPOS[$("tipo").value];

    /* Banner */
    const ev = CFG.eventos.find((e) => e.id === $("evento").value);
    const franja = ev && ev.franja && ev.src;
    const header = ev && !ev.franja && ev.src;
    $("franja").classList.toggle("hidden", !franja);
    $("top").classList.toggle("hidden", !header);
    if (franja) $("franjaImg").src = ev.src;
    if (header) $("topBannerImg").src = ev.src;

    /* QR */
    const qrOn = $("showQr").checked && $("qrLink").value.trim();
    $("franja").classList.toggle("has-qr", !!(franja && qrOn));
    $("qrBox").classList.toggle("hidden", !qrOn);
    if (qrOn) { if ($("qrBox").dataset.link !== $("qrLink").value.trim()) { $("qrBox").dataset.link = $("qrLink").value.trim(); drawQR($("qrLink").value.trim()); } }
    else { $("qrBox").innerHTML = ""; $("qrBox").dataset.link = ""; }

    /* Imagen */
    const showImg = $("showImg").checked;
    $("media").classList.toggle("hidden", !showImg);
    if (showImg) {
      const sku = $("sku").value.trim();
      const src = manualImg || (sku ? "https://media.falabella.com/falabellaCL/" + encodeURIComponent(sku) + "/public" : "");
      if (src) $("mediaImg").src = src;
    }

    /* Info */
    $("oMarca").textContent = $("marca").value.toUpperCase();
    $("oCat").textContent = $("categoria").value.toUpperCase();
    const modelo = $("modelo").value.trim(), sku = $("sku").value.trim();
    $("oModelo").textContent = modelo ? "MODELO: " + modelo.toUpperCase() : "";
    $("oModelo").classList.toggle("hidden", !modelo);
    $("oSku").textContent = sku ? "SKU: " + sku : "";
    $("oSku").classList.toggle("hidden", !sku);

    /* Badge OU */
    const badge = $("badge");
    badge.classList.toggle("hidden", !t.ou);
    if (t.ou) {
      const s = CFG.slots.badgeUnica.src;
      badge.innerHTML = s ? '<img src="' + s + '" alt="Oportunidad única" />'
        : '<div class="ph">Sube el sello «Oportunidad única + CMR»<br>en Configuración</div>';
    }

    /* Campos visibles */
    $("fOU").classList.toggle("hidden", !t.ou);
    $("fOferta").classList.toggle("hidden", !(t.oferta || (t.ou && $("ouTmp").checked)));
    $("fPrecio").classList.toggle("hidden", t.oferta || t.ou);
    $("fNormal").classList.toggle("hidden", !(t.oferta || t.ou));
    $("ouTmpWrap").classList.toggle("hidden", !t.ou);
    $("fsElectro").classList.toggle("hidden", !t.cae);

    /* Precios */
    const precio = num("precio"), precioNormal = num("precioNormal"),
          precioOferta = num("precioOferta"), precioOU = num("precioOU");
    const base = t.ou ? precioOU : t.oferta ? precioOferta : precio;

    /* cuotas auto */
    const nc = parseInt($("nCuotas").value, 10) || 12;
    const caeTxt = $("cae").value.trim() || "39,93%";
    let vc = num("valorCuota"), ctc = num("ctc");
    if (isNaN(vc) && !isNaN(base)) vc = nc === 12 ? Math.round(base * F_CUOTA) : Math.round(base / nc);
    if (isNaN(ctc) && !isNaN(base)) ctc = nc === 12 ? Math.round(base * F_CTC) : Math.round(vc * nc);
    const card = CFG.slots.cmrCard.src;
    const cuotasHTML = (t.cae && !isNaN(vc))
      ? '<div class="p-cuotas-wrap">' +
          (card ? '<img src="' + card + '" alt="CMR" />' : '') +
          '<div class="p-cuotas-txt"><div class="p-cuotas">' + nc + ' CUOTAS DE ' + clp(vc) + '</div>' +
          '<div class="p-cae">CAE: ' + caeTxt + ' / CTC: ' + clp(ctc) + '</div></div></div>'
      : "";

    const line = (tag, val, cls, size) =>
      '<div class="p-block">' + (tag ? '<div class="p-tag ' + (cls || '') + '">' + tag + '</div>' : '') +
      '<div class="p-val ' + size + ' ' + (cls || 'p-negro') + '">' + (val || '$0') + '</div></div>';

    let html = "";
    if (t.ou) {
      // OU: precio OU (rojo) + cuotas + [oferta TMP] + normal — los 3 del mismo tamaño (lg)
      html += line("", clp(precioOU), "p-rojo", "lg");
      html += cuotasHTML;
      if ($("ouTmp").checked && !isNaN(precioOferta)) html += line("TODO MEDIO DE PAGO", clp(precioOferta), "p-negro", "lg");
      if (!isNaN(precioNormal)) html += line("PRECIO NORMAL", clp(precioNormal), "p-negro", "lg");
    } else if (t.oferta) {
      html += line("TODO MEDIO DE PAGO", clp(precioOferta), "p-rojo", "xl");
      html += cuotasHTML;
      if (!isNaN(precioNormal)) html += line("PRECIO NORMAL", clp(precioNormal), "p-negro", "md");
    } else {
      html += line("", clp(precio), "p-negro", "xl");
      html += cuotasHTML;
    }
    $("precios").innerHTML = html;

    /* Footer */
    const d = $("vigDesde").value.trim(), h = $("vigHasta").value.trim();
    $("fVig").textContent = (d || h) ? ("VIGENCIA: " + d + (h ? "  AL  " + h : "")) : "";
    $("fLegal").textContent = CFG.legal;
    const logo = CFG.slots.fpuntos.src;
    $("fLogo").style.display = logo ? "" : "none";
    if (logo) $("fLogo").src = logo;

    requestAnimationFrame(fitBody);
  }

  /* Auto-escala el cuerpo para que calce en el alto fijo y quede centrado */
  function fitBody() {
    const body = $("body"), fit = $("fit");
    fit.style.transform = "none";
    const avail = body.clientHeight, natural = fit.scrollHeight;
    if (!avail || !natural) return;
    const s = Math.min(1, avail / natural);
    const showImg = $("showImg").checked;
    const dy = showImg ? 0 : Math.max(0, (avail - natural * s) / 2); // centrar vertical si no hay imagen
    fit.style.transform = "translateY(" + dy + "px) scale(" + s + ")";
  }

  /* ---------- Toggles ---------- */
  $("showImg").addEventListener("change", () => { $("imgManualWrap").classList.toggle("hidden", !$("showImg").checked); render(); });
  $("showQr").addEventListener("change", () => { $("qrWrap").classList.toggle("hidden", !$("showQr").checked); render(); });

  ["tipo","evento","ouTmp","sku","marca","categoria","modelo","qrLink","precio","precioNormal",
   "precioOferta","precioOU","nCuotas","cae","valorCuota","ctc","vigDesde","vigHasta"]
    .forEach((id) => { $(id).addEventListener("input", render); $(id).addEventListener("change", render); });

  /* ====================================================================
     AUTFILL desde SKU (Falabella.com)
     ==================================================================== */
  $("btnSku").addEventListener("click", buscarSku);
  async function buscarSku() {
    const sku = $("sku").value.trim();
    if (!sku) return;
    const hint = $("skuHint");
    hint.textContent = "Buscando…";
    const pdp = "https://www.falabella.com/falabella-cl/product/" + encodeURIComponent(sku);
    const url = (CFG.proxy || "") + encodeURIComponent(pdp);
    try {
      const res = await fetch(url);
      const html = await res.text();
      // marca
      const mb = html.match(/"brand":\{"@type":"Brand","name":"([^"]+)"/);
      if (mb) $("marca").value = mb[1];
      // nombre -> modelo (referencial)
      const mn = html.match(/application\/ld\+json">[^<]*?"@type":"Product"[^<]*?"name":"([^"]+)"/);
      if (mn && !$("modelo").value.trim()) $("modelo").value = mn[1];
      // precios por tipo
      const precios = {};
      const re = /"type":"(\w+)","price":\["([^"]+)"\]/g; let m;
      while ((m = re.exec(html))) precios[m[1]] = parseInt(m[2].replace(/\D/g, ""), 10);
      if (precios.internetPrice) { $("precioOferta").value = precios.internetPrice; $("precio").value = precios.internetPrice; }
      if (precios.cmrPrice) $("precioOU").value = precios.cmrPrice;
      if (precios.normalPrice) $("precioNormal").value = precios.normalPrice;
      if (!$("showImg").checked) $("showImg").checked = false; // no forzamos imagen
      hint.textContent = "Datos cargados — CONFIRMA los precios (pueden variar por ofertas).";
      render();
    } catch (e) {
      hint.textContent = "No se pudo leer Falabella.com (CORS/proxy). Rellena manual o cambia el proxy en Configuración.";
    }
  }

  /* ====================================================================
     CONFIG UI
     ==================================================================== */
  function renderConfig() {
    const list = $("bannerlist"); list.innerHTML = "";
    CFG.eventos.forEach((ev, i) => list.appendChild(bannerRow(ev, i)));
    const sl = $("slotlist"); sl.innerHTML = "";
    Object.keys(CFG.slots).forEach((k) => sl.appendChild(slotRow(CFG.slots[k])));
    $("cfgLegal").value = CFG.legal;
    $("cfgProxy").value = CFG.proxy;
    fillEventos();
  }
  function thumb(src) { const t = document.createElement("div"); t.className = "thumb"; if (src) { const im = document.createElement("img"); im.src = src; t.appendChild(im); } else t.textContent = "—"; return t; }
  function uploadBtn(cb) {
    const b = document.createElement("button"); b.textContent = "Subir";
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.style.display = "none";
    inp.addEventListener("change", (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = (x) => cb(x.target.result); r.readAsDataURL(f); });
    b.addEventListener("click", () => inp.click()); b.appendChild(inp); return b;
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
    const chk = document.createElement("label"); chk.className = "chk";
    const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = !!ev.franja;
    cb.addEventListener("change", () => { ev.franja = cb.checked; save(); render(); });
    chk.appendChild(cb); chk.appendChild(document.createTextNode("franja"));
    ops.appendChild(uploadBtn((d) => { ev.src = d; save(); renderConfig(); render(); }));
    ops.appendChild(chk);
    const del = document.createElement("button"); del.className = "del"; del.textContent = "Borrar";
    del.addEventListener("click", () => { CFG.eventos.splice(i, 1); save(); renderConfig(); render(); });
    ops.appendChild(del);
    row.appendChild(ops);
    return row;
  }
  function slotRow(slot) {
    const row = document.createElement("div"); row.className = "banneritem";
    row.appendChild(thumb(slot.src));
    const meta = document.createElement("div"); meta.className = "meta";
    const b = document.createElement("div"); b.style.fontWeight = "700"; b.style.fontSize = "13px"; b.textContent = slot.label;
    const sm = document.createElement("small"); sm.textContent = slot.src ? "cargado" : "sin imagen — súbela";
    meta.appendChild(b); meta.appendChild(sm); row.appendChild(meta);
    const ops = document.createElement("div"); ops.className = "ops";
    ops.appendChild(uploadBtn((d) => { slot.src = d; save(); renderConfig(); render(); }));
    if (slot.src) { const del = document.createElement("button"); del.className = "del"; del.textContent = "Quitar"; del.addEventListener("click", () => { slot.src = ""; save(); renderConfig(); render(); }); ops.appendChild(del); }
    row.appendChild(ops); return row;
  }
  $("addBanner").addEventListener("click", () => { CFG.eventos.push({ id: "ev" + Date.now(), label: "Nuevo banner", src: "", franja: true }); save(); renderConfig(); });
  $("cfgLegal").addEventListener("input", () => { CFG.legal = $("cfgLegal").value; save(); render(); });
  $("cfgProxy").addEventListener("input", () => { CFG.proxy = $("cfgProxy").value; save(); });
  $("resetCfg").addEventListener("click", () => { if (!confirm("¿Restaurar configuración por defecto?")) return; CFG = structuredClone(DEFAULT_CFG); save(); renderConfig(); render(); });

  /* ====================================================================
     EXPORT
     ==================================================================== */
  async function snapshot() { return html2canvas($("cartel"), { scale: 2, useCORS: true, backgroundColor: "#ffffff", width: 750, height: 1000 }); }
  const nombre = () => (($("marca").value || "cartel") + "-" + ($("sku").value || Date.now())).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const errExport = () => alert("No se pudo exportar. Si la imagen viene del SKU puede bloquear la descarga (CORS): sube la imagen manual.");
  $("btnPng").addEventListener("click", async () => { try { const c = await snapshot(); const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = nombre() + ".png"; a.click(); } catch (e) { errExport(); } });
  $("btnPdf").addEventListener("click", async () => { try { const c = await snapshot(); const { jsPDF } = window.jspdf; const pdf = new jsPDF({ unit: "in", format: "letter", orientation: "portrait" }); pdf.addImage(c.toDataURL("image/png"), "PNG", 0.5, 0.5, 7.5, 10); pdf.save(nombre() + ".pdf"); } catch (e) { errExport(); } });

  /* ---------- Fit ---------- */
  function fitStage() { const s = $("stageScale"); const sc = Math.min(1, s.parentElement.clientWidth / 750); s.style.transform = "scale(" + sc + ")"; s.style.height = (1000 * sc) + "px"; }
  window.addEventListener("resize", fitStage);

  /* ---------- Init ---------- */
  renderConfig(); render(); fitStage();
})();
