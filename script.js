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
