document.addEventListener('DOMContentLoaded', function () {
    // Lógica para as abas principais
    const mainTabButtons = document.querySelectorAll('.tab-button');
    const mainTabContents = document.querySelectorAll('.tab-content');

    mainTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'active' de todos os botões e conteúdos principais
            mainTabButtons.forEach(btn => btn.classList.remove('active'));
            mainTabContents.forEach(content => content.classList.remove('active'));

            // Adiciona 'active' ao botão principal clicado
            button.classList.add('active');

            // Encontra e mostra o conteúdo principal correspondente
            const tabId = button.getAttribute('data-tab');
            const activeMainContent = document.getElementById(tabId);
            if (activeMainContent) {
                activeMainContent.classList.add('active');
            }
        });
    });

    // Lógica para as abas internas (sub-abas)
    const innerTabButtons = document.querySelectorAll('.inner-tab-button');
    const innerTabContents = document.querySelectorAll('.inner-tab-content');

    innerTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Encontra o contêiner pai da sub-aba
            const parentContainer = button.closest('.tab-content');
            if (!parentContainer) return;

            // Remove a classe 'active' de todos os botões e conteúdos DENTRO DO MESMO PAI
            const siblingButtons = parentContainer.querySelectorAll('.inner-tab-button');
            const siblingContents = parentContainer.querySelectorAll('.inner-tab-content');

            siblingButtons.forEach(btn => btn.classList.remove('active'));
            siblingContents.forEach(content => content.classList.remove('active'));

            // Adiciona a classe 'active' ao botão clicado
            button.classList.add('active');

            // Pega o ID da sub-aba a partir do atributo 'data-tab-content'
            const tabId = button.getAttribute('data-tab-content');

            // Adiciona a classe 'active' ao conteúdo da sub-aba correspondente
            const activeInnerContent = document.getElementById(tabId);
            if (activeInnerContent) {
                activeInnerContent.classList.add('active');
            }
        });
    });
});

// script.js - zoom + pan para #img-mapa
const container = document.querySelector('.map-container');
const img = document.getElementById('img-mapa');

let scale = 1;
const minScale = 1;
const maxScale = 4;

let tx = 0, ty = 0;
let isPanning = false;
let startX = 0, startY = 0;
let startTx = 0, startTy = 0;

const pointers = new Map();
let lastDist = 0;

function update() {
  img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
}

function clampTranslate() {
  const cw = container.clientWidth;
  const ch = container.clientHeight;
  const iw = img.clientWidth;
  const ih = img.clientHeight;
  const sw = iw * scale;
  const sh = ih * scale;

  // eixo X
  if (sw <= cw) {
    tx = (cw - sw) / 2;
  } else {
    const minX = cw - sw;
    tx = Math.min(0, Math.max(minX, tx));
  }

  // eixo Y
  if (sh <= ch) {
    ty = (ch - sh) / 2;
  } else {
    const minY = ch - sh;
    ty = Math.min(0, Math.max(minY, ty));
  }
}

function setScale(newScale, centerX, centerY) {
  newScale = Math.max(minScale, Math.min(maxScale, newScale));
  const prevScale = scale;
  if (newScale === prevScale) return;

  // Ajusta translate para manter o ponto (centerX, centerY) fixo
  tx = centerX - ((centerX - tx) * (newScale / prevScale));
  ty = centerY - ((centerY - ty) * (newScale / prevScale));

  scale = newScale;
  clampTranslate();
  update();
}

/* WHEEL ZOOM */
container.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = container.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  const delta = -e.deltaY;
  const zoom = delta > 0 ? 1.12 : 0.88; // ajuste de sensibilidade
  setScale(scale * zoom, cx, cy);
}, { passive: false });

/* POINTER / TOUCH (pan + pinch) */
container.addEventListener('pointerdown', (e) => {
  container.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (pointers.size === 1) {
    isPanning = true;
    startX = e.clientX;
    startY = e.clientY;
    startTx = tx;
    startTy = ty;
    img.style.cursor = 'grabbing';
  } else if (pointers.size === 2) {
    // inicia pinch
    const pts = Array.from(pointers.values());
    lastDist = distance(pts[0], pts[1]);
  }
});

container.addEventListener('pointermove', (e) => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (pointers.size === 1 && isPanning) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    tx = startTx + dx;
    ty = startTy + dy;
    clampTranslate();
    update();
  } else if (pointers.size === 2) {
    const pts = Array.from(pointers.values());
    const dist = distance(pts[0], pts[1]);
    const rect = container.getBoundingClientRect();
    const cx = ((pts[0].x + pts[1].x) / 2) - rect.left;
    const cy = ((pts[0].y + pts[1].y) / 2) - rect.top;

    if (lastDist > 0) {
      const factor = dist / lastDist;
      setScale(scale * factor, cx, cy);
    }
    lastDist = dist;
  }
});

container.addEventListener('pointerup', (e) => {
  container.releasePointerCapture(e.pointerId);
  pointers.delete(e.pointerId);

  if (pointers.size === 0) {
    isPanning = false;
    img.style.cursor = 'grab';
  } else if (pointers.size === 1) {
    // reconfigura panning com o ponteiro que restou
    const remaining = Array.from(pointers.values())[0];
    startX = remaining.x;
    startY = remaining.y;
    startTx = tx;
    startTy = ty;
    isPanning = true;
  }
});

container.addEventListener('pointercancel', (e) => {
  pointers.delete(e.pointerId);
  isPanning = false;
  img.style.cursor = 'grab';
});

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

/* double click => reset (fit width) */
container.addEventListener('dblclick', (e) => {
  scale = 1;
  tx = 0;
  ty = 0;
  clampTranslate();
  update();
});

/* evita arrastar a imagem padrão */
img.addEventListener('dragstart', (e) => e.preventDefault());

/* recalcula ao carregar / redimensionar */
window.addEventListener('load', () => {
  clampTranslate();
  update();
});

window.addEventListener('resize', () => {
  clampTranslate();
  update();
});