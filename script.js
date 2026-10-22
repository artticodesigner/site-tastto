// Menu
const menuBtn = document.querySelector('.btn-menu');
const menu = document.querySelector('.nav-menu');

menuBtn.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});

menu.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    menu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', false);
  })
);

// Equipe: setas rolam o trilho um card por vez
const equipeTrilho = document.querySelector('.equipe-trilho');
const equipeSetas = document.querySelectorAll('.equipe-seta');

function atualizarSetasEquipe() {
  const fim = equipeTrilho.scrollWidth - equipeTrilho.clientWidth - 2;
  equipeSetas[0].disabled = equipeTrilho.scrollLeft <= 2;
  equipeSetas[1].disabled = equipeTrilho.scrollLeft >= fim;
}

equipeSetas.forEach((seta) =>
  seta.addEventListener('click', () => {
    const card = equipeTrilho.querySelector('.equipe-card');
    const passo = card.offsetWidth + parseFloat(getComputedStyle(equipeTrilho).gap);
    equipeTrilho.scrollBy({ left: passo * Number(seta.dataset.dir) });
  })
);
// Arrastar com o mouse (no toque o navegador já rola sozinho)
let equipeArrasto = null;

equipeTrilho.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse' || e.button !== 0) return;
  equipeArrasto = { x: e.clientX, scroll: equipeTrilho.scrollLeft, moveu: false };
  equipeTrilho.classList.add('arrastando');
  equipeTrilho.setPointerCapture(e.pointerId);
});

equipeTrilho.addEventListener('pointermove', (e) => {
  if (!equipeArrasto) return;
  const dx = e.clientX - equipeArrasto.x;
  if (Math.abs(dx) > 3) equipeArrasto.moveu = true;
  equipeTrilho.scrollLeft = equipeArrasto.scroll - dx;
});

function soltarEquipe() {
  if (!equipeArrasto) return;
  equipeArrasto = null;
  // devolve o encaixe: o trilho assenta no card mais próximo
  const pos = equipeTrilho.scrollLeft;
  equipeTrilho.classList.remove('arrastando');
  equipeTrilho.scrollLeft = pos;
}
equipeTrilho.addEventListener('pointerup', soltarEquipe);
equipeTrilho.addEventListener('pointercancel', soltarEquipe);
equipeTrilho.addEventListener('dragstart', (e) => e.preventDefault());

equipeTrilho.addEventListener('scroll', atualizarSetasEquipe, { passive: true });
window.addEventListener('resize', atualizarSetasEquipe);
atualizarSetasEquipe();

// Depoimentos: abre o vídeo do Instagram num pop-up
const videoModal = document.querySelector('.video-modal');
const videoFrame = videoModal.querySelector('iframe');

function closeVideo() {
  videoModal.hidden = true;
  videoFrame.src = '';
  document.body.style.overflow = '';
}

document.querySelectorAll('.depoimento').forEach((btn) =>
  btn.addEventListener('click', () => {
    videoFrame.src = `https://www.instagram.com/p/${btn.dataset.post}/embed/`;
    videoModal.hidden = false;
    document.body.style.overflow = 'hidden';
  })
);
videoModal.querySelector('.video-modal-close').addEventListener('click', closeVideo);
videoModal.addEventListener('click', (e) => { if (e.target === videoModal) closeVideo(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !videoModal.hidden) closeVideo(); });

// Formulário de contato: valida e monta a mensagem
// TODO: definir pra onde o formulário envia (número de WhatsApp da Tastto, só dígitos com DDI: 5584...)
const WHATSAPP_TASTTO = '';

const contatoForm = document.querySelector('.contato-form');
const contatoAviso = contatoForm.querySelector('.contato-aviso');

function avisar(texto, erro) {
  contatoAviso.textContent = texto;
  contatoAviso.classList.toggle('erro', erro);
}

contatoForm.addEventListener('input', (e) => e.target.classList.remove('invalido'));
contatoForm.addEventListener('change', (e) => {
  if (e.target.name === 'operacao') contatoForm.querySelector('.opcoes').classList.remove('invalido');
});

contatoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let ok = true;
  contatoForm.querySelectorAll('input:not([type=radio]), select').forEach((campo) => {
    const valido = campo.checkValidity();
    campo.classList.toggle('invalido', !valido);
    if (!valido) ok = false;
  });
  const operacao = contatoForm.querySelector('input[name=operacao]:checked');
  contatoForm.querySelector('.opcoes').classList.toggle('invalido', !operacao);
  if (!operacao) ok = false;

  if (!ok) return avisar('Preencha os campos marcados com *.', true);

  const d = Object.fromEntries(new FormData(contatoForm));
  const insta = '@' + d.instagram.trim().replace(/^@+/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '');
  const texto = [
    'Olá, Tastto! Vim pelo site.',
    `Nome: ${d.nome}`,
    `Restaurante: ${d.empresa}`,
    `Instagram: ${insta}`,
    `WhatsApp: ${d.whatsapp}`,
    `E-mail: ${d.email}`,
    `Operação: ${d.operacao}`,
    `Faturamento mensal: ${d.faturamento}`,
    d.mensagem.trim() && `Mensagem: ${d.mensagem.trim()}`,
  ].filter(Boolean).join('\n');

  if (!WHATSAPP_TASTTO) return avisar('Envio ainda não configurado.', true);
  window.open(`https://wa.me/${WHATSAPP_TASTTO}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
  avisar('Tudo certo! Finalize o envio no WhatsApp.', false);
  contatoForm.reset();
});

// FAQ: abre/fecha com animação, uma pergunta aberta por vez
const faqItems = document.querySelectorAll('.faq-item');
const faqDuration = 300;

function toggleFaq(item, open) {
  const answer = item.querySelector('.faq-answer');
  if (open) item.open = true;
  const full = answer.scrollHeight;
  const anim = answer.animate(
    { height: open ? ['0px', `${full}px`] : [`${full}px`, '0px'] },
    { duration: faqDuration, easing: 'ease' }
  );
  anim.onfinish = () => { if (!open) item.open = false; };
}

faqItems.forEach((item) =>
  item.querySelector('summary').addEventListener('click', (e) => {
    e.preventDefault();
    const opening = !item.open;
    if (opening) faqItems.forEach((other) => other !== item && other.open && toggleFaq(other, false));
    toggleFaq(item, opening);
  })
);

// Carrossel de serviços
const track = document.querySelector('.carousel-track');
const cards = track.querySelectorAll('.card');
const prevBtn = document.querySelector('.carousel-arrow.prev');
const nextBtn = document.querySelector('.carousel-arrow.next');
let index = 0;

const step = () => cards[0].offsetWidth + parseFloat(getComputedStyle(track).gap);

function goTo(i) {
  index = Math.max(0, Math.min(i, cards.length - 1));
  track.style.transform = `translateX(${-index * step()}px)`;
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === cards.length - 1;
}

prevBtn.addEventListener('click', () => goTo(index - 1));
nextBtn.addEventListener('click', () => goTo(index + 1));
window.addEventListener('resize', () => goTo(index));

// Arrastar (mouse e toque)
let startX = 0;
let deltaX = 0;
let dragging = false;

track.addEventListener('pointerdown', (e) => {
  dragging = true;
  startX = e.clientX;
  deltaX = 0;
  track.classList.add('dragging');
  track.setPointerCapture(e.pointerId);
});

track.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  deltaX = e.clientX - startX;
  track.style.transform = `translateX(${-index * step() + deltaX}px)`;
});

function endDrag() {
  if (!dragging) return;
  dragging = false;
  track.classList.remove('dragging');
  const threshold = step() * 0.25;
  if (deltaX < -threshold) goTo(index + 1);
  else if (deltaX > threshold) goTo(index - 1);
  else goTo(index);
}

track.addEventListener('pointerup', endDrag);
track.addEventListener('pointercancel', endDrag);
