/* Anim Lab shared shell — see docs/ANIM_LAB_SPEC.md.
   Each gallery defines `const ART = [...]` and `const COURSE = {...}`, then
   includes this file. */
(function () {
  const tabs = document.querySelectorAll('.tab');
  const filter = document.getElementById('lessonFilter');
  const grid = document.getElementById('grid');
  const focus = document.getElementById('focus');

  /* ── Persisted state ─────────────────────────────────────────── */
  const STORE_KEY = 'krit.anim-lab.v1';
  function loadState() { try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch { return {}; } }
  function saveState(s) { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {} }
  const state = loadState();
  state.opens = state.opens || 0;
  state.sound = !!state.sound;

  /* ── ZzFX (~1KB inline procedural SFX) ───────────────────────── */
  let zzfxV=.3,zzfxX,zzfx=(...t)=>{if(!zzfxX)zzfxX=new(window.AudioContext||window.webkitAudioContext);if(zzfxX.state==='suspended')zzfxX.resume();let[e=1,a=.05,n=220,r=0,i=0,s=.1,o=0,h=1,c=0,l=0,d=0,m=0,p=0,u=0,f=0,g=0,v=0,w=1,y=0,M=0,N=0]=t,k=2*Math.PI,b=zzfxX.sampleRate;c*=500*k/b/b;n*=(1-a+2*a*Math.random())*k/b;let A=[],S=0,T=0,L=0,Z=1,_=0,j=0,J=0,P=N<0?-1:1,B=k*P*N*2/b,C=Math.cos(B),x=Math.sin(B)/4,O=1+x,q=-2*C/O,D=(1-x)/O,E=(1+P*C)/2/O,H=-(P+C)/O,I=E,Q=0,R=0,U=0,V=0;r=b*r+9;y*=b;i*=b;s*=b;v*=b;l*=500*k/b**3;f*=k/b;d*=k/b;m*=b;p=b*p|0;for(g=r+y+i+s+v|0;L<g;A[L++]=j*e*zzfxV)++J%(100*g|0)||(j=o?1<o?2<o?3<o?4<o?(S/k%1<h/2)*2-1:Math.sin(S**3):Math.max(Math.min(Math.tan(S),1),-1):1-(2*S/k%2+2)%2:1-4*Math.abs(Math.round(S/k)-S/k):Math.sin(S),j=(p?1-M+M*Math.sin(k*L/p):1)*(4<o?j:(j<0?-1:1)*Math.abs(j)**h)*(L<r?L/r:L<r+y?1-(L-r)/y*(1-w):L<r+y+i?w:L<g-v?(g-L-v)/s*w:0),j=v?j/2+(v>L?0:(L<g-v?1:(g-L)/v)*A[L-v|0]/2/e):j,N?j=V=I*Q+H*(Q=R)+E*(R=j)-D*U-q*(U=V):0),B=(n+=c+=l)*Math.cos(f*T++),S+=B+B*u*Math.sin(L**5),Z&&++Z>m&&(n+=d,n+=d,Z=0),!p||++_%p||(n=B,c=0,Z=Z||1);let W=zzfxX.createBuffer(1,g,b);W.getChannelData(0).set(A);let Y=zzfxX.createBufferSource();Y.buffer=W;Y.connect(zzfxX.destination);Y.start();return Y};
  window.SFX_ON = state.sound;
  window.SFX = {
    click:   () => SFX_ON && zzfx(1,.05,800,0,.01,.05,0,1.5),
    confirm: () => SFX_ON && zzfx(1,.05,400,.01,.1,.15,0,2,0,0,200,.05),
    success: () => SFX_ON && zzfx(1,.05,537,.02,.02,.22,1,1.59,-6.98,4.97),
    hover:   () => SFX_ON && zzfx(.4,.05,1200,0,.005,.025,0,1.5),
    pop:     () => SFX_ON && zzfx(1,.1,700,0,.01,.05,0,2),
    sparkle: () => SFX_ON && zzfx(.6,.05,1600,0,.01,.15,0,3,20),
  };
  const sToggle = document.getElementById('soundToggle');
  if (sToggle) {
    sToggle.classList.toggle('on', SFX_ON);
    sToggle.setAttribute('aria-pressed', SFX_ON);
    sToggle.addEventListener('click', e => {
      window.SFX_ON = !SFX_ON;
      state.sound = SFX_ON;
      saveState(state);
      e.currentTarget.classList.toggle('on', SFX_ON);
      e.currentTarget.setAttribute('aria-pressed', SFX_ON);
      if (SFX_ON) SFX.confirm();
    });
  }

  /* ── Lab helper namespace (per spec §3) ──────────────────────── */
  window.Lab = {
    motionOK() { return !window.matchMedia('(prefers-reduced-motion: reduce)').matches; },
    loadState, saveState,

    /* makeDraggable: returns an unsubscribe fn. Emits CustomEvents
       `lab:dragstart`, `lab:dragmove`, `lab:dragend` on the element with
       { detail: { x, y, dx, dy, source: 'pointer'|'keyboard' } }.
       Pointer Events cover mouse + touch + pen in one handler — replaces
       broken-on-touch HTML5 drag. */
    makeDraggable(el, opts = {}) {
      el.style.touchAction = 'none';
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      let active = false, x0 = 0, y0 = 0;
      const onDown = (e) => {
        active = true; x0 = e.clientX; y0 = e.clientY;
        try { el.setPointerCapture(e.pointerId); } catch {}
        el.classList.add('dragging');
        el.dispatchEvent(new CustomEvent('lab:dragstart', { detail: { x: e.clientX, y: e.clientY, dx: 0, dy: 0, source: 'pointer' } }));
      };
      const onMove = (e) => {
        if (!active) return;
        el.dispatchEvent(new CustomEvent('lab:dragmove', { detail: { x: e.clientX, y: e.clientY, dx: e.clientX - x0, dy: e.clientY - y0, source: 'pointer' } }));
      };
      const onUp = (e) => {
        if (!active) return;
        active = false;
        el.classList.remove('dragging');
        try { el.releasePointerCapture(e.pointerId); } catch {}
        el.dispatchEvent(new CustomEvent('lab:dragend', { detail: { x: e.clientX, y: e.clientY, dx: e.clientX - x0, dy: e.clientY - y0, source: 'pointer' } }));
      };
      el.addEventListener('pointerdown', onDown);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);
      // Keyboard alternative: Enter cycles to the next drop zone if `opts.cycle` is given.
      if (opts.cycle) {
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.cycle(el); }
        });
      }
      return () => {
        el.removeEventListener('pointerdown', onDown);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
        el.removeEventListener('pointercancel', onUp);
      };
    },

    /* makeDropZone: callback fires when a draggable is released over this
       zone. Works for pointer drag (via hit-testing) and HTML5 drag
       (legacy fallback). */
    makeDropZone(el, onDrop) {
      let armed = false;
      const arm = () => { armed = true; el.classList.add('drop-hover'); };
      const disarm = () => { armed = false; el.classList.remove('drop-hover'); };
      el.addEventListener('lab:dragenter', arm);
      el.addEventListener('lab:dragleave', disarm);
      // Pointer drop: listen on document for dragend within bounds
      document.addEventListener('lab:dragend', (e) => {
        const r = el.getBoundingClientRect();
        if (e.detail.x >= r.left && e.detail.x <= r.right && e.detail.y >= r.top && e.detail.y <= r.bottom) {
          onDrop(e.target, e.detail);
          SFX.pop();
        }
        disarm();
      });
      // HTML5 drag fallback for legacy mounts
      el.addEventListener('dragover', e => { e.preventDefault(); arm(); });
      el.addEventListener('dragleave', disarm);
      el.addEventListener('drop', e => { e.preventDefault(); disarm(); onDrop(e.target, { html5: true, dataTransfer: e.dataTransfer }); });
    },

    /* makeSortable: turns each `.chip` inside the container into a touch-safe
       reorderable row with ▲/▼ buttons (and Home/End/Up/Down keyboard nav).
       Replaces the broken-on-touch native HTML5 drag for order-rank artifacts.
       Returns the container for chaining. */
    makeSortable(container) {
      const refresh = () => {
        const chips = [...container.querySelectorAll(':scope > .chip')];
        chips.forEach((chip, i) => {
          chip.removeAttribute('draggable');
          chip.setAttribute('tabindex', '0');
          chip.setAttribute('role', 'listitem');
          chip.setAttribute('aria-grabbed', 'false');
          if (!chip.dataset.sortText) chip.dataset.sortText = chip.textContent.trim();
          if (!chip.querySelector('.sort-handle')) {
            const handle = document.createElement('span');
            handle.className = 'sort-handle';
            handle.style.cssText = 'float:right;display:inline-flex;gap:4px;margin-left:8px';
            handle.innerHTML = `<button class="sort-up" aria-label="Move up" style="padding:1px 6px;border:1px solid var(--rule);background:var(--paper);border-radius:3px;cursor:pointer;font-size:11px">▲</button><button class="sort-dn" aria-label="Move down" style="padding:1px 6px;border:1px solid var(--rule);background:var(--paper);border-radius:3px;cursor:pointer;font-size:11px">▼</button>`;
            chip.appendChild(handle);
            handle.querySelector('.sort-up').onclick = e => { e.stopPropagation(); const p = chip.previousElementSibling; if (p && p.classList.contains('chip')) { container.insertBefore(chip, p); SFX.pop(); chip.focus(); refresh(); } };
            handle.querySelector('.sort-dn').onclick = e => { e.stopPropagation(); const n = chip.nextElementSibling; if (n && n.classList.contains('chip')) { container.insertBefore(n, chip); SFX.pop(); chip.focus(); refresh(); } };
          }
          chip.onkeydown = (e) => {
            if (e.key === 'ArrowUp') { e.preventDefault(); chip.querySelector('.sort-up').click(); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); chip.querySelector('.sort-dn').click(); }
          };
        });
      };
      container.setAttribute('role', 'list');
      refresh();
      return container;
    },

    /* gateSMIL: in reduced-motion mode, strip SVG <animate>/<animateTransform>
       elements from the given stage so users don't see a 0-width starting
       state followed by a static frame. The stage is mounted, then this is
       called once. Safe to call unconditionally. */
    gateSMIL(stage) {
      if (Lab.motionOK()) return;
      stage.querySelectorAll('animate, animateTransform, animateMotion').forEach(a => a.remove());
    },

    /* Variable-ratio micro-moment. Called by openFocus on every artifact open.
       Fires on a non-deterministic cadence (every 3–7 opens) — a subtle saffron
       pulse on the close button + a single line in the footer. */
    maybeFireMicroMoment(opensSoFar) {
      if (!Lab.motionOK()) return;
      const cadence = state._nextMicroAt || Math.floor(3 + Math.random() * 5);
      if (opensSoFar < cadence) return;
      state._nextMicroAt = opensSoFar + Math.floor(3 + Math.random() * 5);
      saveState(state);
      const closeBtn = document.getElementById('closeBtn');
      const footer = document.getElementById('focusFooter');
      if (closeBtn) {
        closeBtn.style.transition = 'background 200ms, transform 200ms';
        closeBtn.style.background = 'var(--accent)';
        closeBtn.style.transform = 'scale(1.12)';
        setTimeout(() => { closeBtn.style.background = ''; closeBtn.style.transform = ''; }, 900);
      }
      if (footer) {
        const ticker = document.createElement('div');
        ticker.style.cssText = 'margin-top:8px;padding-top:8px;border-top:1px dashed var(--rule);font-family:ui-monospace,monospace;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--accent-strong,var(--accent));opacity:0;transition:opacity 400ms';
        ticker.textContent = `You've opened ${opensSoFar} artifacts in this session · ${ART.length - opensSoFar} more in this gallery`;
        footer.appendChild(ticker);
        requestAnimationFrame(() => requestAnimationFrame(() => ticker.style.opacity = '1'));
      }
      SFX.sparkle();
    },
  };

  /* ── Build the card grid (cards are <a href="#ID"> per rule U5) ─ */
  function modalityGlyph(type) { return type === 'anim' ? '▶' : type === 'inter' ? '◐' : '☷'; }
  function verbPrefix(type) { return type === 'anim' ? 'Watch:' : type === 'inter' ? 'Try:' : ''; }

  function buildGrid(f='') {
    grid.innerHTML = '';
    ART.filter(a => !f || a.lesson === f).forEach(a => {
      const card = document.createElement('a');
      card.className = 'card';
      card.href = '#' + a.id;
      card.dataset.id = a.id;
      card.setAttribute('aria-label', `${a.type === 'anim' ? 'Animation' : 'Interactive'}: ${a.title}`);
      card.innerHTML = `<div class="id"><span class="badge ${a.type==='anim'?'anim':'inter'}">${a.type==='anim'?'ANIM':'INTER'}</span>${a.id}</div>
        <div class="title">${modalityGlyph(a.type)} ${a.title}</div>
        <div class="what">${verbPrefix(a.type)} ${a.what.replace(/^(Watch|Try):\s*/i, '')}</div>
        <div class="lesson-label">${a.lesson} · ${COURSE.lessons[a.lesson] || ''}</div>`;
      card.addEventListener('click', e => {
        // Allow middle/cmd/ctrl click to open in new tab; otherwise hijack
        if (e.button === 1 || e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        openFocus(a.id);
      });
      grid.appendChild(card);
    });
  }
  if (filter) filter.onchange = e => { SFX.click(); buildGrid(e.target.value); };
  buildGrid();

  /* ── Focus dialog (with backdrop click close + arrow nav) ─────── */
  let curIdx = -1;
  let lastFocusedCard = null;
  focus.setAttribute('aria-labelledby', 'focusTitle');
  focus.setAttribute('aria-modal', 'true');
  focus.setAttribute('role', 'dialog');
  const focusTitleEl = document.getElementById('focusTitle');
  focusTitleEl.setAttribute('tabindex', '-1');
  function openFocus(id) {
    SFX.click();
    lastFocusedCard = document.activeElement;
    curIdx = ART.findIndex(a => a.id === id);
    renderFocus();
    // showModal can throw if the iframe sandbox blocks it (older browsers
    // without allow-modals). Fall back to non-modal `open` so the artifact
    // still renders inline.
    if (!focus.open) {
      try { focus.showModal(); }
      catch { focus.setAttribute('open', ''); }
    }
    focusTitleEl.focus();
    history.replaceState(null, '', '#' + id);
    state.opens = (state.opens || 0) + 1;
    saveState(state);
    setTimeout(() => Lab.maybeFireMicroMoment(state.opens), 400);
    // Notify a parent page (if we're inside an iframe) that an artifact has
    // been opened and what its content height is, so the host can resize.
    if (window.self !== window.top) {
      requestAnimationFrame(() => {
        const h = focus.scrollHeight || document.body.scrollHeight;
        window.parent.postMessage({ type: 'krit:anim-lab:height', h, id, opens: state.opens }, '*');
      });
    }
  }
  function renderFocus() {
    const a = ART[curIdx]; if (!a) return;
    document.getElementById('focusId').textContent = a.id;
    focusTitleEl.textContent = a.title;
    const meta = a.scaffold ? ` · scaffold ${a.scaffold}/4` : '';
    document.getElementById('focusFooter').innerHTML = `<strong>${a.lesson} · ${a.type}${meta}</strong> · ${a.footer || a.what}`;
    const stage = document.getElementById('stage'); stage.innerHTML = '';
    a.mount(stage);
    Lab.gateSMIL(stage);
  }
  function closeFocus() {
    SFX.click();
    focus.close();
    history.replaceState(null, '', '#');
    if (lastFocusedCard && lastFocusedCard.focus) { try { lastFocusedCard.focus(); } catch {} }
  }
  document.getElementById('closeBtn').onclick = closeFocus;
  document.getElementById('prevBtn').onclick = () => { SFX.click(); curIdx = (curIdx-1+ART.length)%ART.length; renderFocus(); focusTitleEl.focus(); history.replaceState(null,'','#'+ART[curIdx].id); };
  document.getElementById('nextBtn').onclick = () => { SFX.click(); curIdx = (curIdx+1)%ART.length; renderFocus(); focusTitleEl.focus(); history.replaceState(null,'','#'+ART[curIdx].id); };
  focus.addEventListener('close', () => {
    if (lastFocusedCard && lastFocusedCard.focus) { try { lastFocusedCard.focus(); } catch {} }
  });

  // Backdrop click closes the dialog (rule U5)
  focus.addEventListener('click', e => {
    const r = focus.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) { focus.close(); history.replaceState(null,'','#'); }
  });

  // Keyboard nav
  document.addEventListener('keydown', e => {
    if (!focus.open) return;
    if (e.key === 'ArrowLeft') document.getElementById('prevBtn').click();
    if (e.key === 'ArrowRight') document.getElementById('nextBtn').click();
  });

  // Deep-link from URL hash
  const hash = window.location.hash.slice(1);
  if (hash && ART.some(a => a.id === hash)) openFocus(hash);

  // Solo mode for iframe embeds: when ?solo=1 (or inside an iframe with a
  // hash) hide the card grid + topbar so only the focus dialog shows. The
  // dialog already auto-opens via the deep-link above.
  const inIframe = window.self !== window.top;
  const soloParam = new URLSearchParams(window.location.search).get("solo") === "1";
  if (soloParam || (inIframe && hash)) {
    document.body.classList.add("solo-mode");
    const style = document.createElement("style");
    style.textContent = `
      body.solo-mode .topbar, body.solo-mode main, body.solo-mode .lede { display: none !important; }
      body.solo-mode dialog.focus { position: static; width: 100%; max-width: none; max-height: none; margin: 0; border: 0; box-shadow: none; }
      body.solo-mode dialog.focus::backdrop { display: none; }
      body.solo-mode dialog.focus .stage { min-height: 0; }
      body.solo-mode { background: var(--paper); overflow: hidden; }
    `;
    document.head.appendChild(style);
    // Move the hidden chrome out of the a11y tree so screen readers don't
    // navigate to invisible cards (Pass-2 review item #10).
    document.querySelector('header.topbar')?.setAttribute('aria-hidden', 'true');
    document.querySelector('main')?.setAttribute('aria-hidden', 'true');
    // Watch for content changes inside the stage (Check button reveals,
    // slider verdicts, etc.) and re-post the height so the host iframe can
    // grow/shrink with the content.
    const stage = document.getElementById('stage');
    if (stage && inIframe) {
      const post = () => {
        const h = focus.scrollHeight || document.body.scrollHeight;
        window.parent.postMessage({ type: 'krit:anim-lab:height', h }, '*');
      };
      const ro = new ResizeObserver(post);
      ro.observe(stage);
      // Initial post after first paint.
      requestAnimationFrame(() => requestAnimationFrame(post));
    }
  }
})();
