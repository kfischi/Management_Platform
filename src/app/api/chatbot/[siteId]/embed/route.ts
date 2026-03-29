/**
 * GET /api/chatbot/[siteId]/embed
 * Returns a self-contained JS widget that adds a floating chat button to any page.
 * Usage: <script src="https://yourapp.com/api/chatbot/[siteId]/embed"></script>
 */
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const origin = req.nextUrl.origin;

  const js = `
(function() {
  if (window.__wmaChatLoaded) return;
  window.__wmaChatLoaded = true;

  var SITE_ID = ${JSON.stringify(siteId)};
  var ORIGIN  = ${JSON.stringify(origin)};

  // Inject styles
  var style = document.createElement('style');
  style.textContent = [
    '#wma-chat-btn{position:fixed;bottom:24px;right:24px;z-index:9998;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#7c3aed);box-shadow:0 4px 20px rgba(99,102,241,.5);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s;}',
    '#wma-chat-btn:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(99,102,241,.6);}',
    '#wma-chat-btn svg{width:26px;height:26px;fill:white;}',
    '#wma-chat-panel{position:fixed;bottom:96px;right:24px;z-index:9999;width:360px;height:520px;border-radius:20px;overflow:hidden;box-shadow:0 12px 48px rgba(0,0,0,.22);border:1px solid rgba(0,0,0,.08);display:none;flex-direction:column;background:#fff;}',
    '#wma-chat-panel.open{display:flex;}',
    '#wma-chat-header{background:linear-gradient(135deg,#6366f1,#7c3aed);padding:14px 16px;display:flex;align-items:center;justify-content:space-between;}',
    '#wma-chat-header span{color:#fff;font-weight:700;font-size:15px;font-family:sans-serif;}',
    '#wma-close-btn{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.8);font-size:20px;line-height:1;padding:0;}',
    '#wma-chat-panel iframe{flex:1;border:none;width:100%;height:100%;}'
  ].join('');
  document.head.appendChild(style);

  // Button
  var btn = document.createElement('button');
  btn.id = 'wma-chat-btn';
  btn.setAttribute('aria-label', 'פתח צ\'אט');
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
  document.body.appendChild(btn);

  // Panel
  var panel = document.createElement('div');
  panel.id = 'wma-chat-panel';
  panel.innerHTML =
    '<div id="wma-chat-header">' +
      '<span>💬 דברו איתנו</span>' +
      '<button id="wma-close-btn" aria-label="סגור">✕</button>' +
    '</div>' +
    '<iframe src="' + ORIGIN + '/api/chat/' + SITE_ID + '/widget" allow="microphone"></iframe>';
  document.body.appendChild(panel);

  btn.addEventListener('click', function() {
    panel.classList.add('open');
    btn.style.display = 'none';
  });
  document.getElementById('wma-close-btn').addEventListener('click', function() {
    panel.classList.remove('open');
    btn.style.display = 'flex';
  });
})();
`;

  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
