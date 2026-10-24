"""Servidor local de desarrollo SIN caché.

Igual que `python -m http.server`, pero le indica al navegador que no guarde copias de los archivos.
Así cada recarga muestra siempre los últimos cambios de CSS y JS.

Uso (desde la carpeta del proyecto):
    python dev/servidor.py          → http://localhost:8000
    python dev/servidor.py 8080     → otro puerto
"""
import functools
import http.server
import os
import sys


class SinCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()


raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
servidor = http.server.ThreadingHTTPServer(('', puerto), functools.partial(SinCache, directory=raiz))
print(f'DaleChance en http://localhost:{puerto} (sin caché). Ctrl + C para detener.')
servidor.serve_forever()
