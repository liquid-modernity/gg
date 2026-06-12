let targets;
async function init(){
  targets = await (await fetch('/api/blogger-targets')).json();
  document.getElementById('targets').textContent = JSON.stringify(targets, null, 2);
  document.getElementById('preview').addEventListener('click', () => {
    const type = document.getElementById('type').value;
    const key = type === 'product' ? 'storeBlog' : 'mainBlog';
    document.getElementById('result').textContent = JSON.stringify({ title: document.getElementById('title').value, type, targetKey:key, target: targets.bloggerTargets[key] }, null, 2);
  });
}
init().catch((err)=>{ document.body.insertAdjacentHTML('beforeend', `<pre>${String(err.stack||err)}</pre>`); });
