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

**Carta gráfica planes** (21,6×27,9 cm) — póster de planes de telefonía: héroe
(imagen + precio único + precio normal + descuento auto + SKU + unidades) y **3
operadores fijos** (Claro / Entel / WOM) con precio, cargo fijo/mes y GB. Opcional:
cinta *Lanzamiento*, cuotas CMR, y especificaciones sobre la imagen. Claro lleva
roaming editable; Entel iconos de redes; WOM texto. Los logos **CONNECT**,
**bandas 2G-5G** e **iconos redes Entel** ya vienen cargados (reemplazables en
Configuración → avanzado).

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
**cantidad** de cada pieza. Si las piezas no caben en una sola hoja, se generan
**varias hojas** automáticamente (se ven todas en la vista previa y se descargan
todas: PDF multipágina, o un PNG por hoja).

Cada pieza grabada muestra su miniatura en la pestaña Hoja con **✎ Editar** (la
vuelve a cargar en «Cartel» para modificarla) y **×** para quitarla. En «Cartel»,
**🧹 Limpiar** vacía el formulario para empezar de cero.

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
  - **Editor de banners** — botón *Editar* en cada banner. Abre un editor con
    **recortar** (arrastra el recuadro), **auto-recortar** (quita el borde en
    blanco), **rotar**, **espejar**, **quitar fondo** (con tolerancia, por color
    de las esquinas) y **poner fondo** (transparente o color). *Guardar* deja la
    imagen editada; *Deshacer todo* vuelve al original.
- **Sellos y logos (avanzado)** — ya vienen cargados por defecto (sello
  *Oportunidad única + CMR* y logo *Fpuntos*). Sección **oculta**; ábrela solo si
  necesitas reemplazarlos.
- **Legal** del pie editable. "Restaurar" vuelve a los valores por defecto.
- Todo se guarda en el navegador (localStorage).

> El sello oficial *Oportunidad única + CMR* no viene en el repo — súbelo una vez
> desde Configuración.

## Uso

Abre `index.html` (o publica en GitHub Pages). Elige el tipo, completa los datos;
el cartel se arma en vivo. **Descargar PNG** o **Descargar PDF**.

Botón **🌙 / ☀️** arriba a la derecha: alterna **modo claro / oscuro** (se recuerda
en el navegador; el cartel siempre se exporta con fondo blanco para imprimir). En
el pie del panel, el indicador **en línea** muestra el estado de la nube (Firebase).

Extras:

- **Validación de precio** — avisa si el precio de oferta/OU no es menor al normal
  (no hay descuento).
- **📐 Tamaño real** — muestra el cartel a su medida física en cm (según la
  pantalla) para verificar antes de imprimir; vuelve a ajustar al panel con el
  mismo botón.
- **PNG alto contraste** — descarga aparte, con más contraste, para probar cómo
  imprime.
- **Lote por SKU** — pega varios SKU (uno por línea, coma o espacio); busca cada
  uno, arma el cartel del tamaño actual y lo graba en la hoja.
- **Offline (PWA)** — un *service worker* (`sw.js`) cachea el marco de la app y las
  librerías locales; funciona sin conexión e instalable como app. Solo la búsqueda
  de SKU y la nube necesitan internet.

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
