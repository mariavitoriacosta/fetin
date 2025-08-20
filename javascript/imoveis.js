// js/imoveis.js
const URL_JSON = 'json/imoveis.json';

// pega o container (id="resultado" ou fallback .house-gallery)
const lista =
  document.getElementById('resultado') ||
  document.querySelector('.house-gallery');

const norm = (s='') =>
  s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

// parse de "R$ 1.300,00" -> 1300.00 (pra ordenar por preço se quiser)
const parsePrecoBR = (p) => {
  if (typeof p === 'number') return p;
  if (!p) return NaN;
  return Number(p.replace(/[^\d,]/g,'').replace(/\./g,'').replace(',', '.'));
};

// lê o termo "q" da URL ou do sessionStorage
function getQueryTexto() {
  const qs = new URLSearchParams(location.search);
  let q = qs.get('q') || '';
  if (!q) {
    try { q = sessionStorage.getItem('casauni:q') || ''; } catch {}
  }
  return q.trim();
}

function aplicaFiltro(rows, qTexto) {
  const q = norm(qTexto);
  return rows
    // filtro por texto digitado: verifica em titulo (bairro) + fonte
    .filter(r => !q || norm(`${r.titulo} ${r.fonte}`).includes(q))
    .sort((a, b) => parsePrecoBR(a.preco) - parsePrecoBR(b.preco));
}

function cardHTML(r) {
  const img = r.imagem || 'img/placeholder.jpg';
  const titulo = r.titulo || '';
  const preco = r.preco || '';
  const fonte = r.fonte ? ` · ${r.fonte}` : '';

  // IMPORTANTE: .house-info é IRMÃ da .img-wrapper (fica ao lado no seu CSS)
  return `
    <a class="house-card" href="#" aria-label="${titulo}">
      <div class="img-wrapper">
        <img src="${img}" alt="${titulo}">
      </div>
      <div class="house-info">
        <p>${titulo}</p>
        <p style="font-weight:600;margin-top:6px">${preco}${fonte}</p>
      </div>
    </a>
  `;
}

function render(list) {
  if (!lista) return;
  if (!list.length) {
    lista.innerHTML = `<div style="background:#fff;border-radius:12px;padding:18px">
      Nenhum imóvel encontrado.
    </div>`;
    return;
  }
  lista.innerHTML = list.map(cardHTML).join('');
}

async function main() {
  try {
    const res = await fetch(URL_JSON);
    if (!res.ok) throw new Error('Falha ao carregar imoveis.json');
    const todos = await res.json();

    const qTexto = getQueryTexto();
    // debug opcional:
    // console.debug('[CasaUni] q:', qTexto, 'total:', todos.length);

    const filtrados = aplicaFiltro(todos, qTexto);
    render(filtrados);
  } catch (err) {
    console.error(err);
    if (lista) {
      lista.innerHTML = `<div style="background:#fff;border-radius:12px;padding:18px;color:#900">
        Erro ao carregar os imóveis.
      </div>`;
    }
  }
}

main();
