# Del asfalto al dato · La Ruta del Triciclo

Sitio web de divulgación + juego + panel de alcance para el proyecto **Mercado de Triciclos Eléctricos de La Habana**, de **Laura Díaz Sánchez** (Ciencia de Datos, Facultad de Matemática y Computación, Universidad de La Habana).

La historia del proyecto se convierte en un recorrido de cinco actos. Cada acto se juega con decisiones basadas en los datos reales de la investigación. Al final hay una insignia, reacciones y un panel privado con estadísticas de alcance.

## Qué incluye

- **Historia interactiva** (`/`): prólogo, cinco actos, gráficos hechos con los datos del proyecto, galería de gráficos originales, lecciones y muro de reacciones.
- **Juego** (`/juego`): simulación + trivia. Cinco retos, 100 puntos, niveles, confeti y reacciones.
- **QR** (`/qr-card`): tarjeta lista para imprimir o compartir. El QR pasa por `/qr`, registra el escaneo y lleva al juego.
- **Panel de la autora** (`/panel`): acceso sin contraseña con los dos correos autorizados. Mide personas únicas, visitas, escaneos QR, partidas, finalización, nota media, me gusta/no me gusta, comentarios, fuentes, dispositivos, horas, embudo, permanencia, descargas y compartidos. Incluye exportación CSV y borrado de comentarios.
- **Analítica propia** en SQLite, sin servicios externos ni cookies de terceros.

## Ejecutar en local

Desde esta carpeta:

```bash
python3 servidor.py
```

O:

```bash
./iniciar.sh
```

El servidor imprime las direcciones. Por defecto:

- Sitio: `http://127.0.0.1:8000`
- Red local: `http://TU_IP:8000`
- Juego: `http://TU_IP:8000/juego`
- Panel: `http://TU_IP:8000/panel`
- Tarjeta QR: `http://TU_IP:8000/qr-card`

Abre la dirección en Chrome. Si estás en el mismo móvil, `127.0.0.1` funciona. Si el servidor corre en otro equipo, usa la IP de red que aparece al arrancar.

Requiere Python 3.10 o superior. El QR usa `qrcode` (ya instalado en este entorno); si falta:

```bash
pip install qrcode
```

Sin `qrcode`, el resto del sitio funciona pero el QR muestra un aviso.

## Primer acceso al panel

1. Abre `/panel`.
2. La primera vez te pedirá **configurar tus dos correos** y un **código de configuración**. Ese código aparece en la terminal donde corre el servidor y en `datos/setup_token.txt`. Sirve para que nadie pueda reclamar el panel aunque el enlace sea público. Hazlo **antes de compartir** el sitio.
3. Después entras escribiendo cualquiera de esos correos, **sin contraseña**.
4. En **Ajustes** puedes cambiar los correos, tu nombre y la URL pública.

El acceso es una lista de correos autorizados, pensada para una sola persona. No es un sistema de autenticación fuerte: quien conozca uno de esos correos podría entrar. Para una entrega académica es suficiente; para un sitio público real conviene añadir un código o un enlace mágico por email.

Si pierdes el código de configuración, detén el servidor, borra la clave `setup_token` de `config.json` y vuelve a arrancar: se generará uno nuevo.

## Vista previa con datos de demostración

El panel incluye datos de ejemplo para que veas cómo quedan las gráficas antes de publicar. Para generarlos de nuevo:

```bash
python3 sembrar_demo.py
```

Para borrarlos y empezar a medir en serio:

- Entra al panel → **Reiniciar estadísticas (borrar datos)**, o
- Elimina `datos/analiticas.db` con el servidor detenido.

## Cómo se mide el alcance

Cada página carga `js/analitica.js`, que registra de forma anónima:

- visita de página, persona única (identificador local), sesión y dispositivo;
- origen: QR, directo, navegación interna, redes o referido;
- profundidad de scroll y tiempo de permanencia;
- clic en “jugar”, actos vistos/completados, partida terminada y puntuación;
- reacciones (me gusta / no me gusta), comentarios y compartidos;
- copias del enlace.

La IP no se guarda en bruto: se guarda un hash con sal. No se usan cookies de terceros ni píxeles externos. El panel de la autora no carga el script de analítica, así que tus propias visitas no contaminan las métricas.

Exporta todo con **Exportar CSV** desde el panel.

## Cambiar el enlace público y el QR

El QR se genera en `/qr.svg` con la URL efectiva:

1. Si `url_publica` está configurada, usa esa URL.
2. Si no, usa la IP de red local.
3. Si abres el sitio desde `localhost`, sustituye `localhost` por la IP de red para que el QR sea escaneable desde otros dispositivos.

Puedes configurarla desde **Panel → Ajustes → URL pública**, o en `config.json`:

```json
{
  "sitio": {
    "url_publica": "https://tu-dominio.com"
  }
}
```

Después de cambiarla, recarga `/qr-card` y vuelve a imprimir la tarjeta.

## Publicar en internet

### Opción rápida: túnel desde tu equipo

La analítica se queda en tu SQLite local. Con Cloudflare Tunnel:

```bash
cloudflared tunnel --url http://localhost:8000
```

Copia la URL pública que te da y pégala en **Panel → Ajustes → URL pública**. El QR y los enlaces usarán esa dirección mientras el túnel y el servidor estén activos.

### Opción con hosting

Comando de arranque para Railway, Render o un VPS:

```bash
python3 servidor.py --host 0.0.0.0 --puerto $PORT
```

Variables de entorno opcionales:

- `PORT`: puerto del servicio.
- `URL_PUBLICA`: URL pública, por ejemplo `https://mi-sitio.com`.
- `PROPIETARIA_EMAILS`: correos separados por coma.

Para que la base de datos sobreviva a reinicios, monta un volumen persistente en `/app/datos` (y, si quieres conservar los ajustes, también en `/app/config.json`). En planes gratuitos sin disco persistente, SQLite se reinicia con cada despliegue.

Con Docker:

```bash
docker build -t del-asfalto .
docker run -p 8000:8000 -v "$PWD/datos:/app/datos" del-asfalto
```

### PythonAnywhere

Este proyecto usa un servidor HTTP propio (`http.server`), no una app WSGI, así que no se puede pegar directamente en PythonAnywhere. Usa un túnel o un hosting que permita ejecutar un proceso Python.

## Estructura

```
sitio_divulgacion/
├── servidor.py              # servidor + API + SQLite + QR + login
├── config.json              # correos, nombre, URL pública
├── sembrar_demo.py          # datos de demostración para el panel
├── iniciar.sh / detener.sh
├── Dockerfile / Procfile
├── datos/
│   └── analiticas.db        # se crea al arrancar (no se sirve por HTTP)
└── public/
    ├── index.html           # historia + datos + reacciones
    ├── juego.html           # juego
    ├── panel.html           # panel privado
    ├── qr.html              # tarjeta imprimible
    ├── css/                 # identidad visual
    ├── js/                  # analítica, historia, juego, panel, QR
    └── assets/              # gráficos, logo y triciclo
```

## Datos del proyecto

- 20 registros: 12 anuncios web + 8 entrevistas.
- 8 municipios.
- Precio promedio: 3,941 USD; rango: 3,000–5,200 USD.
- 75% de uso para carga (15 de 20).
- 10 de Octubre concentra el 25% de los registros.
- KVITOVA + JINPENG: 58% de los anuncios web.
- 1 de 12 anuncios web incluye panel solar (8.3%).
- Ocho barreras distintas en las ocho entrevistas.

Muestra limitada: los resultados son una aproximación al mercado, no un censo.

## Créditos

Laura Díaz Sánchez · Ciencia de Datos · Facultad de Matemática y Computación · Universidad de La Habana · 2026.
