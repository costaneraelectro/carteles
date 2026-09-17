# Generador de Carteles · Falabella Costanera Center

App web estática para crear la cartelería de tienda manteniendo la tipografía y
el estilo de nuestros carteles. Se ejecuta directo en el navegador — sin build,
sin servidor — y funciona en GitHub Pages.

## Qué hace

Reproduce la estructura exacta de la cartelería de tienda:

- **Tipografía** — **Brandon Grotesque** (la misma de los carteles).
- **6 tipos** (filtro): Normal electro CAE · Normal electro SIN CAE · Oferta CAE ·
  Oferta SIN CAE · Oportunidad única CAE · Oportunidad única SIN CAE.
  - **Oferta** — "TODO MEDIO DE PAGO" (rojo) y debajo "PRECIO NORMAL".
  - **Oportunidad única** — sello + precio OU, **Oferta TMP (se puede desactivar)**
    y precio normal, los tres del mismo tamaño.
  - Las variantes **CAE** agregan cuotas + CAE/CTC.
- **Buscar por SKU** — botón *Buscar* lee Falabella.com (vía proxy CORS) y rellena
  marca y precios (oferta / normal / CMR). **Confirma siempre**, pueden variar.
- **Imagen por SKU** — `media.falabella.com/falabellaCL/{sku}/public`, con upload
  manual de respaldo. Sin imagen, el contenido va **centrado**.
- **QR** — pega el link de Falabella.com y genera el QR en la esquina.
- **CAE / cuotas automáticos** — 12 cuotas @ 39,93%: cuota ≈ precio × 0,101296,
  CTC ≈ precio × 1,22347 (de los carteles reales). Editables.
- **Datos en el cartel** — MARCA, CATEGORÍA, `MODELO:` (si va) y `SKU:`.
- **Pie** — vigencia, legal y logo **Fpuntos**.
- **Exporta** — **PNG** y **PDF** carta vertical.

## Pestaña Configuración

- **Banners** — sube / edita / borra. Casilla *franja* = ancho completo; sin
  marcar = header (arriba-izquierda, como "Tenemos más online", el por defecto).
  El banner va sobre fondo blanco igual que el cartel.
- **Sellos y logos** — sube el sello *Oportunidad única + CMR*, la *mini tarjeta
  CMR* (junto a las cuotas) y el logo *Fpuntos* del pie. Mientras no subas el
  sello, sale un marcador de posición.
- **Proxy CORS** para la búsqueda por SKU (por defecto allorigins; editable).
- **Legal** del pie editable. "Restaurar" vuelve a los valores por defecto.
- Todo se guarda en el navegador (localStorage).

> El sello oficial *Oportunidad única + CMR* y la *mini tarjeta CMR* no vienen en
> el repo — súbelos una vez desde Configuración.

## Uso

Abre `index.html` (o publica en GitHub Pages). Elige el tipo, completa los datos;
el cartel se arma en vivo. **Descargar PNG** o **Descargar PDF**.

## Fuentes

Brandon Grotesque es de pago, así que no viene en el repo. Sube los archivos a
`fonts/` con estos nombres exactos:

```
fonts/BrandonGrotesque-Bold.otf      (o .ttf / .woff2)
fonts/BrandonGrotesque-Regular.otf   (o .ttf / .woff2)
fonts/BrandonGrotesque-Black.otf     (opcional — precios grandes)
```

Si falta el archivo, cae automáticamente a **Montserrat** (Google Fonts), la
alternativa gratuita más parecida. La configuración está en `fonts/fonts.css`.

## Estructura

```
index.html          Formulario + cartel (preview)
css/styles.css      Estilos del cartel y de la app
js/app.js           Detección automática, formateo de precios y exportación
fonts/              Brandon Grotesque (subir) + fonts.css
assets/banners/     Banners de evento (exclusivo falabella, sneaker corner…)
assets/logos/       CMR puntos
```

## Publicar en GitHub Pages

Settings → Pages → Deploy from branch → `main` / root. Queda en
`https://costaneraelectro.github.io/carteles/`.
