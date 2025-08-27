js
// Starter HTML content
const starter = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Preview — TheRealAnonymousRSA</title>
    <style>body{font-family:system-ui,Segoe UI,Roboto,Arial;padding:24px}h1{margin:0}.box{padding:12px;border-radius:8px;border:1px solid #eee}</style>
  </head>
  <body>
    <h1>VPN Demo (Preview)</h1>
    <p>This is sample preview HTML — it's rendered from the editor.</p>
    <div class="box">Right pane shows what your HTML produces.</div>
  </body>
</html>`;

// DOM refs
const editorTextarea = document.getElementById('editor');
const previewFrame = document.getElementById('previewFrame');
const runBtn = document.getElementById('runBtn');
const downloadBtn = document.getElementById('downloadBtn');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const autoRun = document.getElementById('autoRun');
const allowScripts = document.getElementById('allowScripts');
const darkBtn = document.getElementById('darkBtn');
const charCount = document.getElementById('charCount');

// Insert starter
editorTextarea.value = starter;

// Initialize CodeMirror from the textarea
const cm = CodeMirror.fromTextArea(editorTextarea, {
  mode: 'htmlmixed',
  theme: 'monokai',
  lineNumbers: true,
  tabSize: 2,
  indentWithTabs: false,
  lineWrapping: true,
});

// char count
function updateCharCount() {
  charCount.textContent = `${cm.getValue().length} chars`;
}
cm.on('change', () => {
  updateCharCount();
  if (autoRun.checked) {
    if (window._autoRunTimer) clearTimeout(window._autoRunTimer);
    window._autoRunTimer = setTimeout(() => runPreview(), 250);
  }
});
updateCharCount();

// Sandbox update
function updateSandbox() {
  const base = ['allow-popups-to-escape-sandbox','allow-pointer-lock','allow-modals'];
  if (allowScripts.checked) base.push('allow-scripts','allow-forms');
  previewFrame.setAttribute('sandbox', base.join(' '));
}
allowScripts.addEventListener('change', updateSandbox);

// Run preview
function runPreview() {
  const src = cm.getValue();
  // Prefer srcdoc, fallback to writing into iframe document
  try {
    previewFrame.srcdoc = src;
  } catch (e) {
    const doc = previewFrame.contentWindow.document;
    doc.open();
    doc.write(src);
    doc.close();
  }
  // ensure sandbox is correct each run
  updateSandbox();
}
runBtn.addEventListener('click', runPreview);

// Download
downloadBtn.addEventListener('click', () => {
  const blob = new Blob([cm.getValue()], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'index.html';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});

// Upload
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    cm.setValue(String(r.result || ''));
    if (autoRun.checked) runPreview();
  };
  r.readAsText(f);
  e.target.value = '';
});

// Dark toggle
let dark = false;
darkBtn.addEventListener('click', () => {
  dark = !dark;
  document.documentElement.classList.toggle('dark', dark);
});

// Resizer
(function () {
  const resizer = document.getElementById('resizer');
  const left = document.getElementById('editorPane');
  const right = document.getElementById('previewPane');
  let dragging = false;
  resizer.addEventListener('mousedown', () => { dragging = true; document.body.style.cursor = 'col-resize'; });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rect = resizer.parentElement.getBoundingClientRect();
    let pct = (e.clientX - rect.left) / rect.width * 100;
    if (pct < 20) pct = 20; if (pct > 80) pct = 80;
    left.style.flex = `0 0 ${pct}%`;
    right.style.flex = '1';
    cm.refresh();
  });
  window.addEventListener('mouseup', () => { dragging = false; document.body.style.cursor = ''; });
})();

// initial render
updateSandbox();
runPreview();