const $=id=>document.getElementById(id);
const example=`# The engine is already loaded: Enigma and prepare are available.
settings = dict(
    order=('I', 'II', 'III'),
    positions='AAA',
    rings='AAA',
    plugboard=''
)

message = prepare('Hello world')
machine = Enigma(**settings)
encrypted = machine.process(message)
print('Prepared:', message)
print('Encrypted:', encrypted)
print('Rotor windows:', machine.windows())

# Reset the machine to decrypt.
decoder = Enigma(**settings)
print('Decrypted:', decoder.process(encrypted))

# Try German text: prepare('Grüße aus Berlin.')`;
$('code').value=example;
let worker, busy=true, loaded=false, timer, lastResult='';
const controls=['encrypt','reset','decrypt','example','run'];
function enable(){for(const id of controls) $(id).disabled=busy||!loaded;document.querySelectorAll('.key').forEach(b=>b.disabled=busy||!loaded);$('settings').disabled=busy||!loaded;}
function clearTimer(){clearTimeout(timer);}
function start(reason='Loading local Python…') {
  worker?.terminate();clearTimer();loaded=false;busy=true;enable();$('status').textContent=reason;
  worker=new Worker('worker.js');
  timer=setTimeout(()=>{$('status').textContent='Python is taking longer than expected. You can restart it.';},60000);
  worker.onmessage=({data})=>{
    clearTimer();busy=false;
    if(data.type==='ready'){loaded=true;$('status').textContent='Python ready · no internet needed';$('console').textContent='Ready. Run the example or write your own code.';$('engine-source').textContent=data.source;}
    if(data.type==='machine') {lastResult=data.result;$('prepared').textContent=data.prepared||'—';$('result').textContent=data.result||'—';$('windows').textContent=data.windows.split('').join(' ');document.querySelectorAll('.lamp').forEach(e=>e.classList.toggle('lit',e.dataset.letter===data.result.slice(-1)));$('status').textContent='Processed '+data.prepared.length+' letters';}
    if(data.type==='run') {$('console').textContent=data.output;$('status').textContent='Python ready';}
    if(data.type==='error') {$(data.action==='run'?'console':'machine-error').textContent=data.error;$('status').textContent='Check your input and try again.';}
    if(data.type==='fatal'){loaded=false;$('status').textContent='Python could not start. Restart it or check that all runtime files were extracted.';$('console').textContent=data.error;}
    enable();
  };
  worker.onerror=e=>{clearTimer();busy=false;loaded=false;enable();$('status').textContent='Python failed to load. Open this site using start.py.';$('console').textContent=e.message;};
}
function send(data){if(busy||!loaded)return;busy=true;enable();$('machine-error').textContent='';$('status').textContent='Running Python…';worker.postMessage(data);timer=setTimeout(()=>{start('Experiment stopped after 10 seconds. Restarting Python…');},10000);}
function processMessage(message=$('message').value){if(message.length>20000){$('machine-error').textContent='Please use a message of 20,000 characters or fewer.';return;}send({type:'machine',settings:{order:[$('left').value,$('middle').value,$('right').value],positions:$('positions').value,rings:$('rings').value,plugs:$('plugs').value,message}});}
['left','middle','right'].forEach((id,i)=>{['I','II','III','IV','V'].forEach(r=>$(id).add(new Option(r,r)));$(id).selectedIndex=i;});
for(const row of ['QWERTZUIO','ASDFGHJK','PYXCVBNML']) {for(const kind of ['lamps','keys']){const div=document.createElement('div');div.className='key-row';for(const letter of row){const e=document.createElement(kind==='keys'?'button':'span');e.className=kind==='keys'?'key':'lamp';e.dataset.letter=letter;e.textContent=letter;if(kind==='keys'){e.disabled=true;e.setAttribute('aria-label','Encrypt '+letter);e.onclick=()=>{$('message').value+=letter;processMessage();};}div.append(e);}$(kind).append(div);}}
$('encrypt').onclick=()=>processMessage();
$('reset').onclick=()=>{$('message').value='';processMessage('');};
$('decrypt').onclick=()=>{$('message').value=lastResult;$('message').focus();};
$('example').onclick=()=>{['left','middle','right'].forEach((id,i)=>$(id).selectedIndex=i);$('positions').value=$('rings').value='AAA';$('plugs').value='';$('message').value='HELLOWORLD';processMessage();};
$('run').onclick=()=>send({type:'run',code:$('code').value});$('stop').onclick=()=>start('Restarting Python…');$('restore').onclick=()=>{$('code').value=example;};
$('code').onkeydown=e=>{if(e.key==='Tab'){e.preventDefault();const t=e.target;const start=t.selectionStart;t.setRangeText('    ',start,t.selectionEnd,'end');}if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();$('run').click();}};
if(location.protocol==='file:'){$('status').textContent='Open this website with start.py so local Python can load.';$('console').textContent='In Terminal, run python3 start.py from this folder. No internet is needed.';}else start();
