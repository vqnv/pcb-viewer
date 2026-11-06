import { boards } from './boards.js';

const panel = document.getElementById('board-info-panel');
const title = document.getElementById('board-title');
const context = document.getElementById('board-context');
const points = document.getElementById('board-points');
const tags = document.getElementById('board-tags');

function element(tag, text, className) {
  const el = document.createElement(tag);
  el.textContent = text;
  if (className) el.className = className;
  return el;
}

export function showBoardPanel(id) {
  const board = boards.find((b) => b.id === id);
  if (!board) return;
  title.textContent = board.title;
  context.textContent = board.context;
  points.replaceChildren(...board.points.map((text) => element('li', text)));
  tags.replaceChildren(...board.tags.map((text) => element('span', text, 'tech-tag')));
  panel.classList.add('active');
}

export function hideBoardPanel() {
  panel.classList.remove('active');
}
