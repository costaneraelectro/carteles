# Generador de Carteles · Falabella Costanera Center

App web estática para crear la cartelería de tienda manteniendo la tipografía y
el estilo de nuestros carteles. Se ejecuta directo en el navegador — sin build,
sin servidor — y funciona en GitHub Pages.

## Qué hace

- **Tipografía** — usa **Brandon Grotesque** (la misma de los carteles). Ver
  [Fuentes](#fuentes).
- **Detecta el tipo de evento** — eliges CyberDay / Sneaker Corner / Exclusivo
  falabella.com y agrega la franja superior. Si eliges *Ninguno*, no hay banner.
- **Detecta oferta** — si el *precio normal* es mayor que el *precio*, el cartel
  cambia solo a **PRECIO OFERTA** (fondo rojo, precio normal tachado, "TODO MEDIO
  DE PAGO" y vigencia). Si no, queda como **PRECIO NORMAL**.
- **Oportunidad única CMR** — activa el sello rojo con el logo CMR puntos y la
  condición del plan (ej. "$0 contratando plan Claro").
- **Imagen del producto** — se sube y se centra en el cartel.
- **Electro** — al elegir departamento *Electro* aparecen y se muestran las
  **cuotas**, el **CAE / CTC** y los sellos de garantía. El valor de la cuota se
  calcula solo si lo dejas vacío (precio ÷ n° cuotas).
- **Exporta** — botón **PNG** (imagen lista para publicar/imprimir) y **PDF**
  tamaño carta vertical para impresión.

## Uso

Abre `index.html` en el navegador (o publica el repo en GitHub Pages y entra a la
URL). Completa el formulario de la izquierda; el cartel de la derecha se arma en
vivo. Al final, **Descargar PNG** o **Descargar PDF**.

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
