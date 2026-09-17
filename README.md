# Generador de Carteles · Falabella Costanera Center

App web estática para crear la cartelería de tienda manteniendo la tipografía y
el estilo de nuestros carteles. Se ejecuta directo en el navegador — sin build,
sin servidor — y funciona en GitHub Pages.

## Qué hace

Reproduce la estructura exacta de la cartelería de tienda:

- **Tipografía** — **Brandon Grotesque** (la misma de los carteles).
- **3 tipos** — Precio normal · Oferta · Oportunidad única. Casilla **Con cuotas /
  CAE** (solo en Carta y 13×19) agrega cuotas + CAE/CTC.
  - **Oferta** — "TODO MEDIO DE PAGO" (rojo) y debajo "PRECIO NORMAL".
  - **Oportunidad única** — sello + precio OU, **Oferta TMP (se puede desactivar)**
    y precio normal (iguales en Carta/13×19; el principal más grande en chicos).
- **Buscar por SKU** — botón *Buscar* (o pega el link del producto) trae marca y
  precios (oferta / normal / CMR) desde la API pública de falabella.com
  (`browse/v3/product`, vía proxy CORS con reintentos). **Confirma siempre**.
- **Imagen por SKU** — `media.falabella.com/falabellaCL/{sku}/public`, con upload
  manual de respaldo (solo Carta). Sin imagen, el contenido va **centrado**.
- **QR** — pega un link (Falabella.com u otro) y genera el QR en la esquina
  (solo Carta, 13×19 y 9×7).
- **CAE / cuotas automáticos** — 12 cuotas @ 39,93%: cuota ≈ precio × 0,101296,
  CTC ≈ precio × 1,22347 (de los carteles reales). Editables.
- **Datos en el cartel** — MARCA, CATEGORÍA, `MODELO:` (si va) y `SKU:`.
- **Pie** — vigencia, legal y logo **Fpuntos**.
- **Exporta** — **PNG** y **PDF** carta vertical.

## Tamaños e impresión de varias piezas por hoja

Tamaños: **Carta** (con imagen, banner/QR, CAE), **13×19** (banner/QR, CAE, sin
imagen), **9×7** (banner/QR), **9×13** y **6×4** (solo precios) y **12×3**
(horizontal). Solo Carta y 13×19 llevan CAE; solo Carta, 13×19 y 9×7 llevan
banner/QR.

Flujo para imprimir varias en una hoja carta:

1. En **Cartel**, elige el tamaño, arma el cartel y pulsa **＋ Grabar en la hoja**.
   Repite para el mismo cartel (repetir) o para varios distintos (mezcla).
2. Ve a la pestaña **Hoja**. Calcula solo cuántas piezas caben por hoja carta y
   las acomoda en la grilla (rotando la pieza si así caben más). Ejemplos:
   6×4 → 20, 12×3 → 14, 9×7 → 9, 9×13 → 4.
3. Marca **Agregar borde** y elige **Línea de corte** o **Marcas de corte**.
4. **Descargar hoja PNG / PDF** (carta, 150 dpi).

Al grabar se agrega **1 copia** a la hoja; en la pestaña Hoja ajustas la
**cantidad** de cada pieza y la hoja se llena hasta el tope de la grilla.

## Almacenamiento online (Firebase)

Las piezas grabadas se guardan en la nube (Firestore, proyecto `carteles-electro`,
ya configurado en el código) y se **borran solas a las 24 h**. Al abrir la app se
recargan las piezas no vencidas — sirven entre computadores del mismo proyecto.

Para que funcione, en la consola de Firebase:

1. **Reglas** (Firestore → Reglas → Publicar):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /piezas/{id} { allow read, write: if true; }
     }
   }
   ```
   > `if true` deja la colección abierta. Uso interno de tienda; si necesitas
   > cerrarla, agrega Firebase Auth / App Check.
2. **TTL (borrado a 24 h):** Firestore → *Time-to-live* → política sobre la
   colección `piezas`, campo `expireAt` (borra best-effort, ~24–72 h del vencimiento).

Cada pieza se guarda como JPEG (para caber en el límite de 1 MB por documento) con
`expireAt = ahora + 24 h`.

## Pestaña Configuración

- **Banners** — sube / edita / borra. Casilla *franja* = ancho completo; sin
  marcar = header (arriba-izquierda, como "Tenemos más online", el por defecto).
  Cada banner muestra la **medida recomendada** para subir (para diseñar en Canva):
  franja ~1200×260 px, header ~1000×110 px (PNG con fondo transparente).
- **Sellos y logos** — sube el sello *Oportunidad única + CMR* y el logo *Fpuntos*
  del pie. Mientras no subas el sello, sale un marcador de posición.
- **Legal** del pie editable. "Restaurar" vuelve a los valores por defecto.
- Todo se guarda en el navegador (localStorage).

> El sello oficial *Oportunidad única + CMR* no viene en el repo — súbelo una vez
> desde Configuración.

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
