TURING & ENIGMA — OFFLINE WEBSITE

1. Extract the entire ZIP. Keep the runtime folder with the website.
2. You need Python 3 installed to start the local file server.
3. On Mac, open Terminal, type `cd ` (including the space), drag this extracted
   folder into Terminal, and press Enter. Then run:

   python3 start.py

The browser opens automatically. No internet, accounts, downloads or packages
are needed after extraction (provided Python 3 is already installed).
Keep Terminal open. Ctrl+C stops the local server. It listens only on this
computer, not your Wi-Fi network. If the browser does not open automatically,
copy the local URL printed in Terminal into your browser.
Start-Mac.command is an optional shortcut if macOS permits it to run.
Do not open index.html directly: browsers restrict local WebAssembly resources.

The Enigma engine and code editor run actual Python via the bundled Pyodide
WebAssembly runtime in a browser worker. The local server only serves files;
it does not execute submitted code. External reference links require internet.
Use a modern Safari, Firefox, Chrome or Edge browser with WebAssembly enabled.

The Enigma model uses three distinct rotors from I-V, reflector B, configurable
ring letters, initial windows, and plugboard pairs, including double stepping.
German letters are expanded; periods become X. Other punctuation, spaces and
digits are removed. Spell out numbers. Historical text conventions varied.

Default example: HELLOWORLD -> ILBDAAMTAZ. Use the same initial settings to
recover HELLOWORLD. Reset clears the message and returns to selected settings;
it does not restore factory settings. Try HELLOWORLD restores factory settings.

The editor exposes Enigma and prepare. Each run gets a new namespace.
Run Python or Cmd+Enter runs code; Restart Python stops a running worker.
A 10-second limit stops runaway experiments. No external Python packages are
bundled. print() works; interactive input() is not provided by the editor.
The editor and machine share one worker, so controls pause during execution.

FILES
index.html / style.css / app.js: interface and educational text.
worker.js: runs Python in a worker without blocking the page.
enigma.py: readable Python simulation.
start.py: standard-library local file server.
runtime/: bundled Pyodide 0.27.7 and Python standard library.
