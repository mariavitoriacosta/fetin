// js/destaques.js
const URL_JSON = 'json/imoveis.json';  // ajuste se sua pasta for outra
const track   = document.getElementById('dest-track');
const view    = document.getElementById('dest-viewport');
const btnL    = document.querySelector('#destaques .dest-left');
const btnR    = document.querySelector('#destaques .dest-right');

const esc = s => (s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const parsePrecoBR = p => (typeof p==='number'?p:Number((p||'').replace(/[^\d,]/g,'').replace(/\./g,'').replace(',','.'))||0);

function cardHTML(r){
  const img   = r.imagem || 'img/placeholder.jpg';
  const titulo= r.titulo || '';
  const preco = r.preco  || '';
  const fonte = r.fonte ? ` · ${r.fonte}` : '';
  return `
    <a class="house-card" href="imoveis.html" aria-label="${esc(titulo)}">
      <div class="img-wrapper"><img src="${img}" alt="${esc(titulo)}"></div>
      <div class="house-info">
        <p class="titulo">${esc(titulo)}</p>
        <p class="meta">${esc(preco)}${esc(fonte)}</p>
      </div>
    </a>`;
}

async function load(){
  try{
    const res = await fetch(URL_JSON);
    if(!res.ok) throw new Error('Falha ao carregar imoveis.json');
    const data = await res.json();

    // escolha quantos exibir (pode ordenar por preço, aleatorizar, etc.)
    const itens = data
      // .filter(x => x.disponivel !== false) // se um dia tiver a flag
      .sort((a,b)=> parsePrecoBR(a.preco) - parsePrecoBR(b.preco)) // exemplo: mais baratos primeiro
      .slice(0, 12);

    track.innerHTML = itens.map(cardHTML).join('');
    updateArrows();
    startAuto();
  }catch(e){
    console.error(e);
    track.innerHTML = '<div style="background:#fff;border-radius:12px;padding:18px">Não foi possível carregar os destaques.</div>';
  }
}

// util: largura de 1 “passo” (um card + gap)
function stepSize(){
  const card = track.querySelector('.house-card');
  if(!card) return 300;
  const gap = parseFloat(getComputedStyle(track).gap || 16);
  return card.getBoundingClientRect().width + gap;
}

// setas
function updateArrows(){
  const max = view.scrollWidth - view.clientWidth - 1;
  btnL.disabled = view.scrollLeft <= 0;
  btnR.disabled = view.scrollLeft >= max;
}
btnL.addEventListener('click', ()=> view.scrollBy({left: -stepSize(), behavior:'smooth'}));
btnR.addEventListener('click', ()=> view.scrollBy({left:  stepSize(), behavior:'smooth'}));
view.addEventListener('scroll', ()=> updateArrows());

// arraste com mouse/touch (opcional)
let isDown=false, startX=0, startLeft=0;
view.addEventListener('pointerdown', e=>{ isDown=true; startX=e.clientX; startLeft=view.scrollLeft; view.setPointerCapture(e.pointerId); stopAuto(); });
view.addEventListener('pointermove', e=>{ if(!isDown) return; view.scrollLeft = startLeft - (e.clientX-startX); });
view.addEventListener('pointerup',   ()=>{ isDown=false; startAuto(); });
view.addEventListener('pointercancel',()=>{ isDown=false; });

// auto-scroll
let timer=null;
function startAuto(){
  stopAuto();
  timer = setInterval(()=>{
    const max = view.scrollWidth - view.clientWidth - 1;
    if(view.scrollLeft >= max){ view.scrollTo({left:0, behavior:'smooth'}); }
    else { view.scrollBy({left: stepSize(), behavior:'smooth'}); }
  }, 3500);
}
function stopAuto(){ if(timer){ clearInterval(timer); timer=null; } }

// pausa autoplay quando fora de vista/hover
view.addEventListener('mouseenter', stopAuto);
view.addEventListener('mouseleave', startAuto);
document.addEventListener('visibilitychange', ()=> document.hidden ? stopAuto() : startAuto());

// start
document.addEventListener('DOMContentLoaded', load);
