/* =============================================
   ai-assistant.js — AI Chat Page
   CertifyChain
   ============================================= */

const chatHistory = [];

function fillPrompt(text) {
  const inp = document.getElementById('ai-input');
  if (inp) { inp.value = text; inp.focus(); }
}

async function sendMessage() {
  const input   = document.getElementById('ai-input');
  const msgsEl  = document.getElementById('ai-messages');
  const text    = input?.value.trim();
  if (!text) return;
  input.value = '';
  input.style.height = 'auto';

  // User bubble
  msgsEl.innerHTML += `
    <div class="chat-msg user">
      <div class="msg-from">You</div>
      <div class="msg-body">${escHtml(text)}</div>
    </div>`;

  // Typing
  const tid = 'typing-' + Date.now();
  msgsEl.innerHTML += `
    <div class="chat-msg assistant" id="${tid}">
      <div class="msg-from"><i class="ti ti-robot"></i> CertifyChain AI</div>
      <div class="typing-indicator"><span></span><span></span><span></span></div>
    </div>`;
  msgsEl.scrollTop = msgsEl.scrollHeight;

  const reply = await callAI(text);
  chatHistory.push({ role:'user', content:text });
  chatHistory.push({ role:'assistant', content:reply });

  const el = document.getElementById(tid);
  if (el) {
    el.innerHTML = `
      <div class="msg-from"><i class="ti ti-robot"></i> CertifyChain AI</div>
      <div class="msg-body">${reply.replace(/\n/g,'<br>')}</div>`;
    el.removeAttribute('id');
  }
  msgsEl.scrollTop = msgsEl.scrollHeight;
}

function clearChat() {
  chatHistory.length = 0;
  const msgs = document.getElementById('ai-messages');
  msgs.innerHTML = `
    <div class="chat-msg assistant">
      <div class="msg-from"><i class="ti ti-robot"></i> CertifyChain AI</div>
      <div class="msg-body">Chat cleared. How can I help you?</div>
    </div>`;
}

function escHtml(t) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(t));
  return d.innerHTML;
}

// ---- inject styles ----
const style = document.createElement('style');
style.textContent = `
.suggestion-chips{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;font-size:.82rem;color:var(--muted);margin-bottom:.75rem}
.chip{background:rgba(67,97,238,.1);border:1px solid rgba(67,97,238,.2);border-radius:100px;padding:.3rem .85rem;font-size:.8rem;color:var(--accent);cursor:pointer;transition:all .2s;font-family:var(--font-body)}
.chip:hover{background:rgba(67,97,238,.2)}
.ai-chat-card{flex:1;background:var(--panel);border:1px solid var(--border);border-radius:16px;display:flex;flex-direction:column;overflow:hidden;min-height:0}
.ai-chat-header{display:flex;align-items:center;gap:12px;padding:1rem 1.5rem;border-bottom:1px solid var(--border);background:var(--surface);flex-shrink:0}
.ai-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:#fff;flex-shrink:0}
.ai-chat-header strong{font-family:var(--font-head);font-size:.95rem;display:block}
.ai-chat-header p{color:var(--muted);font-size:.78rem;margin-top:1px}
.ai-messages{flex:1;overflow-y:auto;padding:1.25rem;display:flex;flex-direction:column;gap:1rem;min-height:0}
.ai-messages::-webkit-scrollbar{width:4px}
.ai-messages::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}
.ai-input-area{border-top:1px solid var(--border);padding:1rem 1.5rem;background:var(--surface);flex-shrink:0}
.ai-textarea{width:100%;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:.75rem 1rem;color:var(--text);font-family:var(--font-body);font-size:.9rem;resize:none;outline:none;transition:border-color .2s;line-height:1.5}
.ai-textarea:focus{border-color:var(--accent)}
.ai-input-actions{display:flex;align-items:center;justify-content:space-between;margin-top:.6rem}
.input-hint{font-size:.76rem;color:var(--muted)}
`;
document.head.appendChild(style);
