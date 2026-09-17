/* Generador de Carteles — Falabella */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);

  /* ---------- Tamaños (cm) y capacidades ----------
     img=lleva foto  banner=lleva banner+QR+pie legal  cae=permite cuotas/CAE  */
  const SIZES = {
    carta:  { w: 19.5, h: 26, layout: "p", img: true,  banner: true,  cae: true,  label: "Carta" },
    s13x19: { w: 13,   h: 19, layout: "p", img: false, banner: true,  cae: true,  label: "13×19" },
    s9x13:  { w: 9,    h: 13, layout: "p", img: false, banner: false, cae: false, label: "9×13" },
    s9x7:   { w: 9,    h: 7,  layout: "p", img: false, banner: true,  cae: false, label: "9×7" },
    s6x4:   { w: 6,    h: 4,  layout: "p", img: false, banner: false, cae: false, label: "6×4" },
    s12x3:  { w: 12,   h: 3,  layout: "h", img: false, banner: false, cae: false, label: "12×3" },
  };
  const LETTER = { w: 21.59, h: 27.94 }; // carta cm

  /* ---------- Config ---------- */
  const CFG_KEY = "carteles_cfg_v2";
  const DEFAULT_LEGAL =
    "EL PAGO CON TARJETAS PUEDE TENER COSTOS ASOCIADOS. CONSULTAR AL EMISOR PARA MAYOR INFORMACIÓN. INFÓRMESE " +
    "SOBRE LA GARANTÍA ESTATAL DE LOS DEPÓSITOS EN SU BANCO O EN WWW.CMFCHILE.CL. COSTO TOTAL DEL CRÉDITO (CTC) " +
    "INCLUYE IMPUESTO DE TIMBRES Y ESTAMPILLAS. CANJE Y ACUMULACIÓN DE PUNTOS SUJETOS A TÉRMINOS Y CONDICIONES DEL " +
    "REGLAMENTO DEL PROGRAMA FPUNTOS VIGENTE.";
  // Firebase fijo (config web del proyecto; las apiKey web de Firebase son públicas)
  const FB_CONFIG = {
    apiKey: "AIzaSyCeTXb-HUb5lzjvh1_rUOJlxZuYzSFKT3Y",
    authDomain: "carteles-electro.firebaseapp.com",
    projectId: "carteles-electro",
    storageBucket: "carteles-electro.firebasestorage.app",
    messagingSenderId: "1013263263364",
    appId: "1:1013263263364:web:154a9c28b05c4f104444d1",
  };
  const DEFAULT_CFG = {
    legal: DEFAULT_LEGAL,
    eventos: [
      { id: "online",    label: "Tenemos más online (por defecto)", src: "assets/banners/tenemos-mas.png", franja: false },
      { id: "exclusivo", label: "Exclusivo falabella.com",          src: "assets/banners/exclusivo-falabella.png", franja: true },
      { id: "cyber",     label: "CyberDay Electro",                 src: "assets/banners/cyber.png", franja: true },
      { id: "sneaker",   label: "Sneaker Corner",                   src: "assets/banners/sneaker-corner.png", franja: true },
    ],
    slots: {
      badgeUnica: { label: "Sello Oportunidad única + CMR", src: "" },
      fpuntos:    { label: "Logo Fpuntos (pie)", src: "assets/logos/fpuntos.png" },
    },
  };
  // Medida recomendada para subir banners (Canva), según tipo
  const RECO_FRANJA = "1200 × 260 px (PNG, fondo transparente)";
  const RECO_HEADER = "1000 × 110 px (PNG, fondo transparente)";
  let CFG = load();
  function load() {
    try {
      const r = localStorage.getItem(CFG_KEY);
      if (r) {
        const c = Object.assign(structuredClone(DEFAULT_CFG), JSON.parse(r));
        delete c.proxy; delete c.firebase;                 // ya no se usan
        if (c.slots) {
          delete c.slots.cmrCard;                          // logo eliminado
          if (!c.slots.badgeUnica) c.slots.badgeUnica = { label: "Sello Oportunidad única + CMR", src: "" };
          if (!c.slots.fpuntos) c.slots.fpuntos = { label: "Logo Fpuntos (pie)", src: "assets/logos/fpuntos.png" };
        }
        return c;
      }
    } catch (e) {}
    return structuredClone(DEFAULT_CFG);
  }
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
    const tv = $("tipo").value;
    const t = { ou: tv === "ou", oferta: tv === "oferta", cae: $("caeOn").checked && curSize().cae };
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
    return '<div class="p-cuotas-wrap"><div class="p-cuotas-txt">' +
      '<div class="p-cuotas">' + c.nc + ' CUOTAS DE ' + clp(c.vc) + '</div>' +
      '<div class="p-cae">CAE: ' + c.caeTxt + ' / CTC: ' + clp(c.ctc) + '</div></div></div>';
  }
  const badgeHTML = () => { const s = CFG.slots.badgeUnica.src; return s ? '<img src="' + s + '" alt="Oportunidad única" />' : '<div class="ph">Sube el sello «Oportunidad única + CMR»<br>en Configuración</div>'; };

  /* ====================================================================
     RENDER
     ==================================================================== */
  function render() {
    const size = curSize();
    const caps = [size.img ? "imagen" : null, size.banner ? "banner+QR" : null, size.cae ? "CAE" : null].filter(Boolean).join(" · ");
    $("tamHint").textContent = size.w + " × " + size.h + " cm" + (caps ? " · " + caps : " · solo precios");
    // capacidades según tamaño
    $("caeWrap").classList.toggle("hidden", !size.cae);
    $("bannerWrap").classList.toggle("hidden", !size.banner);
    $("qrFieldset").classList.toggle("hidden", !size.banner);
    // layout activo
    const horiz = size.layout === "h";
    $("cartel").classList.toggle("hidden", horiz);
    $("cartelH").classList.toggle("hidden", !horiz);
    // dims de diseño: ancho fijo (fuentes como carta), alto según proporción del tamaño
    if (horiz) {
      const HDES = 230, el = $("cartelH");
      el.style.height = HDES + "px";
      el.style.width = Math.round(HDES * (size.w / size.h)) + "px";
    } else {
      const DW = 750; // ancho de diseño constante
      $("cartel").style.width = DW + "px";
      $("cartel").style.height = Math.round(DW * (size.h / size.w)) + "px";
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
    const franja = size.banner && ev && ev.franja && ev.src;
    const header = size.banner && ev && !ev.franja && ev.src;
    $("cartel").classList.toggle("no-chrome", !size.banner);
    $("franja").classList.toggle("hidden", !franja);
    $("top").classList.toggle("hidden", !header);
    if (franja) $("franjaImg").src = ev.src;
    if (header) $("topBannerImg").src = ev.src;

    const qrOn = size.banner && $("showQr").checked && $("qrLink").value.trim();
    $("qrBox").classList.toggle("bajo", !!franja); // bajo la franja para no pisarla
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

    const line = (tag, val, cls, sz) => '<div class="p-block">' + (tag ? '<div class="p-tag ' + sz + ' ' + (cls || '') + '">' + tag + '</div>' : '') + '<div class="p-val ' + sz + ' ' + (cls || 'p-negro') + '">' + (val || '$0') + '</div></div>';
    // Jerarquía: en tamaños chicos el precio principal (OU/oferta) va más grande que el resto
    const small = !size.cae;               // grandes (carta, 13×19) = precios iguales
    const PRIN = small ? "lg" : "xl";       // principal oferta/normal
    const OUsz = small ? "lg" : "lg";       // OU principal
    const SEC  = small ? "sm" : "md";       // secundarios (normal, otro medio)
    let html = "";
    if (t.ou) {
      html += line("", clp(c.precioOU), "p-rojo", OUsz) + cuotasHTML(c);
      const ouSec = small ? "sm" : "lg";    // en carta los 3 van igual (lg); en chicos, más chicos
      if ($("ouTmp").checked && !isNaN(c.precioOferta)) html += line("TODO MEDIO DE PAGO", clp(c.precioOferta), "p-negro", ouSec);
      if (!isNaN(c.precioNormal)) html += line("PRECIO NORMAL", clp(c.precioNormal), "p-negro", ouSec);
    } else if (t.oferta) {
      html += line("TODO MEDIO DE PAGO", clp(c.precioOferta), "p-rojo", PRIN) + cuotasHTML(c);
      if (!isNaN(c.precioNormal)) html += line("PRECIO NORMAL", clp(c.precioNormal), "p-negro", SEC);
    } else { html += line("", clp(c.precio), "p-negro", PRIN) + cuotasHTML(c); }
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
    if (t.ou && $("ouTmp").checked && !isNaN(c.precioOferta))
      html += '<div class="lbl">TODO MEDIO DE PAGO</div><div class="pv sec p-negro">' + clp(c.precioOferta) + '</div>';
    if (!isNaN(c.precioNormal) && (t.ou || t.oferta))
      html += '<div class="lbl">PRECIO NORMAL</div><div class="pv sec p-negro">' + clp(c.precioNormal) + '</div>';
    $("hPrices").innerHTML = html;
  }

  /* auto-ajuste del cuerpo portrait: reduce el tamaño de fuente (var --k) hasta calzar.
     Sin transform, para que html2canvas exporte bien. */
  function fitBody() {
    if (curSize().layout === "h") return;
    const body = $("body"), fit = $("fit");
    let k = 1; fit.style.setProperty("--k", "1");
    for (let i = 0; i < 5; i++) {
      const avail = body.clientHeight, natural = fit.scrollHeight;
      if (!avail || !natural || natural <= avail + 1) break;
      k = Math.max(0.05, k * (avail / natural) * 0.985);
      fit.style.setProperty("--k", String(k));
    }
  }

  /* ====================================================================
     BUSCAR EN FALABELLA (API JSON pública vía proxy)
     ==================================================================== */
  const PROXIES = [
    (u) => "https://api.allorigins.win/raw?url=" + encodeURIComponent(u),
    (u) => "https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(u),
    (u) => "https://corsproxy.io/?url=" + encodeURIComponent(u),
  ];
  function fetchTimeout(url, ms) {
    const ctrl = new AbortController(); const id = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(id));
  }
  async function buscarSku() {
    let sku = $("sku").value.trim();
    const mlink = sku.match(/(\d{6,})/); if (mlink) sku = mlink[1];   // acepta link pegado
    if (!sku) return;
    $("sku").value = sku;                                             // deja el SKU limpio (para la imagen)
    const hint = $("skuHint"); hint.textContent = "Buscando en falabella.com…";
    const api = "https://www.falabella.com/s/browse/v3/product/cl?site=falabella-cl&productId=" + encodeURIComponent(sku);
    // 1) directo (funciona servido en https, ej. GitHub Pages). 2) proxies (para file://)
    const intentos = [api, ...PROXIES.map((px) => px(api))];
    let ultimo = "";
    for (const url of intentos) {
      try {
        const r = await fetchTimeout(url, 9000);
        const t = await r.text(); let j; try { j = JSON.parse(t); } catch (e) { ultimo = "respuesta no-JSON"; continue; }
        const d = j.data || j; if (!d || !d.variants) { ultimo = "sin datos"; continue; }
        aplicarProducto(d);
        hint.textContent = "Datos cargados — CONFIRMA los precios (pueden variar).";
        render(); return;
      } catch (e) { ultimo = (e && e.name === "AbortError") ? "timeout" : "bloqueado (CORS)"; }
    }
    hint.textContent = "No se pudo traer de falabella.com (" + ultimo + "). Publica en GitHub Pages o rellena manual.";
  }
  function aplicarProducto(d) {
    if (d.brandName) $("marca").value = d.brandName;
    if (d.name && !$("modelo").value.trim()) $("modelo").value = d.name;
    try { const bc = d.breadCrumb || []; if (bc.length && !$("categoria").value.trim()) $("categoria").value = (bc[bc.length - 2] || bc[bc.length - 1]).label || ""; } catch (e) {}
    const v = (d.variants || []).find((x) => x.id === d.primaryVariantId) || d.variants[0] || {};
    const pr = {}; (v.prices || []).forEach((p) => { pr[p.type] = parseInt(String((p.price && p.price[0]) || "").replace(/\D/g, ""), 10); });
    if (pr.cmrPrice) $("precioOU").value = pr.cmrPrice;
    if (pr.internetPrice) { $("precioOferta").value = pr.internetPrice; $("precio").value = pr.internetPrice; }
    if (pr.normalPrice) $("precioNormal").value = pr.normalPrice;
  }
  $("btnSku").addEventListener("click", buscarSku);
  $("sku").addEventListener("keydown", (e) => { if (e.key === "Enter") buscarSku(); });

  /* ---------- Toggles ---------- */
  $("showImg").addEventListener("change", () => { $("imgManualWrap").classList.toggle("hidden", !$("showImg").checked); render(); });
  $("showQr").addEventListener("change", () => { $("qrWrap").classList.toggle("hidden", !$("showQr").checked); render(); });
  ["tipo","tamano","caeOn","evento","ouTmp","sku","marca","categoria","modelo","qrLink","precio","precioNormal","precioOferta","precioOU","nCuotas","cae","valorCuota","ctc","vigDesde","vigHasta"]
    .forEach((id) => { $(id).addEventListener("input", render); $(id).addEventListener("change", render); });

  /* ====================================================================
     HOJA / IMPOSICIÓN
     ==================================================================== */
  let QUEUE = []; // {sizeKey, url, id?}
  const activeEl = () => curSize().layout === "h" ? $("cartelH") : $("cartel");

  /* ---------- Firebase opcional (Firestore + TTL 24h) ---------- */
  const FB = { ready: false, db: null, fs: null };
  const fbStatus = (t) => { const el = $("fbStatus"); if (el) el.textContent = "Firebase: " + t; };
  async function fbInit() {
    FB.ready = false;
    fbStatus("conectando…");
    try {
      const appMod = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
      const fs = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
      const app = appMod.initializeApp(FB_CONFIG);
      FB.db = fs.getFirestore(app); FB.fs = fs; FB.ready = true;
      fbStatus("nube conectada");
      await fbLoad();
    } catch (e) { fbStatus("nube sin conexión (" + (e.message || e) + ")"); }
  }
  async function fbSave(item) {
    if (!FB.ready) return;
    const { collection, addDoc, Timestamp } = FB.fs;
    try {
      const ref = await addDoc(collection(FB.db, "piezas"), { sizeKey: item.sizeKey, url: item.url, qty: item.qty || 1, createdAt: Timestamp.now(), expireAt: Timestamp.fromMillis(Date.now() + 24 * 3600 * 1000) });
      item.id = ref.id;
    } catch (e) { fbStatus("error al guardar: " + (e.message || e)); }
  }
  async function fbLoad() {
    if (!FB.ready) return;
    const { collection, getDocs, query, where, Timestamp } = FB.fs;
    try {
      const snap = await getDocs(query(collection(FB.db, "piezas"), where("expireAt", ">", Timestamp.now())));
      snap.forEach((d) => { const x = d.data(); if (!QUEUE.some((it) => it.id === d.id)) QUEUE.push({ sizeKey: x.sizeKey, url: x.url, qty: x.qty || 1, id: d.id }); });
      renderSheet();
    } catch (e) { fbStatus("error al leer: " + (e.message || e)); }
  }
  async function fbUpdateQty(item) {
    if (!FB.ready || !item.id) return;
    const { doc, updateDoc } = FB.fs;
    try { await updateDoc(doc(FB.db, "piezas", item.id), { qty: item.qty || 1 }); } catch (e) {}
  }
  async function fbDelete(item) {
    if (!FB.ready || !item.id) return;
    const { doc, deleteDoc } = FB.fs;
    try { await deleteDoc(doc(FB.db, "piezas", item.id)); } catch (e) {}
  }

  // Asegura que Brandon Grotesque esté cargada antes de capturar (evita texto encimado)
  async function ensureFonts() {
    try {
      if (document.fonts) {
        await Promise.all([
          document.fonts.load('400 40px "Brandon Grotesque"'),
          document.fonts.load('500 40px "Brandon Grotesque"'),
          document.fonts.load('700 40px "Brandon Grotesque"'),
          document.fonts.load('900 40px "Brandon Grotesque"'),
        ]);
        await document.fonts.ready;
      }
    } catch (e) {}
  }
  async function snap(el) {
    await ensureFonts();
    const w = parseFloat(el.style.width), h = parseFloat(el.style.height);
    // html2canvas se descoloca (texto encimado) si un ancestro tiene transform:scale
    // (el zoom del preview). Se quita durante la captura y se restaura.
    const ss = $("stageScale"), prev = ss.style.transform;
    ss.style.transform = "none";
    try {
      return await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff", width: w, height: h });
    } finally { ss.style.transform = prev; }
  }
  const nombre = () => (($("marca").value || "cartel") + "-" + ($("sku").value || Date.now())).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const errExport = () => alert("No se pudo exportar. Si la imagen viene del SKU puede bloquear la descarga (CORS): sube la imagen manual.");

  $("btnPng").addEventListener("click", async () => { try { const c = await snap(activeEl()); const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = nombre() + ".png"; a.click(); } catch (e) { errExport(); } });
  $("btnPdf").addEventListener("click", async () => { try { const s = curSize(); const c = await snap(activeEl()); const { jsPDF } = window.jspdf; const pdf = new jsPDF({ unit: "cm", format: "letter", orientation: s.h >= s.w ? "portrait" : "landscape" }); const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight(); const x = (pw - s.w) / 2, y = (ph - s.h) / 2; pdf.addImage(c.toDataURL("image/png"), "PNG", x, y, s.w, s.h); pdf.save(nombre() + ".pdf"); } catch (e) { errExport(); } });

  $("btnGrabar").addEventListener("click", async () => {
    try { const c = await snap(activeEl()); const item = { sizeKey: $("tamano").value, url: c.toDataURL("image/jpeg", 0.9), qty: 1 }; QUEUE.push(item); flashGrabar(); await fbSave(item); renderSheet(); }
    catch (e) { errExport(); }
  });
  function flashGrabar() { const b = $("btnGrabar"); const o = b.textContent; b.textContent = "✓ Grabado"; setTimeout(() => b.textContent = o, 900); }

  $("bordeOn").addEventListener("change", renderSheet);
  $("bordeTipo").addEventListener("change", renderSheet);
  $("btnClearQueue").addEventListener("click", () => { const rm = QUEUE.filter((q) => q.sizeKey === $("tamano").value); QUEUE = QUEUE.filter((q) => q.sizeKey !== $("tamano").value); rm.forEach(fbDelete); renderSheet(); });

  // modelo de imposición: pieza SIN rotar; solo elegimos orientación de la hoja
  function sheetModel() {
    const s = curSize();
    const combos = [
      { sw: LETTER.w, sh: LETTER.h, cw: s.w, ch: s.h }, // hoja vertical
      { sw: LETTER.h, sh: LETTER.w, cw: s.w, ch: s.h }, // hoja horizontal
    ].map((o) => { o.cols = Math.floor(o.sw / o.cw); o.rows = Math.floor(o.sh / o.ch); o.n = o.cols * o.rows; return o; });
    return combos.reduce((a, b) => b.n > a.n ? b : a);
  }

  function renderSheet() {
    const s = curSize();
    const items = QUEUE.filter((q) => q.sizeKey === $("tamano").value);
    const m = sheetModel();
    const total = items.reduce((a, it) => a + (it.qty || 1), 0);
    $("sheetInfo").innerHTML =
      '<span class="pill">' + s.label + ' cm</span>' +
      '<span class="pill">' + m.n + ' por hoja (' + m.cols + '×' + m.rows + ')</span>' +
      '<span class="pill">hoja ' + (m.sw > m.sh ? 'horizontal' : 'vertical') + '</span>' +
      '<span class="pill">' + total + ' / ' + m.n + ' copias en la hoja</span>';

    // cola visual con cantidad por pieza
    const q = $("queue"); q.innerHTML = "";
    if (!items.length) q.innerHTML = '<div class="empty">Aún no grabas piezas de este tamaño. Ve a «Cartel» y pulsa «Grabar en la hoja».</div>';
    items.forEach((it) => {
      const d = document.createElement("div"); d.className = "q";
      d.innerHTML = '<img src="' + it.url + '"/><button title="Quitar">×</button>' +
        '<div style="text-align:center;margin-top:4px"><label style="font-size:10px;color:#666">cant.</label> ' +
        '<input type="number" min="1" value="' + (it.qty || 1) + '" style="width:46px;padding:2px 4px;border:1px solid #ddd;border-radius:6px"/></div>';
      d.querySelector("button").addEventListener("click", () => { const idx = QUEUE.indexOf(it); if (idx >= 0) QUEUE.splice(idx, 1); fbDelete(it); renderSheet(); });
      d.querySelector("input").addEventListener("input", (e) => { it.qty = Math.max(1, parseInt(e.target.value, 10) || 1); fbUpdateQty(it); renderSheet(); });
      q.appendChild(d);
    });

    // lista plana según cantidad (no llena la hoja con copias de más)
    const flat = []; items.forEach((it) => { for (let i = 0; i < (it.qty || 1) && flat.length < m.n; i++) flat.push(it); });

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
      if (k < flat.length) {
        const img = document.createElement("img"); img.src = flat[k].url;
        cell.appendChild(img);
      }
      k++;
      sheet.appendChild(cell);
      if (borde && tipo === "marcas") addCropMarks(sheet, (offX + col * m.cw) * SP, (offY + r * m.ch) * SP, m.cw * SP, m.ch * SP);
    }
  }
  // marcas en las 4 esquinas de la celda (líneas hacia afuera)
  function addCropMarks(sheet, x, y, w, h) {
    const L = 12;
    const mark = (mx, my, dx, dy) => {
      const hl = document.createElement("div"); hl.style.cssText = "position:absolute;background:#333;height:1px;width:" + L + "px;top:" + my + "px;left:" + (dx < 0 ? mx - L : mx) + "px;";
      const vl = document.createElement("div"); vl.style.cssText = "position:absolute;background:#333;width:1px;height:" + L + "px;left:" + mx + "px;top:" + (dy < 0 ? my - L : my) + "px;";
      sheet.appendChild(hl); sheet.appendChild(vl);
    };
    mark(x, y, -1, -1); mark(x + w, y, 1, -1); mark(x, y + h, -1, 1); mark(x + w, y + h, 1, 1);
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
    const flat = []; items.forEach((it) => { for (let i = 0; i < (it.qty || 1) && flat.length < m.n; i++) flat.push(it); });
    const imgs = await Promise.all(flat.map((it) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = it.url; })));
    const gridW = m.cols * m.cw, gridH = m.rows * m.ch;
    const offX = (m.sw - gridW) / 2, offY = (m.sh - gridH) / 2;
    const borde = $("bordeOn").checked, tipo = $("bordeTipo").value;
    let k = 0;
    for (let r = 0; r < m.rows; r++) for (let col = 0; col < m.cols; col++) {
      const x = (offX + col * m.cw) * PPCM, y = (offY + r * m.ch) * PPCM, w = m.cw * PPCM, h = m.ch * PPCM;
      if (k < imgs.length) ctx.drawImage(imgs[k], x, y, w, h);
      if (k < imgs.length && borde && tipo === "linea") { ctx.strokeStyle = "#999"; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h); }
      if (k < imgs.length && borde && tipo === "marcas") cropCanvas(ctx, x, y, w, h);
      k++;
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
    $("cfgLegal").value = CFG.legal; fillEventos();
  }
  function thumb(src) { const t = document.createElement("div"); t.className = "thumb"; if (src) { const im = document.createElement("img"); im.src = src; t.appendChild(im); } else t.textContent = "—"; return t; }
  function uploadBtn(cb) { const b = document.createElement("button"); b.textContent = "Subir"; const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.style.display = "none"; inp.addEventListener("change", (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = (x) => cb(x.target.result); r.readAsDataURL(f); }); b.addEventListener("click", () => inp.click()); b.appendChild(inp); return b; }
  function bannerRow(ev, i) {
    const row = document.createElement("div"); row.className = "banneritem"; row.appendChild(thumb(ev.src));
    const meta = document.createElement("div"); meta.className = "meta";
    const inp = document.createElement("input"); inp.value = ev.label; inp.addEventListener("input", () => { ev.label = inp.value; save(); fillEventos(); });
    const sm = document.createElement("small"); sm.textContent = "Sube " + (ev.franja ? RECO_FRANJA : RECO_HEADER); meta.appendChild(inp); meta.appendChild(sm); row.appendChild(meta);
    const ops = document.createElement("div"); ops.className = "ops";
    const chk = document.createElement("label"); chk.className = "chk"; const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = !!ev.franja; cb.addEventListener("change", () => { ev.franja = cb.checked; save(); renderConfig(); render(); }); chk.appendChild(cb); chk.appendChild(document.createTextNode("franja"));
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
  $("resetCfg").addEventListener("click", () => { if (!confirm("¿Restaurar configuración por defecto?")) return; CFG = structuredClone(DEFAULT_CFG); save(); renderConfig(); render(); });

  /* ---------- Fit preview ---------- */
  function fitStage() {
    const onHoja = !$("sheetWrap").classList.contains("hidden");
    if (onHoja) return;
    const s = $("stageScale"); const el = activeEl();
    const w = parseFloat(el.style.width) || 750, h = parseFloat(el.style.height) || 1000;
    const availW = s.parentElement.clientWidth;
    const sc = Math.min(availW / w, 760 / h); // encaja en el panel
    s.style.transform = "scale(" + sc + ")"; s.style.height = (h * sc) + "px";
  }
  window.addEventListener("resize", fitStage);

  /* ---------- Init ---------- */
  renderConfig(); render(); fitStage(); fbInit();
})();
