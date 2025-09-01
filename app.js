document.addEventListener('DOMContentLoaded', async () => {

  async function load() {
    const res = await fetch('data.json');
    const data = await res.json();
    const days = data.days;

    const select = document.getElementById('daySelect');
    const exList = document.getElementById('exList');

    // Populate day selector
    const keys = Object.keys(days).map(k => parseInt(k)).sort((a, b) => a - b);
    keys.forEach(k => {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = days[k].title || ('Jour ' + k);
      select.appendChild(o);
    });

    function fmt(s) {
      const m = Math.floor(s / 60);
      const ss = (s % 60).toString().padStart(2,'0');
      return m + ':' + ss;
    }

    function render(dayKey) {
      const d = days[dayKey];
      exList.innerHTML = '';

      d.exercises.forEach((ex) => {
        const card = document.createElement('div');
        card.className = 'card';

        const img = document.createElement('img');
        img.loading = 'lazy';
        img.src = ex.image ? 'assets/' + ex.image : '';
        img.alt = ex.name;
        card.appendChild(img);

        const row1 = document.createElement('div');
        row1.className = 'ex';

        const meta = document.createElement('div');
        meta.className = 'meta';
        const h = document.createElement('div');
        h.textContent = ex.name;
        h.style.fontWeight='700';
        const sub = document.createElement('div');
        sub.className='muted';
        sub.textContent = 'Temps: ' + ex.seconds + ' s';
        meta.appendChild(h);
        meta.appendChild(sub);

        const timer = document.createElement('div');
        timer.className = 'timer';
        timer.textContent = fmt(ex.seconds);

        row1.appendChild(meta);
        row1.appendChild(timer);
        card.appendChild(row1);

        const controls = document.createElement('div');
        controls.className='row';
        const start = document.createElement('button');
        start.textContent='Start'; start.className='btn';
        const pause = document.createElement('button');
        pause.textContent='Pause'; pause.className='btn secondary';
        const reset = document.createElement('button');
        reset.textContent='Reset'; reset.className='btn secondary';
        controls.appendChild(start); controls.appendChild(pause); controls.appendChild(reset);
        card.appendChild(controls);

        exList.appendChild(card);

        let t = ex.seconds, running=false, handle=null;

        function tick(){
          if(!running) return;
          t = Math.max(0, t-1);
          timer.textContent = fmt(t);
          if(t===0){
            running=false;
            clearInterval(handle);
            card.style.boxShadow='0 0 0 3px #22c55e inset';
          }
        }

        start.onclick = () => { if(running) return; running=true; card.style.boxShadow='0 0 0 3px #2563eb55 inset'; handle=setInterval(tick,1000); };
        pause.onclick = () => { running=false; clearInterval(handle); };
        reset.onclick = () => { running=false; clearInterval(handle); t=ex.seconds; timer.textContent=fmt(t); card.style.boxShadow=''; };
      });
    }

    select.onchange = () => render(select.value);
    render(keys[0]);

    // PWA install
    let deferred;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferred = e;
      const btn = document.getElementById('installBtn');
      if(btn){ btn.hidden=false; btn.onclick=()=>{ deferred.prompt(); }; }
    });

  }

  load();

});
