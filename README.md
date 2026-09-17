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

## Tamaños e impresión de varias piezas por hoja

Además de **Carta** (la única con imagen), arma tamaños chicos de tienda:
**9×13, 9×7, 6×4** (mismo layout, sin imagen) y **12×3** (layout horizontal).

Flujo para imprimir varias en una hoja carta:

1. En **Cartel**, elige el tamaño, arma el cartel y pulsa **＋ Grabar en la hoja**.
   Repite para el mismo cartel (repetir) o para varios distintos (mezcla).
2. Ve a la pestaña **Hoja**. Calcula solo cuántas piezas caben por hoja carta y
   las acomoda en la grilla (rotando la pieza si así caben más). Ejemplos:
   6×4 → 20, 12×3 → 14, 9×7 → 9, 9×13 → 4.
3. Marca **Agregar borde** y elige **Línea de corte** o **Marcas de corte**.
4. **Descargar hoja PNG / PDF** (carta, 150 dpi).

La cola de piezas es por tamaño. Vive en memoria de la sesión, salvo que actives
Firebase (abajo), donde se guarda online y se borra sola a las 24 h.

## Almacenamiento online (Firebase) — opcional

Guarda las piezas grabadas en la nube y las **borra solas a las 24 h** con el TTL
de Firestore. Pasos (una vez):

1. Crea un proyecto en <https://console.firebase.google.com> y una app **Web**.
2. Activa **Firestore Database** (modo producción).
3. En **Configuración → Configuración de la app** copia el objeto `firebaseConfig`
   (apiKey, projectId, appId, …) y pégalo en la app: pestaña **Configuración →
   Almacenamiento online (Firebase)**. El estado debe pasar a "conectado".
4. **TTL (borrado a 24 h):** Firestore → *Time-to-live* → crea una política sobre
   la colección `piezas`, campo `expireAt`. Firestore borra los documentos
   vencidos (best-effort, dentro de ~24–72 h del vencimiento).
5. **Reglas** (uso interno). Ejemplo mínimo:
   ```
   match /databases/{db}/documents {
     match /piezas/{id} { allow read, write: if true; }
   }
   ```
   > `if true` deja la colección abierta a cualquiera con la config. Sirve para uso
   > interno de tienda; si necesitas cerrarla, agrega Firebase Auth / App Check.

Cada pieza se guarda como JPEG (para caber en el límite de 1 MB por documento) con
`expireAt = ahora + 24 h`. Al abrir la app se recargan las piezas no vencidas.

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
