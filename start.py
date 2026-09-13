#!/usr/bin/env python3
"""Serve the bundled offline site on this computer only. No dependencies."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from functools import partial
import webbrowser

root = Path(__file__).resolve().parent
handler = partial(SimpleHTTPRequestHandler, directory=str(root))
with ThreadingHTTPServer(('127.0.0.1', 0), handler) as server:
    url = 'http://127.0.0.1:%d/' % server.server_port
    print('\nTURING & ENIGMA — OFFLINE\n' + url)
    print('Keep this window open. Press Ctrl+C to stop.\n')
    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.')
