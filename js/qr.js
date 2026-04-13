/* ============================================================
   qr.js — QR code generation using qrcode-generator (CDN-free, inline)
   Uses the lightweight built-in Canvas API to draw a simple QR code
   Or auto-detects the current URL to show it as the QR target.
   ============================================================ */

/**
 * Simple QR code display.
 * If the site is deployed to GitHub Pages, the URL will be real.
 * We generate the QR using the qrcode-generator library loaded inline.
 * As fallback we show the URL text and instructions.
 */
async function initQR() {
  const urlEl     = document.getElementById('qr-url');
  const canvas    = document.getElementById('qr-canvas');
  const placeholder = document.getElementById('qr-placeholder');

  // Determine the site URL
  const siteUrl = window.location.origin + window.location.pathname;
  const cleanUrl = siteUrl.replace(/\/(index\.html)?$/, '') || window.location.href;

  if (urlEl) urlEl.textContent = cleanUrl;

  // Only render QR on real deployed URLs (not localhost/file)
  const isReal = !cleanUrl.startsWith('file://') && !cleanUrl.includes('localhost') && !cleanUrl.includes('127.0.0.1');

  if (!isReal) {
    // Dev / local: just show instructions
    if (placeholder) {
      placeholder.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="#ccc" stroke-width="2"/><rect x="8" y="8" width="8" height="8" fill="#ccc"/><rect x="28" y="4" width="16" height="16" rx="2" stroke="#ccc" stroke-width="2"/><rect x="32" y="8" width="8" height="8" fill="#ccc"/><rect x="4" y="28" width="16" height="16" rx="2" stroke="#ccc" stroke-width="2"/><rect x="8" y="32" width="8" height="8" fill="#ccc"/><path d="M28 28h4v4h-4zM36 28h4v4h-4zM32 32h4v4h-4zM28 36h4v4h-4zM36 36h4v4h-4z" fill="#ccc"/></svg>
        <p style="color:#aaa;font-size:0.72rem">Deploy to GitHub Pages to generate your QR code</p>
      `;
    }
    return;
  }

  // Load qrcode.js dynamically from CDN
  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js');

    if (placeholder) placeholder.style.display = 'none';
    if (canvas) canvas.classList.remove('hidden');

    // Create a temp div for QRCode library
    const temp = document.createElement('div');
    temp.style.display = 'none';
    document.body.appendChild(temp);

    // eslint-disable-next-line no-undef
    new QRCode(temp, {
      text: cleanUrl,
      width: 160,
      height: 160,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });

    // Copy canvas to our canvas
    setTimeout(() => {
      const qrImg = temp.querySelector('img') || temp.querySelector('canvas');
      if (qrImg && canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = 160;
        canvas.height = 160;
        if (qrImg.tagName === 'CANVAS') {
          ctx.drawImage(qrImg, 0, 0, 160, 160);
        } else {
          const img = new Image();
          img.onload = () => ctx.drawImage(img, 0, 0, 160, 160);
          img.src = qrImg.src;
        }
      }
      temp.remove();
    }, 200);

  } catch (e) {
    // CDN failed — show the URL fallback
    if (placeholder) {
      placeholder.innerHTML = `
        <p style="word-break:break-all;font-size:0.72rem;color:#aaa;margin-top:0.5rem">
          ${cleanUrl}
        </p>
        <p style="font-size:0.65rem;color:#888;margin-top:0.5rem">Use any free QR generator with this URL</p>
      `;
    }
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

document.addEventListener('DOMContentLoaded', initQR);
