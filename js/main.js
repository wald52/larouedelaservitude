import { ENTRIES } from './entries.js';

console.log(ENTRIES);

const container = document.getElementById('entries-container');
if (container) {
  ENTRIES.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = entry;
    container.appendChild(li);
  });
}
