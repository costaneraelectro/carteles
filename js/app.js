/* Generador de Carteles — Falabella */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);

  /* ---------- Tamaños (cm) y capacidades ----------
     img=lleva foto  banner=lleva banner+QR+pie legal  cae=permite cuotas/CAE  */
  const SIZES = {
    carta:  { w: 19.5, h: 26, layout: "p", img: true,  banner: true,  cae: true,  label: "Carta" },
    s13x19: { w: 13,   h: 19, layout: "p", img: false, banner: true,  cae: true,  label: "13×19" },
    s9x13:  { w: 9,    h: 13, layout: "p", img: false, banner: true,  cae: true,  label: "9×13" },
    s9x7:   { w: 9,    h: 7,  layout: "p", img: false, banner: true,  cae: false, label: "9×7" },
    s6x4:   { w: 6,    h: 4,  layout: "p", img: false, banner: false, cae: false, label: "6×4" },
    s12x3:  { w: 12,   h: 3,  layout: "h", img: false, banner: false, cae: false, label: "12×3" },
    s9x13plan: { w: 8.4, h: 12, layout: "telco", img: false, banner: false, cae: false, label: "9×13 Planes" },
    plancarta: { w: 21.6, h: 27.9, layout: "planes", img: true, banner: false, cae: false, label: "Carta gráfica planes" },
  };
  const LETTER = { w: 21.59, h: 27.94 }; // carta cm
  const TELCO_QR = "https://rebate-management-prd.eastus2.cloudapp.azure.com/rebate-carteles/download-pdf/insurance/?hash_cartel=T4RXdWu";
  const OPERADORES = [
    { key: "claro", label: "Claro", slot: "opClaro" },
    { key: "entel", label: "Entel", slot: "opEntel" },
    { key: "movistar", label: "Movistar", slot: "opMovistar" },
    { key: "wom", label: "WOM", slot: "opWom" },
  ];

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
      badgeUnica: { label: "Sello Oportunidad única + CMR", src: "assets/logos/badge-unica.png" },
      fpuntos:    { label: "Logo Fpuntos (pie)", src: "assets/logos/fpuntos.png" },
      opClaro:    { label: "Logo Claro (planes)", src: "assets/logos/telco/claro.png" },
      opEntel:    { label: "Logo Entel (planes)", src: "assets/logos/telco/entel.png" },
      opMovistar: { label: "Logo Movistar (planes)", src: "assets/logos/telco/movistar.png" },
      opWom:      { label: "Logo WOM (planes)", src: "assets/logos/telco/wom.png" },
      falabella:  { label: "Logo Falabella «f» (planes)", src: "assets/logos/telco/falabella.png" },
      connect:    { label: "Logo CONNECT (pie planes)", src: "assets/logos/planes/connect.png" },
      bandas:     { label: "Sello 2G-5G «bandas» (pie planes)", src: "assets/logos/planes/bandas.png" },
      entelRedes: { label: "Iconos redes Entel (columna Entel)", src: "assets/logos/planes/entel-redes.png" },
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
          const D = DEFAULT_CFG.slots;
          Object.keys(D).forEach((k) => { if (!c.slots[k]) c.slots[k] = structuredClone(D[k]); });
          // adopta los logos de planes agregados luego (si el slot quedó vacío)
          ["connect", "bandas", "entelRedes"].forEach((k) => { if (c.slots[k] && !c.slots[k].src && D[k].src) c.slots[k].src = D[k].src; });
        }
        return c;
      }
    } catch (e) {}
    return structuredClone(DEFAULT_CFG);
  }
  function save() { try { localStorage.setItem(CFG_KEY, JSON.stringify(CFG)); } catch (e) {} }

  /* ---------- Utils ---------- */
  const clp = (n) => (n === "" || n == null || isNaN(n)) ? "" : "$" + Math.round(Number(n)).toLocaleString("es-CL");
  const fmtFecha = (v) => { if (!v) return ""; const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? m[3] + "/" + m[2] + "/" + m[1] : v; };
  const num = (id) => { const v = parseFloat($(id).value); return isNaN(v) ? NaN : v; };
  const F_CUOTA = 0.101296, F_CTC = 1.22347;
  const curSize = () => SIZES[$("tamano").value];

  /* ---------- Tabs ---------- */
  function goTab(tab) {
    document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("active", x.dataset.tab === tab));
    $("pane-cartel").classList.toggle("hidden", tab !== "cartel");
    $("pane-hoja").classList.toggle("hidden", tab !== "hoja");
    $("pane-config").classList.toggle("hidden", tab !== "config");
    $("stageScale").classList.toggle("hidden", tab === "hoja");
    $("sheetWrap").classList.toggle("hidden", tab !== "hoja");
    if (tab === "hoja") renderSheet();
    fitStage();
  }
  document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => goTab(t.dataset.tab)));

  /* ---------- Selector de banner ---------- */
  function fillEventos() {
    const sel = $("evento"), prev = sel.value;
    sel.innerHTML = "";
    CFG.eventos.forEach((e) => { const o = document.createElement("option"); o.value = e.id; o.textContent = e.label + (e.src ? "" : " (sin imagen)"); sel.appendChild(o); });
    sel.value = prev || (CFG.eventos[0] && CFG.eventos[0].id) || "";
  }

  /* ---------- Imagen manual / QR ---------- */
  let manualImg = null;
  $("imagen").addEventListener("change", (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = (x) => { manualImg = x.target.result; resetImgEditor(); render(); }; r.readAsDataURL(f); });

  function resetImgEditor() { $("imgZoom").value = 1; $("imgX").value = 0; $("imgY").value = 0; }
  $("imgReset").addEventListener("click", () => { resetImgEditor(); render(); });
  $("imgTrim").addEventListener("click", () => {
    const sku = $("sku").value.trim();
    const src = manualImg || (sku ? "https://media.falabella.com/falabellaCL/" + encodeURIComponent(sku) + "/public" : "");
    if (!src) return;
    const im = new Image(); im.crossOrigin = "anonymous";
    im.onload = () => {
      const cv = document.createElement("canvas"); cv.width = im.naturalWidth; cv.height = im.naturalHeight;
      const ctx = cv.getContext("2d"); ctx.drawImage(im, 0, 0);
      let d; try { d = ctx.getImageData(0, 0, cv.width, cv.height).data; }
      catch (e) { alert("No se puede recortar esta imagen (viene de otra web). Súbela como imagen manual y recórtala."); return; }
      const thr = 244; let minX = cv.width, minY = cv.height, maxX = 0, maxY = 0, found = false;
      for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) {
        const i = (y * cv.width + x) * 4, r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
        if (a > 12 && !(r > thr && g > thr && b > thr)) { found = true; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
      }
      if (!found) return;
      const pad = 8; minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad); maxX = Math.min(cv.width - 1, maxX + pad); maxY = Math.min(cv.height - 1, maxY + pad);
      const w = maxX - minX + 1, h = maxY - minY + 1;
      const out = document.createElement("canvas"); out.width = w; out.height = h;
      out.getContext("2d").drawImage(cv, minX, minY, w, h, 0, 0, w, h);
      manualImg = out.toDataURL("image/png"); resetImgEditor(); render();
    };
    im.onerror = () => alert("No se pudo cargar la imagen para recortar. Súbela como imagen manual.");
    im.src = src;
  });
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
    const horiz = size.layout === "h";
    const telco = size.layout === "telco";
    const planes = size.layout === "planes";
    // capacidades / campos según tamaño
    $("caeWrap").classList.toggle("hidden", !size.cae);
    $("bannerWrap").classList.toggle("hidden", !size.banner);
    $("qrFieldset").classList.toggle("hidden", !size.banner || telco);   // QR fijo en telco
    $("tipoField").classList.toggle("hidden", telco || planes);
    $("fsPrecios").classList.toggle("hidden", telco || planes);
    $("fsElectro").classList.toggle("hidden", telco || planes);
    $("fsTelco").classList.toggle("hidden", !telco);
    $("fsPlanes").classList.toggle("hidden", !planes);
    // en telco no se rellenan: SKU, Link/Buscar, Categoría
    $("skuField").classList.toggle("hidden", telco);
    $("linkField").classList.toggle("hidden", telco);
    $("catField").classList.toggle("hidden", telco || planes);
    // layout activo
    $("cartel").classList.toggle("hidden", horiz || telco || planes);
    $("cartelH").classList.toggle("hidden", !horiz);
    $("cartelP").classList.toggle("hidden", !telco);
    $("cartelPL").classList.toggle("hidden", !planes);
    // dims de diseño
    if (telco) {
      const el = $("cartelP");
      el.style.width = "660px";
      el.style.height = "auto";      // alto según contenido (sin espacio muerto)
    } else if (planes) {
      const DW = 816, el = $("cartelPL");
      el.style.width = DW + "px";
      el.style.height = Math.round(DW * (size.h / size.w)) + "px";
    } else if (horiz) {
      const HDES = 230, el = $("cartelH");
      el.style.height = HDES + "px";
      el.style.width = Math.round(HDES * (size.w / size.h)) + "px";
    } else {
      const DW = 750;
      $("cartel").style.width = DW + "px";
      $("cartel").style.height = Math.round(DW * (size.h / size.w)) + "px";
    }
    // imagen manual + editor solo carta con imagen
    const imgOn = size.img && $("showImg").checked;
    $("imgManualWrap").classList.toggle("hidden", !imgOn);
    $("fsImg").classList.toggle("hidden", !imgOn);
    $("showImg").parentElement.classList.toggle("hidden", !size.img);

    if (telco) renderTelco(); else if (planes) renderPlanes(); else if (horiz) renderHorizontal(); else renderPortrait(size);
    checkPriceWarn();
    requestAnimationFrame(() => { fitBody(); fitStage(); });
  }

  // 5) aviso si el precio de oferta/OU no es menor al normal
  function checkPriceWarn() {
    const el = $("priceWarn"); if (!el) return;
    const tv = $("tipo").value;
    const normal = num("precioNormal");
    const off = tv === "ou" ? num("precioOU") : tv === "oferta" ? num("precioOferta") : num("precio");
    const etq = tv === "ou" ? "OU" : tv === "oferta" ? "oferta" : "precio";
    let msg = "";
    if (!isNaN(off) && !isNaN(normal) && normal > 0 && off >= normal)
      msg = "⚠ El precio " + etq + " (" + clp(off) + ") NO es menor al normal (" + clp(normal) + "). No hay descuento — revísalo.";
    el.textContent = msg; el.classList.toggle("hidden", !msg);
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
    if (showImg) {
      const sku = $("sku").value.trim();
      const src = manualImg || (sku ? "https://media.falabella.com/falabellaCL/" + encodeURIComponent(sku) + "/public" : "");
      if (src) $("mediaImg").src = src;
      const z = parseFloat($("imgZoom").value) || 1, x = parseFloat($("imgX").value) || 0, y = parseFloat($("imgY").value) || 0;
      $("mediaImg").style.transform = "translate(" + x + "px," + y + "px) scale(" + z + ")";
      $("zoomVal").textContent = Math.round(z * 100) + "%";
    }

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

    const d = fmtFecha($("vigDesde").value), h = fmtFecha($("vigHasta").value);
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
    const d = fmtFecha($("vigDesde").value), h = fmtFecha($("vigHasta").value);
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

  /* ---------- Telco (9x13 planes) ---------- */
  function buildTelcoForm() {
    const box = $("telcoForm"); box.innerHTML = "";
    OPERADORES.forEach((op) => {
      const w = document.createElement("fieldset"); w.style.margin = "0 0 10px";
      w.innerHTML =
        '<legend style="color:#333">' + op.label + '</legend>' +
        '<div class="field check"><input type="checkbox" id="t_' + op.key + '_on"/><label for="t_' + op.key + '_on" style="margin:0">Mostrar</label></div>' +
        '<div class="row2"><div class="field"><label>Valor equipo</label><input type="number" id="t_' + op.key + '_eq"/></div>' +
        '<div class="field"><label>Plan mensual</label><input type="number" id="t_' + op.key + '_plan"/></div></div>' +
        '<div class="row2"><div class="field"><label>GB</label><input type="text" id="t_' + op.key + '_gb" placeholder="300"/></div>' +
        '<div class="field"><label>Mandato (meses)</label><input type="number" id="t_' + op.key + '_man" placeholder="18"/></div></div>';
      box.appendChild(w);
    });
    OPERADORES.forEach((op) => ["on", "eq", "plan", "gb", "man"].forEach((f) => {
      const el = $("t_" + op.key + "_" + f); el.addEventListener("input", render); el.addEventListener("change", render);
    }));
    $("telcoBorde").addEventListener("change", render);
  }
  function renderTelco() {
    $("cartelP").classList.toggle("borde", $("telcoBorde").checked);
    $("tpEquipo").textContent = [$("marca").value.toUpperCase(), $("modelo").value.toUpperCase()].filter(Boolean).join(" ");
    $("tpFecha").textContent = fmtFecha($("vigDesde").value);
    const badge = CFG.slots.badgeUnica.src;
    $("tpRows").innerHTML = OPERADORES.map((op) => {
      const on = $("t_" + op.key + "_on").checked;
      const logo = CFG.slots[op.slot].src;
      const eq = num("t_" + op.key + "_eq"), plan = num("t_" + op.key + "_plan");
      const gb = $("t_" + op.key + "_gb").value.trim(), man = $("t_" + op.key + "_man").value.trim();
      return '<div class="tp-row' + (on ? "" : " off") + '">' +
        '<div class="tp-logo">' + (logo ? '<img src="' + logo + '"/>' : '<span style="font-weight:800;color:#bbb;font-size:12px">' + op.label + '</span>') + '</div>' +
        '<div class="tp-mid">' +
          '<div class="tp-lbl">Valor equipo</div>' +
          '<div class="tp-eq"><span class="v">' + (clp(eq) || "") + '</span>' + (badge ? '<img src="' + badge + '"/>' : '') + '</div>' +
          '<div class="tp-lbl">Valor plan mensual</div>' +
          '<div class="tp-plan">' + (clp(plan) || "") + ' <small>/mes</small></div>' +
        '</div>' +
        '<div class="tp-right">' +
          '<div class="gb">' + (gb ? gb + " GB" : "") + '</div>' +
          '<div class="min">Minutos <b>LIBRES</b></div>' +
          '<div class="man">Mandato <b>' + (man || "") + '</b> meses</div>' +
        '</div></div>';
    }).join("");
    // QR fijo del seguro (no editable)
    $("tpQr").classList.remove("hidden");
    if ($("tpQr").dataset.link !== TELCO_QR) { $("tpQr").dataset.link = TELCO_QR; $("tpQr").innerHTML = ""; try { new QRCode($("tpQr"), { text: TELCO_QR, width: 240, height: 240, correctLevel: QRCode.CorrectLevel.M }); } catch (e) {} }
    const fala = CFG.slots.falabella.src;
    $("tpFala").classList.toggle("hidden", !fala);
    if (fala) $("tpFala").src = fala;
  }

  /* ====================================================================
     CARTA GRÁFICA PLANES
     ==================================================================== */
  const PLAN_OPS = [
    { key: "claro", label: "CLARO", slot: "opClaro" },
    { key: "entel", label: "ENTEL", slot: "opEntel" },
    { key: "wom",   label: "WOM",   slot: "opWom" },
  ];
  const WOM_INC = "REDES SOCIALES Y APP MÚSICA PARA SIEMPRE / LIBRE ROAMING EN MÁS DE 50 PAÍSES / MODALIDAD ACUMULA TUS GB";
  const CALLCENTER = "600 390 4100";
  const MESES_ES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  function fechaLarga(v) { const m = (v || "").match(/^(\d{4})-(\d{2})-(\d{2})$/); if (!m) return ""; return parseInt(m[3], 10) + " de " + MESES_ES[parseInt(m[2], 10) - 1] + " de " + m[1]; }
  const dParts = (v) => { const m = (v || "").match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? { y: m[1], mo: parseInt(m[2], 10) - 1, d: parseInt(m[3], 10) } : null; };
  function vigSentence(dv, hv) {
    const a = dParts(dv), b = dParts(hv);
    let r = "";
    if (a && b) r = (a.mo === b.mo && a.y === b.y) ? "desde el " + a.d + " al " + b.d + " de " + MESES_ES[a.mo] + " de " + a.y
      : "desde el " + a.d + " de " + MESES_ES[a.mo] + " de " + a.y + " al " + b.d + " de " + MESES_ES[b.mo] + " de " + b.y;
    else if (a) r = "desde el " + a.d + " de " + MESES_ES[a.mo] + " de " + a.y;
    return "Ofertas y promociones válidas " + (r ? r + " " : "") + "o hasta agotar las unidades disponibles informadas, lo que ocurra primero. ";
  }
  // Legal FIJO del cartel de planes (solo cambia la vigencia, que va antes)
  const PLAN_LEGAL =
    "La contratación del plan está sujeta a previa evaluación comercial de cada operador de telefonía, se realiza en base a la " +
    "información de la tarjeta CMR del cliente y puede ser pagada con cualquier medio de pago disponible. El precio del equipo aplica " +
    "solo si el cliente contrata el plan de telefonía indicado y firma un mandato para el cobro, en su tarjeta de crédito CMR, de la " +
    "diferencia entre el valor del equipo asociado a la oportunidad única y el precio prepago de este, según corresponda. Lo anterior, " +
    "al dar de baja el plan suscrito o contratar uno más económico dentro de un periodo de 18 meses para cada operador. Sobre las " +
    "promociones, “Redes sociales y app música para siempre / Modalidad acumula tus GB” más información en www.wom.cl. Entel " +
    "“Ahora RR.SS”, más información en www.entel.cl. “Larga distancia, Roaming en 20 países, incluye minutos, gigas, SMS y " +
    "minutos en larga distancia”, más información en www.clarochile.cl El pago con tarjetas de crédito puede tener costos asociados. " +
    "Consultar al emisor para mayor información. Infórmese sobre la garantía estatal de los depósitos en su banco o en www.cmfchilesbif.cl. " +
    "No acumulable con otras ofertas, promociones o beneficios.";
  function specIcon(txt) {
    const t = (txt || "").toLowerCase();
    let p;
    if (/c[áa]mara/.test(t)) p = '<rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="12" cy="12.5" r="3.4"/><path d="M8 6l1.5-2h5L16 6"/>';
    else if (/memoria|almacen|gb|rom/.test(t)) p = '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 4v16M15 4v16"/>';
    else if (/bater[íi]a|mah/.test(t)) p = '<rect x="3" y="7" width="16" height="10" rx="2"/><path d="M21 10v4"/>';
    else if (/procesador|chip|cpu|snap/.test(t)) p = '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>';
    else p = '<circle cx="12" cy="12" r="7"/>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }
  function renderPlanes() {
    const badge = CFG.slots.badgeUnica.src;
    const badgeImg = badge ? '<img src="' + badge + '"/>' : '';
    const marca = $("marca").value.trim(), modelo = $("modelo").value.trim();
    const skusRaw = $("plSkus").value.trim();
    const primerSku = (skusRaw.match(/\d{5,}/) || [""])[0] || $("sku").value.trim();
    const src = manualImg || (primerSku ? "https://media.falabella.com/falabellaCL/" + encodeURIComponent(primerSku) + "/public" : "");

    const unico = num("plUnico"), normal = num("plNormal");
    const desc = (!isNaN(unico) && !isNaN(normal)) ? normal - unico : NaN;
    const destKey = $("plDestOp").value;
    const destOp = PLAN_OPS.find((o) => o.key === destKey) || PLAN_OPS[0];
    const cargoDest = num("plCargoDest");

    // overlays izquierda
    const lanza = $("plLanza").checked ? '<div class="pl-lanza">' + ($("plLanzaTxt").value.trim() || "LANZAMIENTO") + '</div>' : '';
    const cuotas = $("plCuotas").checked ? '<div class="pl-cuotas"><b>' + (($("plCuotasN").value || "").trim() || "0") + '</b><span>cuotas sin interés con tu CMR</span></div>' : '';
    let specs = '';
    if ($("plSpecs").checked) {
      const lines = $("plSpecsTxt").value.split("\n").map((s) => s.trim()).filter(Boolean);
      specs = '<div class="pl-specs">' + lines.map((ln) => {
        const parts = ln.split(/\||:/); const tit = (parts.shift() || "").trim(); const det = parts.join(":").trim();
        return '<div class="pl-spec"><span class="ic">' + specIcon(tit) + '</span><span class="tx"><b>' + tit + '</b>' + (det ? '<br>' + det : '') + '</span></div>';
      }).join("") + '</div>';
    }

    const gbTxt = (v) => { const s = (v || "").toString().trim(); return s ? s + "GB" : "—"; };

    // columnas
    const cols = PLAN_OPS.map((op) => {
      const precio = num("pl_" + op.key + "_precio"), cargo = num("pl_" + op.key + "_cargo");
      const gb = gbTxt($("pl_" + op.key + "_gb").value);
      const logo = CFG.slots[op.slot].src;
      let inc;
      if (op.key === "claro") {
        const rg = ($("pl_claro_rgb").value || "").trim(), rm = ($("pl_claro_rmin").value || "").trim();
        inc = '<div class="pl-inc-claro">' +
          '<div class="r roam"><span class="pl-plane">✈</span>INCLUYE ROAMING INTERNACIONAL DE<br><b>' + (rg ? rg + "GB" : "—") + ' + ' + (rm || "—") + ' MINUTOS</b></div>' +
          '<div class="r2"><b>+ ' + (rm || "—") + ' MINUTOS</b> EN LLAMADAS LARGA<br>DISTANCIA DESDE CHILE</div>' +
          '</div>';
      } else if (op.key === "entel") {
        const er = CFG.slots.entelRedes.src;
        inc = er ? '<img class="pl-inc-redes" src="' + er + '"/>' : '<div class="pl-inc-txt">REDES SOCIALES</div>';
      } else {
        inc = '<div class="pl-inc-txt small">' + WOM_INC + '</div>';   // WOM fijo
      }
      return '<div class="pl-col">' +
        '<div class="pl-col-top">' + badgeImg + '<span class="pr">' + (clp(precio) || "—") + '</span></div>' +
        '<div class="pl-col-contr">CONTRATANDO PLAN<br><b>' + op.label + '</b></div>' +
        '<div class="pl-col-plan-lbl">MINUTOS LIBRES</div>' +
        '<div class="pl-col-plan"><b>' + (clp(cargo) || "—") + '</b> / MES</div>' +
        '<div class="pl-col-gb"><span class="gb">' + gb + '</span>' + (logo ? '<img src="' + logo + '"/>' : '') + '</div>' +
        '<div class="pl-col-inc-lbl">I N C L U Y E</div>' +
        inc + '</div>';
    }).join('<div class="pl-col-sep"></div>');

    // pie
    const connect = CFG.slots.connect.src ? '<img class="pl-connect" src="' + CFG.slots.connect.src + '"/>' : '<div class="pl-connect tx">CONNECT</div>';
    const bandas = CFG.slots.bandas.src ? '<img class="pl-bandas" src="' + CFG.slots.bandas.src + '"/>' : '<div class="pl-bandas tx">2G · 3G · 4G · 5G<br>APTO PARA TODAS LAS BANDAS</div>';
    const opLogos = PLAN_OPS.map((op) => { const l = CFG.slots[op.slot].src; return l ? '<img src="' + l + '"/>' : ''; }).join("");
    const fala = CFG.slots.falabella.src ? '<img class="pl-fala" src="' + CFG.slots.falabella.src + '"/>' : '';
    const legal = vigSentence($("vigDesde").value, $("vigHasta").value) + PLAN_LEGAL;

    $("cartelPL").innerHTML =
      '<div class="pl-head">' +
        '<div class="pl-title">PLANES</div>' +
        '<div class="pl-dots"><span class="pl-dot on"></span><span class="pl-dot"></span><span class="pl-dot"></span><span class="pl-dot"></span></div>' +
        '<div class="pl-subwrap"><span class="pl-brk tl"></span><span class="pl-brk br"></span><span class="pl-x">✕</span>' +
          '<div class="pl-sub-b">ENTRE TODOS LOS PLANES,</div><div class="pl-sub-2">HAY UNO PERFECTO PARA TI.</div></div>' +
      '</div>' +
      '<div class="pl-rule"></div>' +
      '<div class="pl-hero">' +
        '<div class="pl-hero-deco"><span class="d on"></span><span class="d"></span><span class="ln"></span></div>' +
        '<div class="pl-hero-l">' + lanza +
          '<div class="pl-circle"></div>' + specs +
          (src ? '<img class="pl-img" src="' + src + '" crossorigin="anonymous"/>' : '') + cuotas +
        '</div>' +
        '<div class="pl-hero-r">' +
          '<div class="pl-brand">' + (marca || "Marca") + '</div>' +
          '<div class="pl-model">' + (modelo || "Modelo") + '</div>' +
          '<div class="pl-price-line"><div class="pl-badge">' + badgeImg + '</div>' +
            '<div class="pl-price-red">' + (clp(unico) || "$—") + '</div></div>' +
          '<div class="pl-contr">CONTRATANDO PLAN ' + destOp.label + (isNaN(cargoDest) ? '' : '<br>DE ' + clp(cargoDest) + ' / MES') + '</div>' +
          '<div class="pl-normal-lbl">PRECIO NORMAL:</div>' +
          '<div class="pl-price-normal">' + (clp(normal) || "$—") + '</div>' +
          (isNaN(desc) ? '' : '<div class="pl-desc">DESCUENTO: ' + clp(desc) + '</div>') +
          (skusRaw ? '<div class="pl-sku">SKU: ' + skusRaw + '</div>' : '') +
          '<div class="pl-unids">UNIDS. DISPONIBLES: ' + (($("plUnids").value || "").trim() || "—") + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="pl-cols">' + cols + '</div>' +
      '<div class="pl-call"><span>CONTRATA TU PLAN EN NUESTRO CALL CENTER</span><b class="pl-call-phone">☏ ' + CALLCENTER + '</b><span>O DE FORMA ONLINE EN FALABELLA.COM</span></div>' +
      '<div class="pl-foot">' +
        '<div class="pl-foot-l">' + bandas +
          '<div class="pl-legal">' + legal + '</div>' +
        '</div>' +
        '<div class="pl-foot-r">' +
          '<div class="pl-foot-brand">' + connect + '<div class="pl-oplogos">' + opLogos + '</div></div>' + fala +
        '</div>' +
      '</div>';
  }

  /* auto-ajuste del cuerpo portrait: reduce el tamaño de fuente (var --k) hasta calzar.
     Sin transform, para que html2canvas exporte bien. */
  function fitBody() {
    const L = curSize().layout; if (L === "h" || L === "telco" || L === "planes") return;
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
  // trae datos de un SKU; devuelve { d } o { err }
  async function fetchProducto(sku) {
    const api = "https://www.falabella.com/s/browse/v3/product/cl?site=falabella-cl&productId=" + encodeURIComponent(sku);
    const intentos = [api, ...PROXIES.map((px) => px(api))];
    let ultimo = "";
    for (const url of intentos) {
      try {
        const r = await fetchTimeout(url, 9000);
        const t = await r.text(); let j; try { j = JSON.parse(t); } catch (e) { ultimo = "respuesta no-JSON"; continue; }
        const d = j.data || j; if (!d || !d.variants) { ultimo = "sin datos"; continue; }
        return { d };
      } catch (e) { ultimo = (e && e.name === "AbortError") ? "timeout" : "bloqueado (CORS)"; }
    }
    return { err: ultimo || "sin conexión" };
  }
  async function buscarSku() {
    let raw = ($("link").value.trim() || $("sku").value.trim());     // prefiere el link
    const mlink = raw.match(/(\d{6,})/); const sku = mlink ? mlink[1] : raw;
    if (!sku) return;
    const hint = $("skuHint"); hint.textContent = "Buscando en falabella.com…";
    const res = await fetchProducto(sku);
    if (res.d) { aplicarProducto(res.d, sku); hint.textContent = "Datos cargados — CONFIRMA los precios (pueden variar)."; render(); return; }
    hint.textContent = "No se pudo traer de falabella.com (" + res.err + "). Publica en GitHub Pages o rellena manual.";
  }
  function aplicarProducto(d, sku) {
    // borra lo anterior antes de rellenar
    ["marca", "categoria", "modelo", "precio", "precioOU", "precioOferta", "precioNormal"].forEach((id) => { $(id).value = ""; });
    if (sku) $("sku").value = sku;
    if (d.brandName) $("marca").value = d.brandName;
    if (d.name) $("modelo").value = d.name;
    try { const bc = d.breadCrumb || []; if (bc.length) $("categoria").value = (bc[bc.length - 2] || bc[bc.length - 1]).label || ""; } catch (e) {}
    const v = (d.variants || []).find((x) => x.id === d.primaryVariantId) || d.variants[0] || {};
    const pr = {}; (v.prices || []).forEach((p) => { pr[p.type] = parseInt(String((p.price && p.price[0]) || "").replace(/\D/g, ""), 10); });
    // detecta el tipo automáticamente
    let tipo = "normal";
    if (!isNaN(pr.cmrPrice)) tipo = "ou";
    else if (!isNaN(pr.internetPrice) && !isNaN(pr.normalPrice) && pr.internetPrice < pr.normalPrice) tipo = "oferta";
    $("tipo").value = tipo;
    // asigna precios
    if (!isNaN(pr.cmrPrice)) $("precioOU").value = pr.cmrPrice;
    if (!isNaN(pr.internetPrice)) { $("precioOferta").value = pr.internetPrice; $("precio").value = pr.internetPrice; }
    if (!isNaN(pr.normalPrice)) { $("precioNormal").value = pr.normalPrice; if (isNaN(pr.internetPrice)) $("precio").value = pr.normalPrice; }
  }
  $("btnSku").addEventListener("click", buscarSku);
  $("link").addEventListener("keydown", (e) => { if (e.key === "Enter") buscarSku(); });

  /* ---------- Toggles ---------- */
  $("showImg").addEventListener("change", () => { $("imgManualWrap").classList.toggle("hidden", !$("showImg").checked); render(); });
  $("showQr").addEventListener("change", () => { $("qrWrap").classList.toggle("hidden", !$("showQr").checked); render(); });
  const FIELDS = ["tipo","tamano","caeOn","evento","ouTmp","sku","marca","categoria","modelo","qrLink","precio","precioNormal","precioOferta","precioOU","nCuotas","cae","valorCuota","ctc","vigDesde","vigHasta","imgZoom","imgX","imgY","showImg","showQr"];
  const CHECKS = new Set(["caeOn","ouTmp","showImg","showQr"]);
  FIELDS.filter((id) => !["showImg","showQr"].includes(id))
    .forEach((id) => { $(id).addEventListener("input", render); $(id).addEventListener("change", render); });

  // estado del formulario (para editar piezas ya grabadas)
  function formState() { const o = { _img: manualImg || null }; FIELDS.forEach((id) => { const el = $(id); if (!el) return; o[id] = CHECKS.has(id) ? el.checked : el.value; }); return o; }
  function setFormState(o) {
    manualImg = o._img || null;
    FIELDS.forEach((id) => { const el = $(id); if (!el || !(id in o)) return; if (CHECKS.has(id)) el.checked = !!o[id]; else el.value = o[id]; });
    $("imgManualWrap").classList.toggle("hidden", !$("showImg").checked);
    $("qrWrap").classList.toggle("hidden", !$("showQr").checked);
    render();
  }
  // carga la pieza en «Cartel», la saca de la hoja para re-grabar modificada
  function editarPieza(it) {
    if (!it.state) return;
    setFormState(it.state);
    const idx = QUEUE.indexOf(it); if (idx >= 0) QUEUE.splice(idx, 1); fbDelete(it);
    goTab("cartel"); renderSheet();
    $("skuHint").textContent = "Editando una pieza de la hoja — modifícala y pulsa «Grabar en la hoja».";
  }
  // limpiar: todo desde 0
  $("btnLimpiar").addEventListener("click", () => {
    if (!confirm("¿Limpiar el cartel y empezar desde 0?")) return;
    ["sku","marca","categoria","modelo","qrLink","precio","precioNormal","precioOferta","precioOU","valorCuota","ctc","vigDesde","vigHasta","link","loteSkus"].forEach((id) => { if ($(id)) $(id).value = ""; });
    $("tipo").value = "normal"; $("nCuotas").value = "12"; $("cae").value = "39,93%";
    $("caeOn").checked = false; $("ouTmp").checked = true;
    if ($("showImg")) $("showImg").checked = true; if ($("showQr")) $("showQr").checked = false;
    manualImg = null; resetImgEditor();
    $("imgManualWrap").classList.add("hidden"); $("qrWrap").classList.add("hidden");
    $("skuHint").textContent = "Detecta el tipo (OU / oferta / normal), rellena todo y reemplaza lo escrito.";
    if ($("loteMsg")) $("loteMsg").textContent = "";
    render();
  });

  /* ====================================================================
     HOJA / IMPOSICIÓN
     ==================================================================== */
  let QUEUE = []; // {sizeKey, url, id?}
  const activeEl = () => { const l = curSize().layout; return l === "h" ? $("cartelH") : l === "telco" ? $("cartelP") : l === "planes" ? $("cartelPL") : $("cartel"); };

  /* ---------- Firebase opcional (Firestore + TTL 24h) ---------- */
  const FB = { ready: false, db: null, fs: null };
  const fbStatus = (t) => {
    const el = $("fbStatus"); if (!el) return;
    let state = "wait", label = "conectando…";
    if (/conectad/i.test(t)) { state = "on"; label = "en línea"; }
    else if (/sin conexi|error/i.test(t)) { state = "off"; label = "sin conexión"; }
    el.classList.remove("on", "off", "wait"); el.classList.add(state);
    el.title = "Nube (Firebase): " + t;
    const tx = el.querySelector(".tx"); if (tx) tx.textContent = label; else el.textContent = label;
  };
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
    const w = el.offsetWidth, h = el.offsetHeight;
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
  $("btnPdf").addEventListener("click", async () => { try {
    const s = curSize(); const el = activeEl(); const c = await snap(el);
    const { jsPDF } = window.jspdf;
    if (s.layout === "planes") {
      // carta completa: la pieza llena la página carta (proporción exacta)
      const pdf = new jsPDF({ unit: "cm", format: "letter", orientation: "portrait" });
      const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
      pdf.addImage(c.toDataURL("image/png"), "PNG", 0, 0, pw, ph); pdf.save(nombre() + ".pdf"); return;
    }
    const asp = el.offsetHeight / el.offsetWidth; const wcm = s.w, hcm = s.w * asp;
    const pdf = new jsPDF({ unit: "cm", format: "letter", orientation: hcm >= wcm ? "portrait" : "landscape" });
    const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
    const topLeft = s.layout === "telco"; const x = topLeft ? 0.3 : (pw - wcm) / 2, y = topLeft ? 0.3 : (ph - hcm) / 2;
    pdf.addImage(c.toDataURL("image/png"), "PNG", x, y, wcm, hcm); pdf.save(nombre() + ".pdf");
  } catch (e) { errExport(); } });

  $("btnGrabar").addEventListener("click", async () => {
    try { const c = await snap(activeEl()); const item = { sizeKey: $("tamano").value, url: c.toDataURL("image/jpeg", 0.9), qty: 1 }; if (curSize().layout !== "telco") item.state = formState(); QUEUE.push(item); flashGrabar(); await fbSave(item); renderSheet(); }
    catch (e) { errExport(); }
  });
  function flashGrabar() { const b = $("btnGrabar"); const o = b.textContent; b.textContent = "✓ Grabado"; setTimeout(() => b.textContent = o, 900); }

  // 10) PNG alto contraste (opción aparte para probar impresión)
  function contrastCanvas(src) {
    const o = document.createElement("canvas"); o.width = src.width; o.height = src.height; const x = o.getContext("2d");
    if ("filter" in x) { x.filter = "contrast(1.28) saturate(1.08) brightness(1.02)"; x.drawImage(src, 0, 0); x.filter = "none"; }
    else x.drawImage(src, 0, 0);
    return o;
  }
  $("btnPngHC").addEventListener("click", async () => { try { const c = contrastCanvas(await snap(activeEl())); const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = nombre() + "-hc.png"; a.click(); } catch (e) { errExport(); } });

  // 9) Lote por SKU: busca, arma y graba cada uno en la hoja
  function mediaLista() {
    const md = $("media"); if (!md || md.classList.contains("hidden")) return Promise.resolve();
    const im = $("mediaImg"); if (!im || !im.src) return Promise.resolve();
    if (im.complete && im.naturalWidth) return Promise.resolve();
    return new Promise((r) => { const done = () => r(); im.addEventListener("load", done, { once: true }); im.addEventListener("error", done, { once: true }); setTimeout(done, 4000); });
  }
  const raf2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  $("btnLote").addEventListener("click", async () => {
    const msg = $("loteMsg"); const b = $("btnLote");
    const skus = [...new Set(($("loteSkus").value.match(/\d{6,}/g) || []))];
    if (!skus.length) { msg.textContent = "No hay SKU válidos (mínimo 6 dígitos)."; return; }
    b.disabled = true; let ok = 0; const fail = [];
    for (let i = 0; i < skus.length; i++) {
      const sku = skus[i]; msg.textContent = "Procesando " + (i + 1) + "/" + skus.length + " — SKU " + sku + "…";
      const res = await fetchProducto(sku);
      if (!res.d) { fail.push(sku); continue; }
      aplicarProducto(res.d, sku); render(); await raf2(); await mediaLista(); await raf2();
      try { const c = await snap(activeEl()); const item = { sizeKey: $("tamano").value, url: c.toDataURL("image/jpeg", 0.9), qty: 1 }; if (curSize().layout !== "telco") item.state = formState(); QUEUE.push(item); await fbSave(item); ok++; }
      catch (e) { fail.push(sku); }
    }
    renderSheet(); b.disabled = false;
    msg.textContent = "Listo: " + ok + " grabado(s)" + (fail.length ? " · fallaron: " + fail.join(", ") : "") + ". Ve a la pestaña «Hoja».";
  });

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

  // divide la lista de copias en páginas de capacidad n
  function paginar(flat, n) { const p = []; for (let i = 0; i < flat.length; i += n) p.push(flat.slice(i, i + n)); return p.length ? p : [[]]; }

  function renderSheet() {
    const s = curSize();
    const items = QUEUE.filter((q) => q.sizeKey === $("tamano").value);
    const m = sheetModel();
    const total = items.reduce((a, it) => a + (it.qty || 1), 0);
    const flat = []; items.forEach((it) => { for (let i = 0; i < (it.qty || 1); i++) flat.push(it); }); // TODAS las copias
    const pgs = paginar(flat, m.n);
    $("sheetInfo").innerHTML =
      '<span class="pill">' + s.label + ' cm</span>' +
      '<span class="pill">' + m.n + ' por hoja (' + m.cols + '×' + m.rows + ')</span>' +
      '<span class="pill">hoja ' + (m.sw > m.sh ? 'horizontal' : 'vertical') + '</span>' +
      '<span class="pill">' + total + ' pieza(s) · ' + pgs.length + ' hoja(s)</span>';

    // cola visual: cada cartel con cantidad, editar y quitar
    const q = $("queue"); q.innerHTML = "";
    if (!items.length) q.innerHTML = '<div class="empty">Aún no grabas piezas de este tamaño. Ve a «Cartel» y pulsa «Grabar en la hoja».</div>';
    items.forEach((it) => {
      const d = document.createElement("div"); d.className = "q";
      const editable = !!it.state;
      d.innerHTML = '<img src="' + it.url + '"/><button class="qx" title="Quitar">×</button>' +
        '<div class="qrow"><label>cant.</label><input type="number" min="1" value="' + (it.qty || 1) + '"/></div>' +
        (editable ? '<button class="qed" title="Editar en Cartel">✎ Editar</button>' : '');
      d.querySelector(".qx").addEventListener("click", () => { const idx = QUEUE.indexOf(it); if (idx >= 0) QUEUE.splice(idx, 1); fbDelete(it); renderSheet(); });
      d.querySelector("input").addEventListener("input", (e) => { it.qty = Math.max(1, parseInt(e.target.value, 10) || 1); fbUpdateQty(it); renderSheet(); });
      if (editable) d.querySelector(".qed").addEventListener("click", () => editarPieza(it));
      q.appendChild(d);
    });

    // preview: una hoja por página
    const wrap = $("sheetWrap"); wrap.innerHTML = "";
    const SP = Math.min(560 / m.sw, 720 / m.sh); // px por cm en preview
    const borde = $("bordeOn").checked, tipo = $("bordeTipo").value;
    pgs.forEach((pg, pi) => {
      if (pgs.length > 1) { const lab = document.createElement("div"); lab.className = "sheet-lbl"; lab.textContent = "Hoja " + (pi + 1) + " / " + pgs.length; wrap.appendChild(lab); }
      const sheet = document.createElement("div"); sheet.className = "sheet";
      sheet.style.width = (m.sw * SP) + "px"; sheet.style.height = (m.sh * SP) + "px";
      const gridW = m.cols * m.cw, gridH = m.rows * m.ch;
      const offX = (m.sw - gridW) / 2, offY = (m.sh - gridH) / 2;
      let k = 0;
      for (let r = 0; r < m.rows; r++) for (let col = 0; col < m.cols; col++) {
        const cell = document.createElement("div");
        cell.className = "cell" + (borde && tipo === "linea" ? " linea" : "");
        cell.style.left = ((offX + col * m.cw) * SP) + "px";
        cell.style.top = ((offY + r * m.ch) * SP) + "px";
        cell.style.width = (m.cw * SP) + "px";
        cell.style.height = (m.ch * SP) + "px";
        if (k < pg.length) { const img = document.createElement("img"); img.src = pg[k].url; cell.appendChild(img); }
        k++;
        sheet.appendChild(cell);
        if (borde && tipo === "marcas") addCropMarks(sheet, (offX + col * m.cw) * SP, (offY + r * m.ch) * SP, m.cw * SP, m.ch * SP);
      }
      wrap.appendChild(sheet);
    });
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

  // Export TODAS las hojas a canvas de alta resolución (150 dpi). Devuelve un array.
  async function exportSheetCanvases() {
    const m = sheetModel();
    const DPI = 150, PPCM = DPI / 2.54;
    const items = QUEUE.filter((q) => q.sizeKey === $("tamano").value);
    if (!items.length) throw new Error("sin piezas");
    const flat = []; items.forEach((it) => { for (let i = 0; i < (it.qty || 1); i++) flat.push(it); });
    const pgs = paginar(flat, m.n);
    // precarga imágenes únicas
    const cache = new Map();
    await Promise.all([...new Set(flat.map((it) => it.url))].map((u) => new Promise((res) => { const im = new Image(); im.onload = () => { cache.set(u, im); res(); }; im.onerror = () => res(); im.src = u; })));
    const borde = $("bordeOn").checked, tipo = $("bordeTipo").value;
    const gridW = m.cols * m.cw, gridH = m.rows * m.ch;
    const offX = (m.sw - gridW) / 2, offY = (m.sh - gridH) / 2;
    return pgs.map((pg) => {
      const cv = document.createElement("canvas");
      cv.width = Math.round(m.sw * PPCM); cv.height = Math.round(m.sh * PPCM);
      const ctx = cv.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
      let k = 0;
      for (let r = 0; r < m.rows; r++) for (let col = 0; col < m.cols; col++) {
        const x = (offX + col * m.cw) * PPCM, y = (offY + r * m.ch) * PPCM, w = m.cw * PPCM, h = m.ch * PPCM;
        if (k < pg.length) {
          const im = cache.get(pg[k].url); if (im) ctx.drawImage(im, x, y, w, h);
          if (borde && tipo === "linea") { ctx.strokeStyle = "#999"; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h); }
          if (borde && tipo === "marcas") cropCanvas(ctx, x, y, w, h);
        }
        k++;
      }
      return cv;
    });
  }
  function cropCanvas(ctx, x, y, w, h) {
    ctx.strokeStyle = "#333"; ctx.lineWidth = 1; const L = 18;
    [[x,y,-1,-1],[x+w,y,1,-1],[x,y+h,-1,1],[x+w,y+h,1,1]].forEach(([px, py, sx, sy]) => {
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + sx * L, py); ctx.moveTo(px, py); ctx.lineTo(px, py + sy * L); ctx.stroke();
    });
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  $("btnSheetPng").addEventListener("click", async () => {
    try {
      const cvs = await exportSheetCanvases(); const base = "hoja-" + curSize().label;
      for (let i = 0; i < cvs.length; i++) {
        const a = document.createElement("a"); a.href = cvs[i].toDataURL("image/png");
        a.download = cvs.length > 1 ? base + "-" + (i + 1) + ".png" : base + ".png"; a.click();
        if (i < cvs.length - 1) await wait(400); // separa descargas para que no las bloquee
      }
    } catch (e) { alert("Graba al menos una pieza de este tamaño."); }
  });
  $("btnSheetPdf").addEventListener("click", async () => {
    try { const m = sheetModel(); const cvs = await exportSheetCanvases(); const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: "cm", format: "letter", orientation: m.sw > m.sh ? "landscape" : "portrait" });
      cvs.forEach((cv, i) => { if (i) pdf.addPage("letter", m.sw > m.sh ? "landscape" : "portrait"); pdf.addImage(cv.toDataURL("image/png"), "PNG", 0, 0, m.sw, m.sh); });
      pdf.save("hoja-" + curSize().label + ".pdf");
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
    if (ev.src) { const edb = document.createElement("button"); edb.textContent = "Editar"; edb.addEventListener("click", () => openBannerEditor(ev.src, (d) => { ev.src = d; save(); renderConfig(); render(); })); ops.appendChild(edb); }
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
  let REAL = false;                          // 7) modo tamaño real
  const PXCM = (function () { const d = document.createElement("div"); d.style.cssText = "width:10cm;position:absolute;left:-9999px;top:-9999px"; document.body.appendChild(d); const px = d.offsetWidth / 10; d.remove(); return px || 37.8; })();
  function fitStage() {
    const onHoja = !$("sheetWrap").classList.contains("hidden");
    if (onHoja) return;
    const s = $("stageScale"); const el = activeEl();
    const w = parseFloat(el.style.width) || 750, h = parseFloat(el.style.height) || 1000;
    if (REAL) { const sc = (curSize().w * PXCM) / w; s.style.transform = "scale(" + sc + ")"; s.style.height = (h * sc) + "px"; return; }
    const availW = s.parentElement.clientWidth;
    const sc = Math.min(availW / w, 760 / h); // encaja en el panel
    s.style.transform = "scale(" + sc + ")"; s.style.height = (h * sc) + "px";
  }
  window.addEventListener("resize", fitStage);
  $("btnReal").addEventListener("click", () => { REAL = !REAL; const b = $("btnReal"); b.classList.toggle("active", REAL); b.textContent = REAL ? "📐 Ajustar a panel" : "📐 Tamaño real"; fitStage(); });

  /* ---------- Editor de banners ---------- */
  let ED = null;
  function edLoad(src) { return new Promise((res, rej) => { const im = new Image(); im.crossOrigin = "anonymous"; im.onload = () => res(im); im.onerror = rej; im.src = src; }); }
  async function openBannerEditor(src, onSave) {
    let im; try { im = await edLoad(src); } catch (e) { alert("No se pudo abrir la imagen."); return; }
    const w = im.naturalWidth || im.width, h = im.naturalHeight || im.height;
    const work = document.createElement("canvas"); work.width = w; work.height = h;
    work.getContext("2d").drawImage(im, 0, 0);
    ED = { orig: src, work, onSave, cropping: false, drag: null };
    edPaint(); $("bnEditor").classList.remove("hidden");
  }
  function edClose() { ED = null; $("bnEditor").classList.add("hidden"); $("edStage").classList.remove("cropping"); $("edCropStart").classList.remove("active"); $("edCropBox").classList.add("hidden"); }
  function edPaint() { const c = $("edCanvas"); c.width = ED.work.width; c.height = ED.work.height; const x = c.getContext("2d"); x.clearRect(0, 0, c.width, c.height); x.drawImage(ED.work, 0, 0); $("edCropBox").classList.add("hidden"); }
  function edSet(cv) { ED.work = cv; edPaint(); }
  function edTrim() {
    if (!ED) return; const w = ED.work.width, h = ED.work.height; const ctx = ED.work.getContext("2d", { willReadFrequently: true });
    const d = ctx.getImageData(0, 0, w, h).data; const br = d[0], bgc = d[1], bb = d[2], ba = d[3]; const tol = 28;
    let x0 = w, y0 = h, x1 = 0, y1 = 0, found = false;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; const a = d[i + 3]; let keep;
      if (a < 12) keep = false;
      else if (ba > 200 && a > 200 && Math.abs(d[i] - br) < tol && Math.abs(d[i + 1] - bgc) < tol && Math.abs(d[i + 2] - bb) < tol) keep = false;
      else keep = true;
      if (keep) { found = true; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
    if (!found) return; const nw = x1 - x0 + 1, nh = y1 - y0 + 1;
    const c = document.createElement("canvas"); c.width = nw; c.height = nh; c.getContext("2d").drawImage(ED.work, x0, y0, nw, nh, 0, 0, nw, nh); edSet(c);
  }
  function edRotate() { if (!ED) return; const w = ED.work.width, h = ED.work.height; const c = document.createElement("canvas"); c.width = h; c.height = w; const x = c.getContext("2d"); x.translate(h / 2, w / 2); x.rotate(Math.PI / 2); x.drawImage(ED.work, -w / 2, -h / 2); edSet(c); }
  function edFlip() { if (!ED) return; const w = ED.work.width, h = ED.work.height; const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); x.translate(w, 0); x.scale(-1, 1); x.drawImage(ED.work, 0, 0); edSet(c); }
  function edRemoveBg() {
    if (!ED) return; const tol = +$("edTol").value; const w = ED.work.width, h = ED.work.height; const ctx = ED.work.getContext("2d", { willReadFrequently: true });
    const img = ctx.getImageData(0, 0, w, h); const d = img.data;
    const cs = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + (w - 1)) * 4]; let rr = 0, gg = 0, bb = 0; cs.forEach((i) => { rr += d[i]; gg += d[i + 1]; bb += d[i + 2]; }); rr /= 4; gg /= 4; bb /= 4;
    for (let i = 0; i < d.length; i += 4) { const dist = Math.sqrt((d[i] - rr) ** 2 + (d[i + 1] - gg) ** 2 + (d[i + 2] - bb) ** 2); if (dist <= tol) d[i + 3] = 0; }
    ctx.putImageData(img, 0, 0); edPaint();
  }
  function edFillBg(color) { if (!ED) return; const w = ED.work.width, h = ED.work.height; const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); if (color && color !== "transparent") { x.fillStyle = color; x.fillRect(0, 0, w, h); } x.drawImage(ED.work, 0, 0); edSet(c); }
  function edToggleCrop() { if (!ED) return; ED.cropping = !ED.cropping; ED.drag = null; $("edStage").classList.toggle("cropping", ED.cropping); $("edCropStart").classList.toggle("active", ED.cropping); $("edCropBox").classList.add("hidden"); }
  (function wireEditor() {
    $("edTrim").addEventListener("click", edTrim);
    $("edRot").addEventListener("click", edRotate);
    $("edFlip").addEventListener("click", edFlip);
    $("edRmBg").addEventListener("click", edRemoveBg);
    $("edTol").addEventListener("input", () => { $("edTolV").textContent = $("edTol").value; });
    $("edCropStart").addEventListener("click", edToggleCrop);
    $("edReset").addEventListener("click", async () => { if (ED) { const im = await edLoad(ED.orig); const c = document.createElement("canvas"); c.width = im.naturalWidth || im.width; c.height = im.naturalHeight || im.height; c.getContext("2d").drawImage(im, 0, 0); edSet(c); } });
    $("edSave").addEventListener("click", () => { if (ED) { const cb = ED.onSave; const url = ED.work.toDataURL("image/png"); edClose(); cb(url); } });
    $("edCancel").addEventListener("click", edClose);
    $("bnEditor").addEventListener("click", (e) => { if (e.target === $("bnEditor")) edClose(); });
    document.querySelectorAll("#bnEditor .sw").forEach((b) => b.addEventListener("click", () => edFillBg(b.getAttribute("data-bg"))));
    $("edBgPick").addEventListener("input", () => edFillBg($("edBgPick").value));
    const stage = $("edStage");
    stage.addEventListener("pointerdown", (e) => { if (!ED || !ED.cropping) return; const r = $("edCanvas").getBoundingClientRect(); ED.drag = { x: e.clientX, y: e.clientY, r }; e.preventDefault(); });
    window.addEventListener("pointermove", (e) => { if (!ED || !ED.drag) return; const sr = $("edStage").getBoundingClientRect(); const box = $("edCropBox"); const x0 = Math.min(ED.drag.x, e.clientX), y0 = Math.min(ED.drag.y, e.clientY), x1 = Math.max(ED.drag.x, e.clientX), y1 = Math.max(ED.drag.y, e.clientY); box.style.left = (x0 - sr.left) + "px"; box.style.top = (y0 - sr.top) + "px"; box.style.width = (x1 - x0) + "px"; box.style.height = (y1 - y0) + "px"; box.classList.remove("hidden"); });
    window.addEventListener("pointerup", (e) => {
      if (!ED || !ED.drag) return; const d = ED.drag; ED.drag = null; const cv = $("edCanvas"); const r = d.r; const sx = cv.width / r.width, sy = cv.height / r.height;
      let x0 = Math.max(r.left, Math.min(d.x, e.clientX)), y0 = Math.max(r.top, Math.min(d.y, e.clientY)), x1 = Math.min(r.right, Math.max(d.x, e.clientX)), y1 = Math.min(r.bottom, Math.max(d.y, e.clientY));
      const cx = Math.round((x0 - r.left) * sx), cy = Math.round((y0 - r.top) * sy), cw = Math.round((x1 - x0) * sx), ch = Math.round((y1 - y0) * sy);
      if (cw > 4 && ch > 4) { const c = document.createElement("canvas"); c.width = cw; c.height = ch; c.getContext("2d").drawImage(ED.work, cx, cy, cw, ch, 0, 0, cw, ch); edSet(c); }
      ED.cropping = false; stage.classList.remove("cropping"); $("edCropStart").classList.remove("active");
    });
  })();
  window.openBannerEditor = openBannerEditor;

  /* ---------- Tema claro / oscuro ---------- */
  function applyThemeIcon() { const d = document.documentElement.getAttribute("data-theme") === "dark"; const b = $("themeBtn"); if (b) b.textContent = d ? "☀️" : "🌙"; }
  (function wireTheme() {
    applyThemeIcon();
    const b = $("themeBtn"); if (!b) return;
    b.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("cartel-theme", next); } catch (e) {}
      applyThemeIcon();
    });
  })();

  /* ---------- PWA offline (service worker) ---------- */
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  /* ---------- Init ---------- */
  function wirePlanes() {
    const box = $("fsPlanes"); if (!box) return;
    box.querySelectorAll("input,select,textarea").forEach((el) => { el.addEventListener("input", render); el.addEventListener("change", render); });
  }
  buildTelcoForm(); wirePlanes(); renderConfig(); render(); fitStage(); fbInit();
})();
