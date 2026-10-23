// Página de inicio.
import '../layout.js';

const PRICE = 5;
const draws = [...document.querySelectorAll('.draw')];
const qtyInput = document.getElementById('qty');
const packs = [...document.querySelectorAll('.pack')];
const list = document.getElementById('unlock-list');

function update() {
  let q = Math.max(1, Math.min(500, parseInt(qtyInput.value) || 1));
  qtyInput.value = q;
  document.getElementById('sum-qty').textContent = q;
  document.getElementById('sum-total').textContent = 'S/ ' + (q * PRICE).toFixed(2);
  packs.forEach(p => p.classList.toggle('active', +p.dataset.qty === q));

  list.innerHTML = '';
  draws.forEach(d => {
    const min = +d.dataset.min;
    const on = q >= min;
    d.classList.toggle('unlocked', on);
    d.classList.toggle('locked', !on);
    d.querySelector('.badge').textContent = on ? 'Participas' : 'Bloqueado';

    const li = document.createElement('li');
    li.className = on ? 'on' : 'off';
    const name = d.querySelector('h3').textContent;
    li.innerHTML = `<span class="ic">${on ? '✓' : '🔒'}</span>` +
      (on ? `${name}` : `${name} — te faltan ${min - q} cupón${min - q > 1 ? 'es' : ''}`);
    list.appendChild(li);
  });
}

packs.forEach(p => p.addEventListener('click', () => { qtyInput.value = p.dataset.qty; update(); }));
document.getElementById('minus').onclick = () => { qtyInput.value = +qtyInput.value - 1; update(); };
document.getElementById('plus').onclick = () => { qtyInput.value = +qtyInput.value + 1; update(); };
qtyInput.addEventListener('input', update);
update();

// Cuenta regresiva al próximo domingo 8 p.m.
const target = new Date();
target.setDate(target.getDate() + ((7 - target.getDay()) % 7 || 7));
target.setHours(20, 0, 0, 0);
const pad = n => String(n).padStart(2, '0');
function tick() {
  let s = Math.max(0, Math.floor((target - new Date()) / 1000));
  document.getElementById('cd-d').textContent = pad(Math.floor(s / 86400)); s %= 86400;
  document.getElementById('cd-h').textContent = pad(Math.floor(s / 3600)); s %= 3600;
  document.getElementById('cd-m').textContent = pad(Math.floor(s / 60));
  document.getElementById('cd-s').textContent = pad(s % 60);
}
tick(); setInterval(tick, 1000);
