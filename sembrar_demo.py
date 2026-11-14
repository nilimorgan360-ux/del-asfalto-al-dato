#!/usr/bin/env python3
import json
import random
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

BASE = Path(__file__).resolve().parent
DB = BASE / "datos" / "analiticas.db"

random.seed(20261114)

NOMBRES = [
    "Ana", "Carlos", "Mariela", "Jorge", "Lisandra", "Yusmila", "Daniel",
    "Rocío", "Ernesto", "Claudia", "Alejandro", "Yanelis", "Pedro", "Sofía",
    "Michel", "Dayana", "Reinier", "Gretel", "Osmany", "Nadia",
]
COMENTARIOS = [
    "Me encantó cómo convierte la calle en datos. Muy claro.",
    "No sabía que un triciclo podía costar tanto. Buen trabajo.",
    "El juego te obliga a pensar, no solo a leer. Genial.",
    "La parte de las barreras es la más real de todo.",
    "Ya quiero ver la segunda parte con más municipios.",
    "Muy linda la historia y los gráficos. Aprendí bastante.",
    "El dato del panel solar me sorprendió.",
    "Como estudiante, me motivó a buscar datos en mi barrio.",
    "La ruta es entretenida y se entiende todo.",
    "Faltó más sobre pasajeros, pero me gustó mucho.",
    "Excelente mezcla de storytelling y ciencia.",
    "La idea del QR para jugar está muy buena.",
    "Me gustó, aunque me hubiera gustado más profundidad.",
    "Muy creativa la forma de presentar el proyecto.",
    "Los precios por municipio son un hallazgo fuerte.",
]
PAGINAS = [("/", 0.58), ("/juego", 0.34), ("/qr-card", 0.08)]
ORIGENES = [("qr", 0.46), ("directo", 0.24), ("redes", 0.15), ("sitio", 0.1), ("referido", 0.05)]


def elegir(lista):
    r = random.random()
    acumulado = 0
    for valor, peso in lista:
        acumulado += peso
        if r <= acumulado:
            return valor
    return lista[-1][0]


def main():
    if not DB.exists():
        print("No existe la base. Ejecuta primero el servidor.")
        return
    con = sqlite3.connect(DB)
    con.execute("DELETE FROM eventos")
    con.execute("DELETE FROM reacciones")
    con.execute("DELETE FROM sqlite_sequence WHERE name IN ('eventos','reacciones')")
    con.commit()

    ahora = datetime.now().replace(microsecond=0)
    eventos = []
    reacciones = []
    visitantes = []

    for dia in range(13, -1, -1):
        fecha = ahora - timedelta(days=dia)
        cantidad = random.randint(4, 16)
        if fecha.weekday() >= 5:
            cantidad += random.randint(2, 8)
        for k in range(cantidad):
            visita = "demo-v-%d-%d" % (dia, k)
            visitantes.append(visita)
            hora = random.choice([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21])
            ts = fecha.replace(hour=hora, minute=random.randint(0, 59), second=random.randint(0, 59))
            origen = elegir(ORIGENES)
            dispositivo = "movil" if random.random() < 0.82 else "escritorio"
            pagina = elegir(PAGINAS)
            eventos.append((
                ts.isoformat(sep=" "), "pagina_vista", pagina, visita,
                "demo-s-%d" % dia, None,
                json.dumps({"titulo": "Del asfalto al dato"}),
                "", origen, dispositivo, "demo",
            ))
            if origen == "qr" and random.random() < 0.7:
                eventos.append((
                    ts.isoformat(sep=" "), "qr_scan", "/juego", visita,
                    "demo-s-%d" % dia, None, "", "", "qr", "movil", "demo",
                ))
            if pagina == "/juego":
                eventos.append((
                    ts.isoformat(sep=" "), "juego_inicio", "/juego", visita,
                    "demo-s-%d" % dia, None, "{}", "", origen, dispositivo, "demo",
                ))
                for acto, prob in [(1, 0.94), (2, 0.86), (3, 0.77), (4, 0.68), (5, 0.6)]:
                    if random.random() < prob:
                        correcta = random.random() < 0.68
                        eventos.append((
                            ts.isoformat(sep=" "), "acto_completado", "/juego", visita,
                            "demo-s-%d" % dia, 20 if correcta else 0,
                            json.dumps({"acto": acto, "correcta": correcta}),
                            "", origen, dispositivo, "demo",
                        ))
                if random.random() < 0.52:
                    nota = random.choice([40, 50, 60, 60, 70, 70, 80, 80, 90, 90, 100, 100])
                    eventos.append((
                        ts.isoformat(sep=" "), "juego_fin", "/juego", visita,
                        "demo-s-%d" % dia, nota,
                        json.dumps({"aciertos": nota // 20}),
                        "", origen, dispositivo, "demo",
                    ))
            eventos.append((
                ts.isoformat(sep=" "), "permanencia", pagina, visita,
                "demo-s-%d" % dia, random.randint(25, 260), "{}", "", origen, dispositivo, "demo",
            ))
            if random.random() < 0.35:
                eventos.append((
                    ts.isoformat(sep=" "), "scroll_profundidad", pagina, visita,
                    "demo-s-%d" % dia, random.choice([25, 50, 75, 100]), "{}", "", origen, dispositivo, "demo",
                ))

    for i in range(28):
        visitante = random.choice(visitantes)
        valor = "me_gusta" if random.random() < 0.8 else "no_me_gusta"
        comentario = random.choice(COMENTARIOS) if random.random() < 0.62 else ""
        nombre = random.choice(NOMBRES) if comentario else "Visitante"
        fecha = ahora - timedelta(days=random.randint(0, 13), hours=random.randint(0, 20))
        reacciones.append((
            fecha.isoformat(sep=" "), visitante, valor, comentario,
            random.choice([40, 60, 60, 80, 80, 90, 100]) if valor == "me_gusta" else random.choice([20, 40, 60]),
            nombre,
        ))

    for _ in range(10):
        fecha = ahora - timedelta(days=random.randint(0, 13), hours=random.randint(0, 20))
        eventos.append((fecha.isoformat(sep=" "), "compartir", "/juego", random.choice(visitantes), "demo", None, "{}", "", "redes", "movil", "demo"))
    for _ in range(4):
        fecha = ahora - timedelta(days=random.randint(0, 13), hours=random.randint(0, 20))
        eventos.append((fecha.isoformat(sep=" "), "copiar_enlace", "/", random.choice(visitantes), "demo", None, "{}", "", "directo", "movil", "demo"))

    eventos.sort(key=lambda e: e[0])
    con.executemany(
        """INSERT INTO eventos
           (ts, tipo, pagina, visitante, sesion, valor, meta, referente, origen, dispositivo, ip_hash)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        eventos,
    )
    con.executemany(
        """INSERT INTO reacciones (ts, visitante, valor, comentario, puntuacion, nombre)
           VALUES (?, ?, ?, ?, ?, ?)""",
        reacciones,
    )
    con.commit()
    con.close()
    print("Datos de demostración insertados: %d eventos y %d reacciones." % (len(eventos), len(reacciones)))


if __name__ == "__main__":
    main()
