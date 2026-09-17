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

  /* ---------- Tamaños (cm) ---------- */
  const PXCM = 38.46; // px por cm en el preview
  const SIZES = {
    carta: { w: 19.5, h: 26, layout: "p", img: true,  chrome: true,  label: "Carta" },
    s9x13: { w: 9,    h: 13, layout: "p", img: false, chrome: true,  label: "9×13" },
    s9x7:  { w: 9,    h: 7,  layout: "p", img: false, chrome: false, label: "9×7" },
    s6x4:  { w: 6,    h: 4,  layout: "p", img: false, chrome: false, label: "6×4" },
    s12x3: { w: 12,   h: 3,  layout: "h", img: false, chrome: false, label: "12×3" },
  };
  const LETTER = { w: 21.59, h: 27.94 }; // carta cm

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
  function load() { try { const r = localStorage.getItem(CFG_KEY); if (r) return Object.assign(structuredClone(DEFAULT_CFG), JSON.parse(r)); } catch (e) {} return structuredClone(DEFAULT_CFG); }
  function save() { try { localStorage.setItem(CFG_KEY, JSON.stringify(CFG)); } catch (e) {} }

  /* ---------- Utils ---------- */
  const clp = (n) => (n === "" || n == null || isNaN(n)) ? "" : "$" + Math.round(Number(n)).toLocaleString("es-CL");
  const num = (id) => { const v = parseFloat($(id).value); return isNaN(v) ? NaN : v; };
  const F_CUOTA = 0.101296, F_CTC = 1.22347;
  const curSize = () => SIZES[$("tamano").value];

  /* ---------- Tabs ---------- */
  document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    const tab = t.dataset.tab;
    $("pane-cartel").classList.toggle("hidden", tab !== "cartel");
    $("pane-hoja").classList.toggle("hidden", tab !== "hoja");
    $("pane-config").classList.toggle("hidden", tab !== "config");
    $("stageScale").classList.toggle("hidden", tab === "hoja");
    $("sheetWrap").classList.toggle("hidden", tab !== "hoja");
    if (tab === "hoja") renderSheet();
    fitStage();
  }));

  /* ---------- Selector de banner ---------- */
  function fillEventos() {
    const sel = $("evento"), prev = sel.value;
    sel.innerHTML = "";
    CFG.eventos.forEach((e) => { const o = document.createElement("option"); o.value = e.id; o.textContent = e.label + (e.src ? "" : " (sin imagen)"); sel.appendChild(o); });
    sel.value = prev || (CFG.eventos[0] && CFG.eventos[0].id) || "";
  }

  /* ---------- Imagen manual / QR ---------- */
  let manualImg = null;
  $("imagen").addEventListener("change", (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = (x) => { manualImg = x.target.result; render(); }; r.readAsDataURL(f); });
  function drawQR(link) { const box = $("qrBox"); box.innerHTML = ""; if (!link) return; try { new QRCode(box, { text: link, width: 260, height: 260, correctLevel: QRCode.CorrectLevel.M }); } catch (e) {} }

  /* ====================================================================
     Cálculo de precios compartido
     ==================================================================== */
  function calc() {
    const t = TIPOS[$("tipo").value];
    const precio = num("precio"), precioNormal = num("precioNormal"), precioOferta = num("precioOferta"), precioOU = num("precioOU");
    const base = t.ou ? precioOU : t.oferta ? precioOferta : precio;
    const nc = parseInt($("nCuotas").value, 10) || 12;
    const caeTxt = $("cae").value.trim() || "39,93%";
    let vc = num("valorCuota"), ctc = num("ctc");
    if (isNaN(vc) && !isNaN(base)) vc = nc === 12 ? Math.round(base * F_CUOTA) : Math.round(base / nc);
    if (isNaN(ctc) && !isNaN(base)) ctc = nc === 12 ? Math.round(base * F_CTC) : Math.round(vc * nc);
    return { t, precio, precioNormal, precioOferta, precioOU, nc, caeTxt, vc, ctc };
  }
  function cuotasHTML(c) {
    if (!c.t.cae || isNaN(c.vc)) return "";
    const card = CFG.slots.cmrCard.src;
    return '<div class="p-cuotas-wrap">' + (card ? '<img src="' + card + '" alt="CMR" />' : '') +
      '<div class="p-cuotas-txt"><div class="p-cuotas">' + c.nc + ' CUOTAS DE ' + clp(c.vc) + '</div>' +
      '<div class="p-cae">CAE: ' + c.caeTxt + ' / CTC: ' + clp(c.ctc) + '</div></div></div>';
  }
  const badgeHTML = () => { const s = CFG.slots.badgeUnica.src; return s ? '<img src="' + s + '" alt="Oportunidad única" />' : '<div class="ph">Sube el sello «Oportunidad única + CMR»<br>en Configuración</div>'; };

  /* ====================================================================
     RENDER
     ==================================================================== */
  function render() {
    const size = curSize();
    $("tamHint").textContent = size.w + " × " + size.h + " cm" + (size.img ? "" : " · sin imagen");
    // layout activo
    const horiz = size.layout === "h";
    $("cartel").classList.toggle("hidden", horiz);
    $("cartelH").classList.toggle("hidden", !horiz);
    // dims — horizontal usa alto de diseño fijo (mismo ratio) para que la tipografía calce
    if (horiz) {
      const HDES = 230, el = $("cartelH");
      el.style.height = HDES + "px";
      el.style.width = Math.round(HDES * (size.w / size.h)) + "px";
    } else {
      $("cartel").style.width = (size.w * PXCM) + "px";
      $("cartel").style.height = (size.h * PXCM) + "px";
    }
    // imagen manual solo carta
    $("imgManualWrap").classList.toggle("hidden", !(size.img && $("showImg").checked));
    $("showImg").parentElement.classList.toggle("hidden", !size.img);

    if (horiz) renderHorizontal(); else renderPortrait(size);
    requestAnimationFrame(() => { fitBody(); fitStage(); });
  }

  function renderPortrait(size) {
    const c = calc(), t = c.t;
    const ev = CFG.eventos.find((e) => e.id === $("evento").value);
    const franja = size.chrome && ev && ev.franja && ev.src;
    const header = size.chrome && ev && !ev.franja && ev.src;
    $("cartel").classList.toggle("no-chrome", !size.chrome);
    $("franja").classList.toggle("hidden", !franja);
    $("top").classList.toggle("hidden", !header);
    if (franja) $("franjaImg").src = ev.src;
    if (header) $("topBannerImg").src = ev.src;

    const qrOn = size.chrome && $("showQr").checked && $("qrLink").value.trim();
    $("franja").classList.toggle("has-qr", !!(franja && qrOn));
    $("qrBox").classList.toggle("hidden", !qrOn);
    if (qrOn) { if ($("qrBox").dataset.link !== $("qrLink").value.trim()) { $("qrBox").dataset.link = $("qrLink").value.trim(); drawQR($("qrLink").value.trim()); } }
    else { $("qrBox").innerHTML = ""; $("qrBox").dataset.link = ""; }

    const showImg = size.img && $("showImg").checked;
    $("media").classList.toggle("hidden", !showImg);
    if (showImg) { const sku = $("sku").value.trim(); const src = manualImg || (sku ? "https://media.falabella.com/falabellaCL/" + encodeURIComponent(sku) + "/public" : ""); if (src) $("mediaImg").src = src; }

    $("oMarca").textContent = $("marca").value.toUpperCase();
    $("oCat").textContent = $("categoria").value.toUpperCase();
    const modelo = $("modelo").value.trim(), sku = $("sku").value.trim();
    $("oModelo").textContent = modelo ? "MODELO: " + modelo.toUpperCase() : ""; $("oModelo").classList.toggle("hidden", !modelo);
    $("oSku").textContent = sku ? "SKU: " + sku : ""; $("oSku").classList.toggle("hidden", !sku);

    $("badge").classList.toggle("hidden", !t.ou);
    if (t.ou) $("badge").innerHTML = badgeHTML();

    $("fOU").classList.toggle("hidden", !t.ou);
    $("fOferta").classList.toggle("hidden", !(t.oferta || (t.ou && $("ouTmp").checked)));
    $("fPrecio").classList.toggle("hidden", t.oferta || t.ou);
    $("fNormal").classList.toggle("hidden", !(t.oferta || t.ou));
    $("ouTmpWrap").classList.toggle("hidden", !t.ou);
    $("fsElectro").classList.toggle("hidden", !t.cae);

    const line = (tag, val, cls, sz) => '<div class="p-block">' + (tag ? '<div class="p-tag ' + (cls || '') + '">' + tag + '</div>' : '') + '<div class="p-val ' + sz + ' ' + (cls || 'p-negro') + '">' + (val || '$0') + '</div></div>';
    let html = "";
    if (t.ou) {
      html += line("", clp(c.precioOU), "p-rojo", "lg") + cuotasHTML(c);
      if ($("ouTmp").checked && !isNaN(c.precioOferta)) html += line("TODO MEDIO DE PAGO", clp(c.precioOferta), "p-negro", "lg");
      if (!isNaN(c.precioNormal)) html += line("PRECIO NORMAL", clp(c.precioNormal), "p-negro", "lg");
    } else if (t.oferta) {
      html += line("TODO MEDIO DE PAGO", clp(c.precioOferta), "p-rojo", "xl") + cuotasHTML(c);
      if (!isNaN(c.precioNormal)) html += line("PRECIO NORMAL", clp(c.precioNormal), "p-negro", "md");
    } else { html += line("", clp(c.precio), "p-negro", "xl") + cuotasHTML(c); }
    $("precios").innerHTML = html;

    const d = $("vigDesde").value.trim(), h = $("vigHasta").value.trim();
    $("fVig").textContent = (d || h) ? ("VIGENCIA: " + d + (h ? "  AL  " + h : "")) : "";
    $("fLegal").textContent = CFG.legal;
    const logo = CFG.slots.fpuntos.src; $("fLogo").style.display = logo ? "" : "none"; if (logo) $("fLogo").src = logo;
  }

  function renderHorizontal() {
    const c = calc(), t = c.t;
    $("hMarca").textContent = $("marca").value.toUpperCase();
    $("hCat").textContent = $("categoria").value.toUpperCase();
    const modelo = $("modelo").value.trim(), sku = $("sku").value.trim();
    $("hSku").textContent = [modelo ? modelo.toUpperCase() : "", sku ? "SKU: " + sku : ""].filter(Boolean).join("  /  ");
    const d = $("vigDesde").value.trim(), h = $("vigHasta").value.trim();
    $("hVig").textContent = (d || h) ? ("VIGENCIA: " + d + (h ? " AL " + h : "")) : "";

    // mismos campos visibles que portrait
    $("fOU").classList.toggle("hidden", !t.ou);
    $("fOferta").classList.toggle("hidden", !(t.oferta || (t.ou && $("ouTmp").checked)));
    $("fPrecio").classList.toggle("hidden", t.oferta || t.ou);
    $("fNormal").classList.toggle("hidden", !(t.oferta || t.ou));
    $("ouTmpWrap").classList.toggle("hidden", !t.ou);
    $("fsElectro").classList.toggle("hidden", true); // sin cuotas en 12x3

    $("hBadge").classList.toggle("hidden", !t.ou);
    if (t.ou) $("hBadge").innerHTML = badgeHTML();

    const primario = t.ou ? c.precioOU : t.oferta ? c.precioOferta : c.precio;
    let html = '<div class="pv p-rojo">' + (clp(primario) || "$0") + '</div>';
    if (!isNaN(c.precioNormal) && (t.ou || t.oferta)) html += '<div class="lbl">PRECIO NORMAL</div><div class="pv p-negro">' + clp(c.precioNormal) + '</div>';
    $("hPrices").innerHTML = html;
  }

  /* auto-escala cuerpo portrait */
  function fitBody() {
    if (curSize().layout === "h") return;
    const body = $("body"), fit = $("fit");
    fit.style.transform = "none";
    const avail = body.clientHeight, natural = fit.scrollHeight;
    if (!avail || !natural) return;
    const s = Math.min(1, avail / natural);
    const dy = $("showImg").checked && curSize().img ? 0 : Math.max(0, (avail - natural * s) / 2);
    fit.style.transform = "translateY(" + dy + "px) scale(" + s + ")";
  }

  /* ---------- Toggles ---------- */
  $("showImg").addEventListener("change", () => { $("imgManualWrap").classList.toggle("hidden", !$("showImg").checked); render(); });
  $("showQr").addEventListener("change", () => { $("qrWrap").classList.toggle("hidden", !$("showQr").checked); render(); });
  ["tipo","tamano","evento","ouTmp","sku","marca","categoria","modelo","qrLink","precio","precioNormal","precioOferta","precioOU","nCuotas","cae","valorCuota","ctc","vigDesde","vigHasta"]
    .forEach((id) => { $(id).addEventListener("input", render); $(id).addEventListener("change", render); });

  /* ====================================================================
     AUTOFILL SKU
     ==================================================================== */
  $("btnSku").addEventListener("click", async () => {
    const sku = $("sku").value.trim(); if (!sku) return;
    const hint = $("skuHint"); hint.textContent = "Buscando…";
    const pdp = "https://www.falabella.com/falabella-cl/product/" + encodeURIComponent(sku);
    try {
      const res = await fetch((CFG.proxy || "") + encodeURIComponent(pdp));
      const html = await res.text();
      const mb = html.match(/"brand":\{"@type":"Brand","name":"([^"]+)"/); if (mb) $("marca").value = mb[1];
      const mn = html.match(/application\/ld\+json">[^<]*?"@type":"Product"[^<]*?"name":"([^"]+)"/); if (mn && !$("modelo").value.trim()) $("modelo").value = mn[1];
      const precios = {}; const re = /"type":"(\w+)","price":\["([^"]+)"\]/g; let m;
      while ((m = re.exec(html))) precios[m[1]] = parseInt(m[2].replace(/\D/g, ""), 10);
      if (precios.internetPrice) { $("precioOferta").value = precios.internetPrice; $("precio").value = precios.internetPrice; }
      if (precios.cmrPrice) $("precioOU").value = precios.cmrPrice;
      if (precios.normalPrice) $("precioNormal").value = precios.normalPrice;
      hint.textContent = "Datos cargados — CONFIRMA los precios (pueden variar).";
      render();
    } catch (e) { hint.textContent = "No se pudo leer Falabella.com (CORS/proxy). Rellena manual o cambia el proxy en Configuración."; }
  });

  /* ====================================================================
     HOJA / IMPOSICIÓN
     ==================================================================== */
  let QUEUE = []; // {sizeKey, url}
  const activeEl = () => curSize().layout === "h" ? $("cartelH") : $("cartel");

  async function snap(el) {
    const w = parseFloat(el.style.width), h = parseFloat(el.style.height);
    return html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff", width: w, height: h });
  }
  const nombre = () => (($("marca").value || "cartel") + "-" + ($("sku").value || Date.now())).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const errExport = () => alert("No se pudo exportar. Si la imagen viene del SKU puede bloquear la descarga (CORS): sube la imagen manual.");

  $("btnPng").addEventListener("click", async () => { try { const c = await snap(activeEl()); const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = nombre() + ".png"; a.click(); } catch (e) { errExport(); } });
  $("btnPdf").addEventListener("click", async () => { try { const s = curSize(); const c = await snap(activeEl()); const { jsPDF } = window.jspdf; const pdf = new jsPDF({ unit: "cm", format: "letter", orientation: s.h >= s.w ? "portrait" : "landscape" }); const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight(); const x = (pw - s.w) / 2, y = (ph - s.h) / 2; pdf.addImage(c.toDataURL("image/png"), "PNG", x, y, s.w, s.h); pdf.save(nombre() + ".pdf"); } catch (e) { errExport(); } });

  $("btnGrabar").addEventListener("click", async () => {
    try { const c = await snap(activeEl()); QUEUE.push({ sizeKey: $("tamano").value, url: c.toDataURL("image/png") }); flashGrabar(); }
    catch (e) { errExport(); }
  });
  function flashGrabar() { const b = $("btnGrabar"); const o = b.textContent; b.textContent = "✓ Grabado"; setTimeout(() => b.textContent = o, 900); }

  $("bordeOn").addEventListener("change", renderSheet);
  $("bordeTipo").addEventListener("change", renderSheet);
  $("btnClearQueue").addEventListener("click", () => { QUEUE = QUEUE.filter((q) => q.sizeKey !== $("tamano").value); renderSheet(); });

  // modelo de imposición para el tamaño actual
  function sheetModel() {
    const s = curSize();
    const combos = [
      { sw: LETTER.w, sh: LETTER.h, cw: s.w, ch: s.h, rot: false },
      { sw: LETTER.w, sh: LETTER.h, cw: s.h, ch: s.w, rot: true },
      { sw: LETTER.h, sh: LETTER.w, cw: s.w, ch: s.h, rot: false },
      { sw: LETTER.h, sh: LETTER.w, cw: s.h, ch: s.w, rot: true },
    ].map((o) => { o.cols = Math.floor(o.sw / o.cw); o.rows = Math.floor(o.sh / o.ch); o.n = o.cols * o.rows; return o; });
    return combos.reduce((a, b) => b.n > a.n ? b : a);
  }

  function renderSheet() {
    const s = curSize();
    const items = QUEUE.filter((q) => q.sizeKey === $("tamano").value);
    const m = sheetModel();
    $("sheetInfo").innerHTML =
      '<span class="pill">' + s.label + ' cm</span>' +
      '<span class="pill">' + m.n + ' por hoja (' + m.cols + '×' + m.rows + (m.rot ? ', rotado' : '') + ')</span>' +
      '<span class="pill">hoja ' + (m.sw > m.sh ? 'horizontal' : 'vertical') + '</span>' +
      '<span class="pill">' + items.length + ' pieza(s) grabada(s)</span>';

    // cola visual
    const q = $("queue"); q.innerHTML = "";
    if (!items.length) q.innerHTML = '<div class="empty">Aún no grabas piezas de este tamaño. Ve a «Cartel» y pulsa «Grabar en la hoja».</div>';
    items.forEach((it, i) => { const d = document.createElement("div"); d.className = "q"; d.innerHTML = '<img src="' + it.url + '"/><button title="Quitar">×</button>'; d.querySelector("button").addEventListener("click", () => { const idx = QUEUE.indexOf(it); if (idx >= 0) QUEUE.splice(idx, 1); renderSheet(); }); q.appendChild(d); });

    // preview hoja
    const SP = Math.min(560 / m.sw, 720 / m.sh); // px por cm en preview
    const sheet = $("sheet");
    sheet.style.width = (m.sw * SP) + "px"; sheet.style.height = (m.sh * SP) + "px";
    sheet.innerHTML = "";
    const gridW = m.cols * m.cw, gridH = m.rows * m.ch;
    const offX = (m.sw - gridW) / 2, offY = (m.sh - gridH) / 2;
    const borde = $("bordeOn").checked, tipo = $("bordeTipo").value;
    let k = 0;
    for (let r = 0; r < m.rows; r++) for (let col = 0; col < m.cols; col++) {
      const cell = document.createElement("div");
      cell.className = "cell" + (borde && tipo === "linea" ? " linea" : "");
      cell.style.left = ((offX + col * m.cw) * SP) + "px";
      cell.style.top = ((offY + r * m.ch) * SP) + "px";
      cell.style.width = (m.cw * SP) + "px";
      cell.style.height = (m.ch * SP) + "px";
      if (items.length) {
        const it = items[k % items.length]; k++;
        const img = document.createElement("img"); img.src = it.url;
        if (m.rot) { img.style.transform = "rotate(90deg)"; img.style.width = (m.ch * SP) + "px"; img.style.height = (m.cw * SP) + "px"; }
        cell.appendChild(img);
      }
      sheet.appendChild(cell);
      if (borde && tipo === "marcas") addCropMarks(sheet, (offX + col * m.cw) * SP, (offY + r * m.ch) * SP, m.cw * SP, m.ch * SP);
    }
  }
  function addCropMarks(sheet, x, y, w, h) {
    [[0,0,0,0],[1,0,180,0],[0,1,0,0],[1,1,0,0]].forEach(([cx, cy]) => {
      const el = document.createElement("div"); el.className = "crop";
      el.style.left = (x + cx * w - (cx ? 14 : 0)) + "px";
      el.style.top = (y + cy * h - (cy ? 14 : 0)) + "px";
      sheet.appendChild(el);
    });
  }

  // Export hoja a canvas de alta resolución (150 dpi)
  async function exportSheetCanvas() {
    const m = sheetModel();
    const DPI = 150, PPCM = DPI / 2.54;
    const cv = document.createElement("canvas");
    cv.width = Math.round(m.sw * PPCM); cv.height = Math.round(m.sh * PPCM);
    const ctx = cv.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
    const items = QUEUE.filter((q) => q.sizeKey === $("tamano").value);
    if (!items.length) throw new Error("sin piezas");
    const imgs = await Promise.all(items.map((it) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = it.url; })));
    const gridW = m.cols * m.cw, gridH = m.rows * m.ch;
    const offX = (m.sw - gridW) / 2, offY = (m.sh - gridH) / 2;
    const borde = $("bordeOn").checked, tipo = $("bordeTipo").value;
    let k = 0;
    for (let r = 0; r < m.rows; r++) for (let col = 0; col < m.cols; col++) {
      const x = (offX + col * m.cw) * PPCM, y = (offY + r * m.ch) * PPCM, w = m.cw * PPCM, h = m.ch * PPCM;
      const im = imgs[k % imgs.length]; k++;
      ctx.save(); ctx.translate(x + w / 2, y + h / 2);
      if (m.rot) { ctx.rotate(Math.PI / 2); ctx.drawImage(im, -h / 2, -w / 2, h, w); }
      else ctx.drawImage(im, -w / 2, -h / 2, w, h);
      ctx.restore();
      if (borde && tipo === "linea") { ctx.strokeStyle = "#999"; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h); }
      if (borde && tipo === "marcas") cropCanvas(ctx, x, y, w, h);
    }
    return cv;
  }
  function cropCanvas(ctx, x, y, w, h) {
    ctx.strokeStyle = "#333"; ctx.lineWidth = 1; const L = 18;
    [[x,y,-1,-1],[x+w,y,1,-1],[x,y+h,-1,1],[x+w,y+h,1,1]].forEach(([px, py, sx, sy]) => {
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + sx * L, py); ctx.moveTo(px, py); ctx.lineTo(px, py + sy * L); ctx.stroke();
    });
  }
  $("btnSheetPng").addEventListener("click", async () => { try { const cv = await exportSheetCanvas(); const a = document.createElement("a"); a.href = cv.toDataURL("image/png"); a.download = "hoja-" + curSize().label + ".png"; a.click(); } catch (e) { alert("Graba al menos una pieza de este tamaño."); } });
  $("btnSheetPdf").addEventListener("click", async () => {
    try { const m = sheetModel(); const cv = await exportSheetCanvas(); const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: "cm", format: "letter", orientation: m.sw > m.sh ? "landscape" : "portrait" });
      pdf.addImage(cv.toDataURL("image/png"), "PNG", 0, 0, m.sw, m.sh); pdf.save("hoja-" + curSize().label + ".pdf");
    } catch (e) { alert("Graba al menos una pieza de este tamaño."); }
  });

  /* ====================================================================
     CONFIG UI
     ==================================================================== */
  function renderConfig() {
    const list = $("bannerlist"); list.innerHTML = ""; CFG.eventos.forEach((ev, i) => list.appendChild(bannerRow(ev, i)));
    const sl = $("slotlist"); sl.innerHTML = ""; Object.keys(CFG.slots).forEach((k) => sl.appendChild(slotRow(CFG.slots[k])));
    $("cfgLegal").value = CFG.legal; $("cfgProxy").value = CFG.proxy; fillEventos();
  }
  function thumb(src) { const t = document.createElement("div"); t.className = "thumb"; if (src) { const im = document.createElement("img"); im.src = src; t.appendChild(im); } else t.textContent = "—"; return t; }
  function uploadBtn(cb) { const b = document.createElement("button"); b.textContent = "Subir"; const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.style.display = "none"; inp.addEventListener("change", (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = (x) => cb(x.target.result); r.readAsDataURL(f); }); b.addEventListener("click", () => inp.click()); b.appendChild(inp); return b; }
  function bannerRow(ev, i) {
    const row = document.createElement("div"); row.className = "banneritem"; row.appendChild(thumb(ev.src));
    const meta = document.createElement("div"); meta.className = "meta";
    const inp = document.createElement("input"); inp.value = ev.label; inp.addEventListener("input", () => { ev.label = inp.value; save(); fillEventos(); });
    const sm = document.createElement("small"); sm.textContent = "id: " + ev.id; meta.appendChild(inp); meta.appendChild(sm); row.appendChild(meta);
    const ops = document.createElement("div"); ops.className = "ops";
    const chk = document.createElement("label"); chk.className = "chk"; const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = !!ev.franja; cb.addEventListener("change", () => { ev.franja = cb.checked; save(); render(); }); chk.appendChild(cb); chk.appendChild(document.createTextNode("franja"));
    ops.appendChild(uploadBtn((d) => { ev.src = d; save(); renderConfig(); render(); })); ops.appendChild(chk);
    const del = document.createElement("button"); del.className = "del"; del.textContent = "Borrar"; del.addEventListener("click", () => { CFG.eventos.splice(i, 1); save(); renderConfig(); render(); }); ops.appendChild(del);
    row.appendChild(ops); return row;
  }
  function slotRow(slot) {
    const row = document.createElement("div"); row.className = "banneritem"; row.appendChild(thumb(slot.src));
    const meta = document.createElement("div"); meta.className = "meta"; const b = document.createElement("div"); b.style.fontWeight = "700"; b.style.fontSize = "13px"; b.textContent = slot.label; const sm = document.createElement("small"); sm.textContent = slot.src ? "cargado" : "sin imagen — súbela"; meta.appendChild(b); meta.appendChild(sm); row.appendChild(meta);
    const ops = document.createElement("div"); ops.className = "ops"; ops.appendChild(uploadBtn((d) => { slot.src = d; save(); renderConfig(); render(); }));
    if (slot.src) { const del = document.createElement("button"); del.className = "del"; del.textContent = "Quitar"; del.addEventListener("click", () => { slot.src = ""; save(); renderConfig(); render(); }); ops.appendChild(del); }
    row.appendChild(ops); return row;
  }
  $("addBanner").addEventListener("click", () => { CFG.eventos.push({ id: "ev" + Date.now(), label: "Nuevo banner", src: "", franja: true }); save(); renderConfig(); });
  $("cfgLegal").addEventListener("input", () => { CFG.legal = $("cfgLegal").value; save(); render(); });
  $("cfgProxy").addEventListener("input", () => { CFG.proxy = $("cfgProxy").value; save(); });
  $("resetCfg").addEventListener("click", () => { if (!confirm("¿Restaurar configuración por defecto?")) return; CFG = structuredClone(DEFAULT_CFG); save(); renderConfig(); render(); });

  /* ---------- Fit preview ---------- */
  function fitStage() {
    const onHoja = !$("sheetWrap").classList.contains("hidden");
    if (onHoja) return;
    const s = $("stageScale"); const el = activeEl();
    const w = parseFloat(el.style.width) || 750, h = parseFloat(el.style.height) || 1000;
    const availW = s.parentElement.clientWidth;
    const sc = Math.min(availW / w, 900 / h, w < 500 ? 2.2 : 1); // agranda tamaños chicos
    s.style.transform = "scale(" + sc + ")"; s.style.height = (h * sc) + "px";
  }
  window.addEventListener("resize", fitStage);

  /* ---------- Init ---------- */
  renderConfig(); render(); fitStage();
})();
