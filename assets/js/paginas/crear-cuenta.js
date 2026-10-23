// Crear cuenta.
import '../layout.js';

document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault();
  document.getElementById('form-ok').style.display = 'block';
  e.target.reset();
});
