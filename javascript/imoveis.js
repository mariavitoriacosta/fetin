// js/imoveis.js
const URL_JSON = 'json/imoveis.json';

// containers
const listaEl = document.getElementById('resultado') || document.querySelector('.house-gallery');
const titleEl = document.querySelector('.houses-found h1') || document.querySelector('h1');

// utils
const norm = (s='') => s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc  = (s='') => s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const parsePrecoBR = (p) => {
  if (typeof p === 'number') return p;
  if (!p) return 0;
  return Number(p.replace(/[^\d,]/g,'').replace(/\./g,'').replace(',', '.')) || 0;
};

// pega o texto digitado (URL ?q=... ou sessionStorage)
function getTextoFiltroBruto(){
  const qs = new URLSearchParams(location.search);
  let raw = qs.get('q') || qs.get('bairro') || '';
  if (!raw) {
    try { raw = sessionStorage.getItem('casauni:q') || ''; } catch {}
  }
  return (raw || '').trim();
}

// título dinâmico
function atualizarTitulo(raw){
  if (!titleEl) return;
  if (!raw) {
    titleEl.textContent = 'Imóveis encontrados';
  } else {
    titleEl.innerHTML = `Imóveis encontrados em <span class="hl">${esc(raw)}</span>`;
  }
}

// filtro (seu JSON usa "titulo" como bairro)
function aplicaFiltro(rows, raw) {
  const q = norm(raw);
  return rows
    .filter(r => !q || norm(`${r.titulo} ${r.fonte}`).includes(q))
    .sort((a,b) => parsePrecoBR(a.preco) - parsePrecoBR(b.preco));
}

// render
function cardHTML(r) {
  const img = r.imagem || 'img/placeholder.jpg';
  const titulo = r.titulo || '';
  const preco = r.preco || '';
  const fonte = r.fonte ? ` ${r.fonte}` : '';
  return `
    <a class="house-card" href="#" aria-label="${esc(titulo)}">
      <div class="img-wrapper">
        <img src="${img}" alt="${esc(titulo)}">
      </div>
      <div class="house-info">
        <p class="titulo">${esc(titulo)}</p>
        <p class="meta">${esc(preco)}
        <p class="fonte">Disponível em: ${esc(fonte)}</p>
      </div>
    </a>`;
}

function render(list) {
  if (!listaEl) return;
  if (!list.length) {
    listaEl.innerHTML = `<div style="background:#fff;border-radius:12px;padding:18px">Nenhum imóvel encontrado.</div>`;
    return;
  }
  listaEl.innerHTML = list.map(cardHTML).join('');
}

// fluxo principal
async function main() {
  const raw = getTextoFiltroBruto(); // <<< usa sempre a MESMA origem
  atualizarTitulo(raw);              // <<< ATUALIZA O H1 AQUI

  const res = await fetch(URL_JSON);
  if (!res.ok) throw new Error('Falha ao carregar imoveis.json');

  const todos = await res.json();
  const filtrados = aplicaFiltro(todos, raw);
  render(filtrados);
}

// aguarda DOM pra garantir que o <h1> exista
document.addEventListener('DOMContentLoaded', () => {
  main().catch(err => {
    console.error(err);
    if (listaEl) {
      listaEl.innerHTML = `<div style="background:#fff;border-radius:12px;padding:18px;color:#900">
        Erro ao carregar os imóveis.
      </div>`;
    }
  });
});
