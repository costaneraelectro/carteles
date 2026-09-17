# Generador de Carteles · Falabella Costanera Center

App web estática para crear la cartelería de tienda manteniendo la tipografía y
el estilo de nuestros carteles. Se ejecuta directo en el navegador — sin build,
sin servidor — y funciona en GitHub Pages.

## Qué hace

Reproduce la estructura exacta de la cartelería de tienda:

- **Tipografía** — **Brandon Grotesque** (la misma de los carteles).
- **3 tipos de cartel**:
  - **Precio normal** — un precio + PRECIO NORMAL.
  - **Oferta todo medio de pago** — "OFERTA TODO MEDIO DE PAGO" (rojo, grande) y
    abajo el precio normal. Si es electro y el precio supera **$100.000**, agrega
    cuotas + CAE/CTC.
  - **CMR · Oportunidad única** — sello Oportunidad única + CMR, precio CMR
    (rojo), cuotas + CAE/CTC, otro medio de pago (opcional) y precio normal.
- **Imagen por SKU** — al escribir el SKU baja la foto de
  `https://media.falabella.com/falabellaCL/{sku}/public` (con opción de subir una
  manual si el SKU no la trae). El QR es opcional.
- **CAE / cuotas automáticos** — para 12 cuotas @ 39,93% calcula el valor cuota
  (≈ precio × 0,101296) y el CTC (≈ precio × 1,22347), derivados de los carteles
  reales. Ambos quedan **editables** por si el CAE cambia.
- **Header y footer legal** — "TENEMOS MÁS DE LO QUE PODEMOS MOSTRAR ONLINE",
  vigencia, texto CMF, logo CMR puntos y código de página.
- **Exporta** — **PNG** y **PDF** tamaño carta vertical.

## Pestaña Configuración

- Sube / edita / borra los **banners de evento** que aparecen en el selector
  (Exclusivo falabella.com, CyberDay, Sneaker Corner, o los que agregues).
- Sube los **sellos y logos** (Oportunidad única + CMR, logo CMR puntos del pie).
  Mientras no subas el sello CMR, se muestra un marcador de posición.
- Edita el **texto del header** y el **legal del pie**.
- Todo se guarda en el navegador (localStorage). "Restaurar" vuelve a los valores
  por defecto.

> Los logos oficiales (Oportunidad única, CMR, Fpuntos, CyberDay) no vienen en el
> repo — súbelos una vez desde la pestaña Configuración.

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
