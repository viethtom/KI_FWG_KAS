/* Einfache Passwortsperre für die Workshop-Website.
   Hinweis: Dies ist KEIN echter Zugriffsschutz. Der Seitenquelltext dieser
   statisch gehosteten Seite (GitHub Pages) ist grundsätzlich einsehbar; das
   Passwort wird hier nur als Hash gespeichert, um es nicht im Klartext im
   Quelltext zu zeigen. Für echten Zugriffsschutz ist ein Login mit
   serverseitiger Prüfung nötig. Diese Sperre hält lediglich zufällige
   Besucher:innen und Suchmaschinen fern. */
(function () {
  var STORAGE_KEY = 'fwgkas_gate_unlocked_v1';
  var EXPECTED_HASH = '77d5e3b435c7f25bae1224151330e4e09704ab3c7c2ec6d60afaa76a6a465f65';

  var overlay = document.getElementById('gate-overlay');
  if (!overlay) return;

  var form = document.getElementById('gate-form');
  var input = document.getElementById('gate-password');
  var error = document.getElementById('gate-error');

  function unlock() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
    overlay.style.display = 'none';
    document.documentElement.classList.remove('gate-locked');
  }

  var already = false;
  try { already = localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) {}
  if (already) {
    unlock();
    return;
  }

  if (input) {
    setTimeout(function () { input.focus(); }, 50);
  }

  async function sha256Hex(text) {
    var enc = new TextEncoder().encode(text);
    var buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.prototype.map
      .call(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, '0'); })
      .join('');
  }

  if (form) {
    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      if (error) error.hidden = true;
      var val = input ? input.value : '';
      var hash;
      try {
        hash = await sha256Hex(val);
      } catch (e) {
        if (error) {
          error.textContent = 'Passwortprüfung in diesem Browser nicht möglich (zu alter Browser oder keine sichere Verbindung).';
          error.hidden = false;
        }
        return;
      }
      if (hash === EXPECTED_HASH) {
        unlock();
      } else if (error) {
        error.textContent = 'Falsches Passwort. Bitte erneut versuchen.';
        error.hidden = false;
        if (input) { input.value = ''; input.focus(); }
      }
    });
  }
})();
