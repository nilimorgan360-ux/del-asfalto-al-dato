#!/usr/bin/env python3
import argparse
import csv
import hashlib
import io
import json
import mimetypes
import os
import re
import secrets
import socket
import sqlite3
import sys
from datetime import datetime, timedelta
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs, quote

BASE = Path(__file__).resolve().parent
PUBLIC = BASE / "public"
DATA = BASE / "datos"
CONFIG_PATH = BASE / "config.json"
DB_PATH = DATA / "analiticas.db"

DATA.mkdir(parents=True, exist_ok=True)

DEFAULT_CONFIG = {
    "sitio": {
        "titulo": "Del asfalto al dato",
        "subtitulo": "La Ruta del Triciclo",
        "autora": "Laura Díaz Sánchez",
        "institucion": "Ciencia de Datos · Facultad de Matemática y Computación · Universidad de La Habana",
        "url_publica": "",
        "puerto": 8000,
    },
    "propietaria": {"nombre": "Laura Díaz Sánchez", "emails": []},
    "analitica": {"sal": "del-asfalto-al-dato-2026"},
}

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MIME_EXTRA = {
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".webmanifest": "application/manifest+json",
    ".json": "application/json; charset=utf-8",
}


def cargar_config():
    cfg = json.loads(json.dumps(DEFAULT_CONFIG))
    if CONFIG_PATH.exists():
        try:
            guardado = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
            for seccion, valores in guardado.items():
                if isinstance(valores, dict):
                    cfg.setdefault(seccion, {}).update(valores)
                else:
                    cfg[seccion] = valores
        except Exception:
            pass
    return cfg


def guardar_config(cfg):
    CONFIG_PATH.write_text(
        json.dumps(cfg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


CONFIG = cargar_config()


def aplicar_entorno(cfg):
    correos = os.environ.get("PROPIETARIA_EMAILS", "")
    if correos:
        cfg["propietaria"]["emails"] = [
            c.strip().lower() for c in correos.split(",") if c.strip()
        ]
    url = os.environ.get("URL_PUBLICA", "").strip().rstrip("/")
    if not url:
        url = os.environ.get("RENDER_EXTERNAL_URL", "").strip().rstrip("/")
    if url:
        cfg["sitio"]["url_publica"] = url
    puerto = os.environ.get("PORT", "").strip()
    if puerto.isdigit():
        cfg["sitio"]["puerto"] = int(puerto)


aplicar_entorno(CONFIG)


def ahora():
    return datetime.now().replace(microsecond=0)


def iso(dt=None):
    return (dt or ahora()).isoformat(sep=" ")


def conectar():
    con = sqlite3.connect(DB_PATH, timeout=15)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA journal_mode=WAL")
    con.execute("PRAGMA busy_timeout=15000")
    return con


def iniciar_db():
    con = conectar()
    con.executescript(
        """
        CREATE TABLE IF NOT EXISTS eventos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ts TEXT NOT NULL,
            tipo TEXT NOT NULL,
            pagina TEXT,
            visitante TEXT,
            sesion TEXT,
            valor REAL,
            meta TEXT,
            referente TEXT,
            origen TEXT,
            dispositivo TEXT,
            ip_hash TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_eventos_ts ON eventos(ts);
        CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON eventos(tipo);
        CREATE INDEX IF NOT EXISTS idx_eventos_visitante ON eventos(visitante);

        CREATE TABLE IF NOT EXISTS reacciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ts TEXT NOT NULL,
            visitante TEXT,
            valor TEXT NOT NULL,
            comentario TEXT,
            puntuacion INTEGER,
            nombre TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_reacciones_ts ON reacciones(ts);
        CREATE INDEX IF NOT EXISTS idx_reacciones_visitante ON reacciones(visitante);

        CREATE TABLE IF NOT EXISTS sesiones (
            token TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            creada TEXT NOT NULL,
            expira TEXT NOT NULL
        );
        """
    )
    con.commit()
    con.close()


def ip_cliente(handler):
    reenviada = handler.headers.get("X-Forwarded-For", "")
    if reenviada:
        return reenviada.split(",")[0].strip()
    return handler.client_address[0] if handler.client_address else ""


def hash_ip(handler):
    sal = CONFIG.get("analitica", {}).get("sal", "sal")
    dato = (sal + "|" + ip_cliente(handler)).encode("utf-8")
    return hashlib.sha256(dato).hexdigest()[:20]


def ip_lan():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        try:
            return socket.gethostbyname(socket.gethostname())
        except Exception:
            return "127.0.0.1"


def url_base(handler):
    configurada = (CONFIG.get("sitio", {}).get("url_publica") or "").strip().rstrip("/")
    if configurada:
        return configurada
    host = handler.headers.get("Host", "")
    esquema = handler.headers.get("X-Forwarded-Proto", "http")
    if not host:
        host = f"{ip_lan()}:{CONFIG.get('sitio', {}).get('puerto', 8000)}"
    nombre = host.split(":")[0]
    if nombre in ("localhost", "127.0.0.1", "0.0.0.0"):
        puerto = host.split(":")[1] if ":" in host else str(
            CONFIG.get("sitio", {}).get("puerto", 8000)
        )
        host = f"{ip_lan()}:{puerto}"
    return f"{esquema}://{host}"


def leer_cookie(handler):
    cookie = SimpleCookie()
    try:
        cookie.load(handler.headers.get("Cookie", ""))
    except Exception:
        pass
    return cookie


def correos_propietaria():
    correos = CONFIG.get("propietaria", {}).get("emails", [])
    return [c.strip().lower() for c in correos if isinstance(c, str) and c.strip()]


def token_configuracion():
    if correos_propietaria():
        return ""
    token = str(CONFIG.get("propietaria", {}).get("setup_token") or "").strip()
    if not token:
        token = secrets.token_hex(3).upper()
        CONFIG["propietaria"]["setup_token"] = token
        guardar_config(CONFIG)
        try:
            (BASE / "datos" / "setup_token.txt").write_text(
                token + "\n", encoding="utf-8"
            )
        except Exception:
            pass
        print(
            f"\n  Código de configuración inicial: {token}\n"
            "  Archivo: datos/setup_token.txt\n",
            flush=True,
        )
    return token


def propietaria_autenticada(handler):
    cookie = leer_cookie(handler)
    morsel = cookie.get("sesion_propietaria")
    if not morsel:
        return None
    token = morsel.value
    con = conectar()
    fila = con.execute(
        "SELECT email, expira FROM sesiones WHERE token = ?", (token,)
    ).fetchone()
    con.close()
    if not fila:
        return None
    if fila["email"] not in correos_propietaria():
        return None
    try:
        if datetime.fromisoformat(fila["expira"]) < ahora():
            return None
    except Exception:
        return None
    return fila["email"]


def crear_sesion(handler, email, dias=30):
    token = secrets.token_urlsafe(32)
    inicio = ahora()
    fin = inicio + timedelta(days=dias)
    con = conectar()
    con.execute(
        "INSERT INTO sesiones (token, email, creada, expira) VALUES (?, ?, ?, ?)",
        (token, email, iso(inicio), iso(fin)),
    )
    con.commit()
    con.close()
    seguro = "; Secure" if handler.headers.get("X-Forwarded-Proto") == "https" else ""
    cookie = (
        f"sesion_propietaria={token}; Path=/; HttpOnly; SameSite=Lax; "
        f"Max-Age={dias * 86400}{seguro}"
    )
    if not hasattr(handler, "_cookies"):
        handler._cookies = []
    handler._cookies.append(cookie)
    return token


def borrar_sesion(handler):
    cookie = leer_cookie(handler)
    morsel = cookie.get("sesion_propietaria")
    if morsel:
        con = conectar()
        con.execute("DELETE FROM sesiones WHERE token = ?", (morsel.value,))
        con.commit()
        con.close()
    if not hasattr(handler, "_cookies"):
        handler._cookies = []
    handler._cookies.append(
        "sesion_propietaria=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
    )


def json_seguro(valor, limite=4000):
    try:
        texto = json.dumps(valor, ensure_ascii=False)
    except Exception:
        return "{}"
    return texto[:limite]


def limpiar_texto(valor, limite=500):
    if not isinstance(valor, str):
        return ""
    return valor.replace("\x00", "").strip()[:limite]


def insertar_evento(handler, datos):
    tipo = limpiar_texto(datos.get("tipo"), 60)
    if not tipo:
        return
    pagina = limpiar_texto(datos.get("pagina"), 200)
    visitante = limpiar_texto(datos.get("visitante"), 80)
    sesion = limpiar_texto(datos.get("sesion"), 80)
    valor = datos.get("valor")
    try:
        valor = float(valor) if valor is not None and valor != "" else None
    except Exception:
        valor = None
    meta = datos.get("meta")
    meta_texto = json_seguro(meta) if meta is not None else ""
    referente = limpiar_texto(datos.get("referente"), 300)
    origen = limpiar_texto(datos.get("origen"), 80) or "directo"
    dispositivo = limpiar_texto(datos.get("dispositivo"), 20) or "desconocido"
    con = conectar()
    con.execute(
        """INSERT INTO eventos
           (ts, tipo, pagina, visitante, sesion, valor, meta, referente, origen, dispositivo, ip_hash)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            iso(),
            tipo,
            pagina,
            visitante,
            sesion,
            valor,
            meta_texto,
            referente,
            origen,
            dispositivo,
            hash_ip(handler),
        ),
    )
    con.commit()
    con.close()


def fila_a_dict(fila):
    return {k: fila[k] for k in fila.keys()}


def resumen_datos():
    con = conectar()
    e = con.execute

    def uno(sql, params=()):
        fila = e(sql, params).fetchone()
        return fila[0] if fila and fila[0] is not None else 0

    totales = {
        "visitas": uno("SELECT COUNT(*) FROM eventos WHERE tipo='pagina_vista'"),
        "personas": uno(
            "SELECT COUNT(DISTINCT visitante) FROM eventos WHERE tipo='pagina_vista' AND visitante<>''"
        ),
        "qr": uno("SELECT COUNT(*) FROM eventos WHERE tipo='qr_scan'"),
        "juego_inicio": uno("SELECT COUNT(*) FROM eventos WHERE tipo='juego_inicio'"),
        "juego_fin": uno("SELECT COUNT(*) FROM eventos WHERE tipo='juego_fin'"),
        "nota_media": round(
            uno("SELECT AVG(valor) FROM eventos WHERE tipo='juego_fin' AND valor IS NOT NULL"),
            1,
        ),
        "me_gusta": uno("SELECT COUNT(*) FROM reacciones WHERE valor='me_gusta'"),
        "no_me_gusta": uno("SELECT COUNT(*) FROM reacciones WHERE valor='no_me_gusta'"),
        "comentarios": uno(
            "SELECT COUNT(*) FROM reacciones WHERE comentario IS NOT NULL AND comentario<>''"
        ),
        "compartidos": uno("SELECT COUNT(*) FROM eventos WHERE tipo='compartir'"),
        "permanencia_media": round(
            uno("SELECT AVG(valor) FROM eventos WHERE tipo='permanencia' AND valor IS NOT NULL"),
            1,
        ),
        "visitas_24h": uno(
            "SELECT COUNT(*) FROM eventos WHERE tipo='pagina_vista' AND ts >= ?",
            (iso(ahora() - timedelta(hours=24)),),
        ),
        "personas_24h": uno(
            "SELECT COUNT(DISTINCT visitante) FROM eventos WHERE tipo='pagina_vista' AND visitante<>'' AND ts >= ?",
            (iso(ahora() - timedelta(hours=24)),),
        ),
    }
    totales["finalizacion"] = (
        round(100 * totales["juego_fin"] / totales["juego_inicio"], 1)
        if totales["juego_inicio"]
        else 0
    )
    totales["satisfaccion"] = (
        round(
            100
            * totales["me_gusta"]
            / (totales["me_gusta"] + totales["no_me_gusta"]),
            1,
        )
        if (totales["me_gusta"] + totales["no_me_gusta"])
        else 0
    )

    serie = []
    hoy = ahora().date()
    for i in range(29, -1, -1):
        dia = hoy - timedelta(days=i)
        fila = e(
            """SELECT COUNT(*) AS visitas,
                      COUNT(DISTINCT CASE WHEN visitante<>'' THEN visitante END) AS personas
               FROM eventos WHERE tipo='pagina_vista' AND substr(ts,1,10)=?""",
            (dia.isoformat(),),
        ).fetchone()
        serie.append(
            {
                "fecha": dia.isoformat(),
                "visitas": fila["visitas"],
                "personas": fila["personas"],
            }
        )

    horas = [0] * 24
    for fila in e(
        "SELECT CAST(substr(ts,12,2) AS INTEGER) AS h, COUNT(*) AS n FROM eventos WHERE tipo='pagina_vista' GROUP BY h"
    ):
        if 0 <= fila["h"] < 24:
            horas[fila["h"]] = fila["n"]

    fuentes = [
        {"nombre": fila["origen"] or "directo", "valor": fila["n"]}
        for fila in e(
            "SELECT origen, COUNT(*) AS n FROM eventos WHERE tipo='pagina_vista' GROUP BY origen ORDER BY n DESC"
        )
    ]
    dispositivos = [
        {"nombre": fila["dispositivo"] or "desconocido", "valor": fila["n"]}
        for fila in e(
            "SELECT dispositivo, COUNT(*) AS n FROM eventos WHERE tipo='pagina_vista' GROUP BY dispositivo ORDER BY n DESC"
        )
    ]
    paginas = [
        {"nombre": fila["pagina"] or "(inicio)", "valor": fila["n"]}
        for fila in e(
            "SELECT pagina, COUNT(*) AS n FROM eventos WHERE tipo='pagina_vista' GROUP BY pagina ORDER BY n DESC LIMIT 10"
        )
    ]

    embudo = []
    for acto in range(1, 6):
        n = uno(
            "SELECT COUNT(*) FROM eventos WHERE tipo='acto_completado' AND json_extract(meta,'$.acto')=?",
            (acto,),
        )
        embudo.append({"acto": acto, "valor": n})

    notas = [0] * 5
    for fila in e(
        "SELECT CAST(valor/20 AS INTEGER) AS b, COUNT(*) AS n FROM eventos WHERE tipo='juego_fin' AND valor IS NOT NULL GROUP BY b"
    ):
        indice = max(0, min(4, int(fila["b"] or 0)))
        notas[indice] += fila["n"]

    reacciones = [
        {
            "id": fila["id"],
            "ts": fila["ts"],
            "valor": fila["valor"],
            "comentario": fila["comentario"] or "",
            "puntuacion": fila["puntuacion"],
            "nombre": fila["nombre"] or "Visitante",
        }
        for fila in e(
            "SELECT * FROM reacciones ORDER BY ts DESC LIMIT 40"
        )
    ]
    recientes = [r for r in reacciones if r["comentario"]][:12]

    recurrentes = uno(
        """SELECT COUNT(*) FROM (
             SELECT visitante FROM eventos
             WHERE tipo='pagina_vista' AND visitante<>''
             GROUP BY visitante HAVING COUNT(DISTINCT substr(ts,1,10)) > 1
           )"""
    )

    con.close()
    return {
        "totales": totales,
        "serie_diaria": serie,
        "por_hora": horas,
        "fuentes": fuentes,
        "dispositivos": dispositivos,
        "paginas": paginas,
        "embudo": embudo,
        "notas": notas,
        "reacciones": reacciones,
        "reacciones_recientes": recientes,
        "recurrentes": recurrentes,
        "actualizado": iso(),
        "autora": CONFIG.get("propietaria", {}).get("nombre", "Laura"),
        "url_publica": url_base(self),
    }


def generar_qr_svg(url):
    try:
        import qrcode
        import qrcode.image.svg

        imagen = qrcode.make(
            url,
            image_factory=qrcode.image.svg.SvgPathImage,
            border=3,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=12,
        )
        buf = io.BytesIO()
        imagen.save(buf)
        return buf.getvalue()
    except Exception:
        svg = (
            '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320">'
            '<rect width="320" height="320" fill="#ffffff"/>'
            '<text x="160" y="150" text-anchor="middle" font-family="sans-serif" '
            'font-size="18" fill="#0b1f3a">QR no disponible</text>'
            '<text x="160" y="180" text-anchor="middle" font-family="sans-serif" '
            'font-size="13" fill="#5b6b7f">Instala: pip install qrcode</text></svg>'
        )
        return svg.encode("utf-8")


class Handler(BaseHTTPRequestHandler):
    server_version = "DelAsfaltoAlDato/1.0"

    def log_message(self, formato, *args):
        print("[%s] %s" % (ahora().strftime("%H:%M:%S"), formato % args), flush=True)

    def _enviar(self, codigo, cuerpo=b"", tipo="text/plain; charset=utf-8", extra=None):
        self.send_response(codigo)
        self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(cuerpo)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        if extra:
            for clave, valor in extra.items():
                self.send_header(clave, valor)
        for cookie in getattr(self, "_cookies", []):
            self.send_header("Set-Cookie", cookie)
        self._cookies = []
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(cuerpo)

    def _json(self, datos, codigo=200, extra=None):
        cuerpo = json.dumps(datos, ensure_ascii=False).encode("utf-8")
        self._enviar(
            codigo, cuerpo, "application/json; charset=utf-8", extra
        )

    def _error(self, codigo, mensaje):
        self._json({"ok": False, "error": mensaje}, codigo)

    def _leer_json(self):
        try:
            largo = int(self.headers.get("Content-Length", "0") or 0)
            if largo <= 0 or largo > 200000:
                return {}
            return json.loads(self.rfile.read(largo).decode("utf-8"))
        except Exception:
            return {}

    def do_OPTIONS(self):
        self._enviar(204, b"", "text/plain")

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        ruta = urlparse(self.path)
        camino = ruta.path
        consulta = parse_qs(ruta.query)

        if camino == "/api/resumen":
            if not propietaria_autenticada(self):
                return self._error(401, "Solo la propietaria puede ver el panel.")
            return self._json(resumen_datos())

        if camino == "/api/estadisticas":
            con = conectar()

            def contar(sql):
                fila = con.execute(sql).fetchone()
                return fila[0] if fila and fila[0] is not None else 0

            datos = {
                "visitas": contar(
                    "SELECT COUNT(*) FROM eventos WHERE tipo='pagina_vista'"
                ),
                "personas": contar(
                    "SELECT COUNT(DISTINCT visitante) FROM eventos WHERE tipo='pagina_vista' AND visitante<>''"
                ),
                "qr": contar("SELECT COUNT(*) FROM eventos WHERE tipo='qr_scan'"),
                "juego_fin": contar(
                    "SELECT COUNT(*) FROM eventos WHERE tipo='juego_fin'"
                ),
                "me_gusta": contar(
                    "SELECT COUNT(*) FROM reacciones WHERE valor='me_gusta'"
                ),
            }
            con.close()
            return self._json(datos)

        if camino == "/api/muro":
            con = conectar()
            mg = con.execute(
                "SELECT COUNT(*) FROM reacciones WHERE valor='me_gusta'"
            ).fetchone()[0]
            nm = con.execute(
                "SELECT COUNT(*) FROM reacciones WHERE valor='no_me_gusta'"
            ).fetchone()[0]
            filas = con.execute(
                """SELECT id, ts, valor, comentario, puntuacion, nombre
                   FROM reacciones
                   WHERE comentario IS NOT NULL AND comentario<>''
                   ORDER BY ts DESC LIMIT 12"""
            ).fetchall()
            con.close()
            return self._json(
                {
                    "me_gusta": mg,
                    "no_me_gusta": nm,
                    "comentarios": [fila_a_dict(f) for f in filas],
                }
            )

        if camino == "/api/auth/estado":
            email = propietaria_autenticada(self)
            return self._json(
                {
                    "autenticada": bool(email),
                    "email": email or "",
                    "configurada": bool(correos_propietaria()),
                    "requiere_codigo": bool(
                        not correos_propietaria() and token_configuracion()
                    ),
                    "nombre": CONFIG.get("propietaria", {}).get("nombre", ""),
                }
            )

        if camino == "/api/config-publica":
            correos = correos_propietaria()

            def pista(correo):
                nombre, _, dominio = correo.partition("@")
                if not dominio:
                    return "•••"
                return (nombre[:1] + "•••@" + dominio) if nombre else "•••@" + dominio

            return self._json(
                {
                    "configurada": bool(correos),
                    "requiere_codigo": bool(not correos and token_configuracion()),
                    "nombre": CONFIG.get("propietaria", {}).get("nombre", ""),
                    "pistas": [pista(c) for c in correos],
                    "url_publica": url_base(self),
                }
            )

        if camino == "/api/propietaria/config":
            email = propietaria_autenticada(self)
            if not email:
                return self._error(401, "Entra primero.")
            return self._json(
                {
                    "email": email,
                    "emails": correos_propietaria(),
                    "nombre": CONFIG.get("propietaria", {}).get("nombre", ""),
                    "url_publica": CONFIG.get("sitio", {}).get("url_publica", ""),
                    "url_efectiva": url_base(self),
                }
            )

        if camino == "/api/exportar.csv":
            if not propietaria_autenticada(self):
                return self._error(401, "Entra primero.")
            con = conectar()
            filas = con.execute("SELECT * FROM eventos ORDER BY id ASC").fetchall()
            con.close()
            buf = io.StringIO()
            escritor = csv.writer(buf)
            escritor.writerow(
                [
                    "id",
                    "fecha_hora",
                    "tipo",
                    "pagina",
                    "visitante",
                    "sesion",
                    "valor",
                    "meta",
                    "referente",
                    "origen",
                    "dispositivo",
                    "ip_hash",
                ]
            )
            for f in filas:
                escritor.writerow([f[k] for k in f.keys()])
            datos = buf.getvalue().encode("utf-8-sig")
            return self._enviar(
                200,
                datos,
                "text/csv; charset=utf-8",
                {
                    "Content-Disposition": 'attachment; filename="alcance_del_asfalto_al_dato.csv"'
                },
            )

        if camino == "/qr":
            datos = {
                "tipo": "qr_scan",
                "pagina": "/juego",
                "origen": "qr",
                "dispositivo": "movil"
                if "Mobile" in self.headers.get("User-Agent", "")
                else "escritorio",
                "referente": self.headers.get("Referer", ""),
            }
            insertar_evento(self, datos)
            self.send_response(HTTPStatus.FOUND)
            self.send_header("Location", "/juego?origen=qr")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            return

        if camino == "/qr.svg":
            destino = url_base(self) + "/qr"
            svg = generar_qr_svg(destino)
            return self._enviar(
                200, svg, "image/svg+xml; charset=utf-8", {"Cache-Control": "no-store"}
            )

        if camino in ("/", ""):
            return self._servir_archivo(PUBLIC / "index.html")
        if camino == "/juego":
            return self._servir_archivo(PUBLIC / "juego.html")
        if camino == "/panel":
            return self._servir_archivo(PUBLIC / "panel.html")
        if camino == "/qr-card":
            return self._servir_archivo(PUBLIC / "qr.html")

        return self._servir_archivo(PUBLIC / camino.lstrip("/"))

    def do_POST(self):
        camino = urlparse(self.path).path

        if camino == "/api/evento":
            datos = self._leer_json()
            insertar_evento(self, datos)
            return self._json({"ok": True}, 201)

        if camino == "/api/reaccion":
            return self._reaccion()

        if camino == "/api/auth/entrar":
            datos = self._leer_json()
            email = limpiar_texto(datos.get("email"), 120).lower()
            correos = correos_propietaria()
            if not correos:
                return self._error(
                    409, "Aún no hay correos configurados. Configura tu acceso primero."
                )
            if not EMAIL_RE.match(email) or email not in correos:
                return self._error(403, "Ese correo no es de la propietaria.")
            try:
                crear_sesion(self, email)
            except Exception:
                return self._error(500, "No se pudo crear la sesión.")
            insertar_evento(
                self,
                {
                    "tipo": "login_propietaria",
                    "pagina": "/panel",
                    "origen": "panel",
                    "dispositivo": "movil"
                    if "Mobile" in self.headers.get("User-Agent", "")
                    else "escritorio",
                },
            )
            return self._json({"ok": True, "email": email})

        if camino == "/api/auth/salir":
            borrar_sesion(self)
            return self._json({"ok": True})

        if camino == "/api/propietaria/config":
            return self._config_propietaria()

        if camino == "/api/reaccion/borrar":
            if not propietaria_autenticada(self):
                return self._error(401, "Entra primero.")
            datos = self._leer_json()
            try:
                ident = int(datos.get("id"))
            except Exception:
                return self._error(400, "Reacción inválida.")
            con = conectar()
            con.execute("DELETE FROM reacciones WHERE id = ?", (ident,))
            con.commit()
            con.close()
            return self._json({"ok": True})

        if camino == "/api/propietaria/reiniciar":
            if not propietaria_autenticada(self):
                return self._error(401, "Entra primero.")
            datos = self._leer_json()
            if datos.get("confirmar") != "REINICIAR":
                return self._error(400, "Confirmación incorrecta.")
            con = conectar()
            con.execute("DELETE FROM eventos")
            con.execute("DELETE FROM reacciones")
            con.execute("DELETE FROM sqlite_sequence WHERE name IN ('eventos','reacciones')")
            con.commit()
            con.close()
            return self._json({"ok": True})

        return self._error(404, "No encontrado.")

    def _reaccion(self):
        datos = self._leer_json()
        valor = limpiar_texto(datos.get("valor"), 20)
        if valor not in ("me_gusta", "no_me_gusta"):
            return self._error(400, "Reacción inválida.")
        visitante = limpiar_texto(datos.get("visitante"), 80)
        comentario = limpiar_texto(datos.get("comentario"), 280)
        nombre = limpiar_texto(datos.get("nombre"), 40) or "Visitante"
        try:
            puntuacion = int(datos.get("puntuacion")) if datos.get("puntuacion") not in (None, "") else None
        except Exception:
            puntuacion = None
        if puntuacion is not None and not (0 <= puntuacion <= 100):
            puntuacion = None

        con = conectar()
        existente = None
        if visitante:
            existente = con.execute(
                "SELECT id FROM reacciones WHERE visitante = ? ORDER BY id DESC LIMIT 1",
                (visitante,),
            ).fetchone()
        if existente:
            con.execute(
                """UPDATE reacciones SET ts=?, valor=?, comentario=?, puntuacion=?, nombre=?
                   WHERE id=?""",
                (iso(), valor, comentario, puntuacion, nombre, existente["id"]),
            )
        else:
            con.execute(
                """INSERT INTO reacciones (ts, visitante, valor, comentario, puntuacion, nombre)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (iso(), visitante, valor, comentario, puntuacion, nombre),
            )
        mg = con.execute(
            "SELECT COUNT(*) FROM reacciones WHERE valor='me_gusta'"
        ).fetchone()[0]
        nm = con.execute(
            "SELECT COUNT(*) FROM reacciones WHERE valor='no_me_gusta'"
        ).fetchone()[0]
        con.commit()
        con.close()

        insertar_evento(
            self,
            {
                "tipo": "reaccion",
                "pagina": limpiar_texto(datos.get("pagina"), 200) or "/juego",
                "visitante": visitante,
                "sesion": datos.get("sesion"),
                "valor": 1 if valor == "me_gusta" else -1,
                "origen": datos.get("origen") or "directo",
                "dispositivo": datos.get("dispositivo"),
                "meta": {
                    "comentario": comentario,
                    "puntuacion": puntuacion,
                    "nombre": nombre,
                },
            },
        )
        return self._json({"ok": True, "me_gusta": mg, "no_me_gusta": nm})

    def _config_propietaria(self):
        datos = self._leer_json()
        autenticada = bool(propietaria_autenticada(self))
        correos_actuales = correos_propietaria()
        if correos_actuales and not autenticada:
            return self._error(401, "Entra primero para cambiar la configuración.")

        if not correos_actuales and not autenticada:
            codigo = limpiar_texto(datos.get("codigo"), 20).upper()
            esperado = token_configuracion()
            if not esperado or codigo != esperado:
                return self._error(
                    400,
                    "Código de configuración incorrecto. Está en la terminal del servidor o en datos/setup_token.txt.",
                )

        correos = datos.get("emails")
        if not isinstance(correos, list):
            return self._error(400, "Envía una lista de correos.")
        limpios = []
        for correo in correos:
            correo = limpiar_texto(correo, 120).lower()
            if not correo:
                continue
            if not EMAIL_RE.match(correo):
                return self._error(400, f"Correo inválido: {correo}")
            if correo not in limpios:
                limpios.append(correo)
        if not 1 <= len(limpios) <= 5:
            return self._error(400, "Configura entre 1 y 5 correos.")

        nombre = limpiar_texto(datos.get("nombre"), 80) or CONFIG["propietaria"].get(
            "nombre", "Laura Díaz Sánchez"
        )
        CONFIG["propietaria"]["emails"] = limpios
        CONFIG["propietaria"]["nombre"] = nombre
        CONFIG["propietaria"]["setup_token"] = ""

        url_publica = datos.get("url_publica")
        if isinstance(url_publica, str):
            url_publica = url_publica.strip().rstrip("/")
            if url_publica and not re.match(r"^https?://", url_publica):
                return self._error(400, "La URL debe empezar por http:// o https://")
            CONFIG["sitio"]["url_publica"] = url_publica

        guardar_config(CONFIG)
        try:
            (BASE / "datos" / "setup_token.txt").unlink()
        except Exception:
            pass
        if not autenticada:
            crear_sesion(self, limpios[0])
        insertar_evento(
            self,
            {
                "tipo": "config_propietaria",
                "pagina": "/panel",
                "origen": "panel",
            },
        )
        return self._json(
            {
                "ok": True,
                "emails": limpios,
                "nombre": nombre,
                "url_publica": CONFIG["sitio"].get("url_publica", ""),
                "url_efectiva": url_base(self),
            }
        )

    def _servir_archivo(self, ruta):
        try:
            ruta = ruta.resolve()
            if PUBLIC.resolve() not in ruta.parents and ruta != PUBLIC.resolve():
                return self._error(403, "Prohibido.")
            if not ruta.exists() or not ruta.is_file():
                return self._error(404, "Archivo no encontrado.")
            contenido = ruta.read_bytes()
            tipo = MIME_EXTRA.get(ruta.suffix.lower()) or mimetypes.guess_type(
                str(ruta)
            )[0] or "application/octet-stream"
            cache = (
                "no-store"
                if ruta.suffix.lower() in (".html",)
                else "public, max-age=3600"
            )
            self._enviar(200, contenido, tipo, {"Cache-Control": cache})
        except Exception:
            self._error(404, "Archivo no encontrado.")


def main():
    try:
        sys.stdout.reconfigure(line_buffering=True)
        sys.stderr.reconfigure(line_buffering=True)
    except Exception:
        pass
    parser = argparse.ArgumentParser(description="Servidor de Del asfalto al dato")
    parser.add_argument("--puerto", type=int, default=int(CONFIG["sitio"].get("puerto", 8000)))
    parser.add_argument("--host", default="0.0.0.0")
    args = parser.parse_args()

    iniciar_db()
    servidor = ThreadingHTTPServer((args.host, args.puerto), Handler)
    ip = ip_lan()
    print("")
    print("  DEL ASFALTO AL DATO · La Ruta del Triciclo")
    print("  ------------------------------------------")
    print(f"  Sitio:   http://127.0.0.1:{args.puerto}")
    print(f"  Red:     http://{ip}:{args.puerto}")
    print(f"  Juego:   http://{ip}:{args.puerto}/juego")
    print(f"  Panel:   http://{ip}:{args.puerto}/panel")
    print(f"  QR:      http://{ip}:{args.puerto}/qr-card")
    print("  ------------------------------------------")
    print("  Ctrl+C para detener.")
    print("")
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
    finally:
        servidor.server_close()


if __name__ == "__main__":
    main()
