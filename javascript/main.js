// js/home.js
(function () {
  const form = document.getElementById('filtro-form');
  if (!form) {
    console.error('[CasaUni] Form #filtro-form não encontrado');
    return;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    // junta os textos (bairro e/ou busca livre) em um só "q"
    const q = [fd.get('bairro'), fd.get('search')]
      .map(v => (v || '').trim())
      .filter(Boolean)
      .join(' ')
      .slice(0, 200); // segurança

    // guarda p/ próxima página
    try { sessionStorage.setItem('casauni:q', q); } catch {}

    // também no URL (bom pra compartilhar link)
    const qs = new URLSearchParams();
    if (q) qs.set('q', q);

    // navega (ajuste o caminho se seu imoveis.html estiver em pasta)
    window.location.assign('./imoveis.html' + (qs.toString() ? `?${qs}` : ''));
  });
})();
