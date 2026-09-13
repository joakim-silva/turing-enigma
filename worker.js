importScripts('runtime/pyodide.js');
let py, source;
const ready = (async () => {
  py = await loadPyodide({indexURL: new URL('runtime/', self.location.href).href});
  const response = await fetch('enigma.py');
  if (!response.ok) throw new Error('Cannot read enigma.py');
  source = await response.text();
  postMessage({type:'ready',source});
})();
ready.catch(error => postMessage({type:'fatal',error:String(error)}));
onmessage = async ({data}) => {
  let ns;
  try {
    await ready;
    ns = py.toPy({__name__:'enigma_browser'});
    py.runPython(source,{globals:ns});
    if(data.type === 'machine') {
      ns.set('request',py.toPy(data.settings));
      const result = py.runPython(`
import json
machine = Enigma(request['order'], request['positions'], request['rings'], request['plugs'])
text = prepare(request['message'])
encoded = machine.process(text)
json.dumps({'prepared': text, 'result': encoded, 'windows': machine.windows()})
`,{globals:ns});
      postMessage({type:'machine',...JSON.parse(result)});
    } else if(data.type === 'run') {
      let output='';
      const append = text => {if(output.length<100000) output += text+'\n';};
      py.setStdout({batched:append}); py.setStderr({batched:append});
      try { await py.runPythonAsync(data.code,{globals:ns}); }
      catch(error) { append(String(error)); }
      postMessage({type:'run',output:output || '(Finished with no printed output.)'});
    }
  } catch(error) {postMessage({type:'error',action:data.type,error:String(error)});}
  finally {ns?.destroy();}
};
