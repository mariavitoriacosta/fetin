// js/home.js
(function () {
  const form = document.getElementById('filtro-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    // junta bairro + busca livre num único "q"
    const q = [fd.get('bairro'), fd.get('search')]
      .map(v => (v || '').trim())
      .filter(Boolean)
      .join(' ')
      .slice(0, 200);

    try { sessionStorage.setItem('casauni:q', q); } catch {}

    const qs = new URLSearchParams();
    if (q) qs.set('q', q);

    // ajuste o caminho se imoveis.html estiver em outra pasta
    window.location.assign('./imoveis.html' + (qs.toString() ? `?${qs}` : ''));
  });
})();
