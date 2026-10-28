// SvizzGPT Content Script Overlay
(function () {
  if (window.__svizzOverlayInitialized) return;
  window.__svizzOverlayInitialized = true;

  let overlayVisible = false;
  let isMinimized = false;
  let opacity = 1.0;
  let backendUrl = 'http://localhost:8000';

  // Load saved backend URL if configured
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['backendUrl'], (res) => {
      if (res.backendUrl) backendUrl = res.backendUrl;
    });
  }

  // Create Container & Shadow DOM to isolate styles completely from host page
  const host = document.createElement('div');
  host.id = 'svizz-overlay-extension-host';
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    
    .overlay-container {
      position: fixed;
      top: 60px;
      right: 40px;
      width: 480px;
      max-width: calc(100vw - 32px);
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: none;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-size: 13px;
      color: #1f2937;
      transition: opacity 0.15s ease;
    }

    .overlay-container.minimized {
      width: auto;
      max-width: 240px;
      border-radius: 20px;
      box-shadow: none;
    }

    .header {
      height: 32px;
      padding: 0 10px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: move;
      user-select: none;
      font-size: 11px;
      color: #6b7280;
    }

    .title { font-weight: 600; color: #374151; display: flex; items-center; gap: 4px; }
    .controls { display: flex; align-items: center; gap: 4px; }
    .btn { background: none; border: none; cursor: pointer; padding: 2px 5px; font-size: 11px; color: #6b7280; border-radius: 3px; }
    .btn:hover { background: rgba(0,0,0,0.06); color: #111827; }

    .messages {
      max-height: 40vh;
      overflow-y: auto;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #ffffff;
    }

    .msg-user {
      font-weight: 600;
      color: #111827;
      border-left: 2px solid #9ca3af;
      padding-left: 6px;
    }

    .msg-asst {
      background: #f9fafb;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #f3f4f6;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .input-bar {
      padding: 8px 10px;
      display: flex;
      gap: 6px;
      border-top: 1px solid #e5e7eb;
      background: #ffffff;
    }

    .textarea {
      flex: 1;
      border: none;
      outline: none;
      resize: none;
      font-size: 12px;
      line-height: 1.4;
      max-height: 100px;
      color: #1f2937;
    }

    .send-btn {
      background: #111827;
      color: #ffffff;
      border: none;
      border-radius: 4px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }
    .send-btn:hover { background: #000000; }
    .send-btn:disabled { opacity: 0.4; }

    .footer {
      padding: 3px 10px;
      font-size: 10px;
      color: #9ca3af;
      background: #f9fafb;
      border-top: 1px solid #f3f4f6;
      display: flex;
      justify-content: space-between;
    }
  `;
  shadow.appendChild(style);

  // Overlay DOM structure
  const container = document.createElement('div');
  container.className = 'overlay-container';
  container.style.display = 'none';
  shadow.appendChild(container);

  container.innerHTML = `
    <div class="header" id="dragHeader">
      <div class="title" id="titleBar">
        <span>Svizz Overlay</span>
        <span style="font-weight:normal; opacity:0.6;">(Groq)</span>
      </div>
      <div class="controls">
        <button class="btn" id="opacityBtn" title="Cycle opacity">100%</button>
        <button class="btn" id="minBtn" title="Minimize">_</button>
        <button class="btn" id="closeBtn" title="Close (Esc)">✕</button>
      </div>
    </div>
    <div class="messages" id="messagesArea" style="display:none;"></div>
    <div class="input-bar" id="inputBar">
      <textarea class="textarea" id="queryInput" rows="1" placeholder="Type prompt... (Enter sends)"></textarea>
      <button class="send-btn" id="sendBtn">Send</button>
    </div>
    <div class="footer" id="footerBar">
      <span>Ctrl+Space / Cmd+Space</span>
      <span id="statusText">Ready</span>
    </div>
  `;

  const messagesArea = container.querySelector('#messagesArea');
  const queryInput = container.querySelector('#queryInput');
  const sendBtn = container.querySelector('#sendBtn');
  const closeBtn = container.querySelector('#closeBtn');
  const minBtn = container.querySelector('#minBtn');
  const opacityBtn = container.querySelector('#opacityBtn');
  const dragHeader = container.querySelector('#dragHeader');
  const statusText = container.querySelector('#statusText');

  // Toggle Visibility
  function toggleOverlay() {
    overlayVisible = !overlayVisible;
    container.style.display = overlayVisible ? 'flex' : 'none';
    if (overlayVisible) {
      if (isMinimized) {
        expandOverlay();
      }
      setTimeout(() => queryInput.focus(), 50);
    }
  }

  function minimizeOverlay() {
    isMinimized = true;
    container.classList.add('minimized');
    messagesArea.style.display = 'none';
    container.querySelector('#inputBar').style.display = 'none';
    container.querySelector('#footerBar').style.display = 'none';
    minBtn.textContent = '□';
  }

  function expandOverlay() {
    isMinimized = false;
    container.classList.remove('minimized');
    if (messagesArea.children.length > 0) messagesArea.style.display = 'flex';
    container.querySelector('#inputBar').style.display = 'flex';
    container.querySelector('#footerBar').style.display = 'flex';
    minBtn.textContent = '_';
    queryInput.focus();
  }

  minBtn.onclick = (e) => {
    e.stopPropagation();
    if (isMinimized) expandOverlay();
    else minimizeOverlay();
  };

  closeBtn.onclick = () => {
    overlayVisible = false;
    container.style.display = 'none';
  };

  // Opacity Cycling (100% -> 80% -> 50% -> 25%)
  opacityBtn.onclick = () => {
    if (opacity === 1.0) opacity = 0.8;
    else if (opacity === 0.8) opacity = 0.5;
    else if (opacity === 0.5) opacity = 0.25;
    else opacity = 1.0;
    container.style.opacity = opacity;
    opacityBtn.textContent = Math.round(opacity * 100) + '%';
  };

  // Dragging support
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  dragHeader.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = container.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const x = Math.max(10, Math.min(window.innerWidth - 120, e.clientX - dragOffset.x));
    const y = Math.max(10, Math.min(window.innerHeight - 50, e.clientY - dragOffset.y));
    container.style.left = `${x}px`;
    container.style.top = `${y}px`;
    container.style.right = 'auto';
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  // Keyboard Shortcuts (Ctrl+Space or Cmd+Space or Cmd+Shift+S or Esc)
  window.addEventListener('keydown', (e) => {
    const isCmdOrCtrl = e.metaKey || e.ctrlKey;
    if ((isCmdOrCtrl && e.code === 'Space') || (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 's') || (e.altKey && e.code === 'Space')) {
      e.preventDefault();
      toggleOverlay();
    } else if (e.key === 'Escape' && overlayVisible) {
      overlayVisible = false;
      container.style.display = 'none';
    }
  });

  // Communication from background worker
  chrome.runtime?.onMessage?.addListener((msg) => {
    if (msg.action === 'toggle-overlay') {
      toggleOverlay();
    }
  });

  // Sending Chat
  async function handleSend() {
    const text = queryInput.value.trim();
    if (!text) return;

    queryInput.value = '';
    messagesArea.style.display = 'flex';

    // User message
    const userDiv = document.createElement('div');
    userDiv.className = 'msg-user';
    userDiv.textContent = text;
    messagesArea.appendChild(userDiv);

    // Assistant message placeholder
    const asstDiv = document.createElement('div');
    asstDiv.className = 'msg-asst';
    asstDiv.textContent = '...';
    messagesArea.appendChild(asstDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    statusText.textContent = 'Streaming...';
    sendBtn.disabled = true;

    try {
      const res = await fetch(`${backendUrl}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
          model: 'qwen/qwen3.8-27b'
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.substring(6));
              if (event.type === 'token') {
                fullContent += event.data;
                asstDiv.textContent = fullContent;
                messagesArea.scrollTop = messagesArea.scrollHeight;
              } else if (event.type === 'done') {
                asstDiv.textContent = event.data || fullContent;
              }
            } catch (err) {}
          }
        }
      }
      statusText.textContent = 'Ready';
    } catch (err) {
      asstDiv.textContent = `Error: ${err.message}. (Ensure backend server is running on ${backendUrl})`;
      statusText.textContent = 'Error';
    } finally {
      sendBtn.disabled = false;
    }
  }

  sendBtn.onclick = handleSend;
  queryInput.onkeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
})();
