(()=>{
  const $ = (id) => document.getElementById(id);

  let currentKey = '';
  let isProduction = false;

  async function init(){
    // Health + mode
    try {
      const h = await (await fetch('/api/health')).json();
      $('health').textContent = JSON.stringify(h, null, 2);
      const mode = h.mode || 'local';
      $('mode').textContent = mode;
      if (mode !== 'local') isProduction = true;
    } catch(e){ $('health').textContent = 'Error: '+String(e); }

    // Config list
    try {
      const list = await (await fetch('/api/config-list')).json();
      if (!list.ok || !Array.isArray(list.keys)) throw new Error('Unexpected config-list response');
      const sel = $('keySelector');
      for (const entry of list.keys) {
        const opt = document.createElement('option');
        opt.value = entry.key;
        opt.textContent = `${entry.key} (${entry.path})`;
        sel.appendChild(opt);
      }
    } catch(e){
      $('status').textContent = 'Failed to load config keys: '+String(e);
      return;
    }

    // Key selector change
    $('keySelector').addEventListener('change', ()=>{
      currentKey = $('keySelector').value;
      $('editor').value = '';
      $('btnSave').disabled = true;
      $('bloggerNote').hidden = (currentKey !== 'blogger-targets');
      if (!currentKey) $('status').textContent = 'Select a config key.';
    });

    // Load button
    $('btnLoad').addEventListener('click', loadConfig);

    // Validate button
    $('btnValidate').addEventListener('click', validateEditor);

    // Save button
    $('btnSave').addEventListener('click', saveConfig);

    $('status').textContent = 'Ready. Select a config key and click Load.';
  }

  async function loadConfig(){
    if (!currentKey){ setStatus('error','Select a config key first.'); return; }
    setStatus('info','Loading...');
    try {
      const r = await (await fetch('/api/config/'+encodeURIComponent(currentKey))).json();
      if (!r.ok) throw new Error(r.error||'Unknown error');
      $('editor').value = JSON.stringify(r.data, null, 2);
      $('btnSave').disabled = isProduction;
      setStatus('ok','Loaded '+currentKey);
    } catch(e){
      setStatus('error','Load failed: '+String(e));
    }
  }

  function validateEditor(){
    const raw = $('editor').value.trim();
    if (!raw){ setStatus('error','Editor is empty.'); return; }
    try {
      JSON.parse(raw);
      setStatus('ok','JSON is valid.');
    } catch(e){
      setStatus('error','Invalid JSON: '+String(e));
    }
  }

  async function saveConfig(){
    if (!currentKey){ setStatus('error','No config key selected.'); return; }
    if (isProduction){ setStatus('error','Write is disabled in production mode.'); return; }
    const raw = $('editor').value.trim();
    if (!raw){ setStatus('error','Editor is empty.'); return; }
    try { JSON.parse(raw); } catch(e){ setStatus('error','Invalid JSON. Fix before saving.'); return; }
    setStatus('info','Saving...');
    try {
      const r = await fetch('/api/config/'+encodeURIComponent(currentKey), {
        method:'PUT',
        headers:{'content-type':'application/json'},
        body: raw
      });
      const j = await r.json();
      if (!j.ok) throw new Error(Array.isArray(j.error)?j.error.join(', '):(j.error||'Failed'));
      setStatus('ok','Saved '+currentKey+' successfully.');
    } catch(e){
      setStatus('error','Save failed: '+String(e));
    }
  }

  function setStatus(type, msg){
    $('status').textContent = msg;
    $('status').className = 'status-'+type;
  }

  init().catch(e=>{ $('status').textContent = 'Init error: '+String(e); });
})();