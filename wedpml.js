// =====================
// NAVIGATION
// =====================
function goTwibbon() {
  window.location.href = "twibbon.html";
}

function goGame() {
  window.location.href = "ecogame.html";
}

function goStory() {
  window.location.href = "eco-story.html";
}

function openScene(scene) {
  window.location.href = "scene-" + scene + ".html";
}

function openPuzzle() {
  window.location.href = "puzzle.html";
}

// =====================
// TWIBBON ELEMENTS
// =====================
const upload = document.getElementById("upload");
const cameraFile = document.getElementById("cameraFile");
const photo = document.getElementById("photo");
const layer = document.getElementById("icon-layer");
const container = document.querySelector(".twibbon-container");
const sizeRange = document.getElementById("sizeRange");
const trashBin = document.getElementById("trashBin");

const cameraModal = document.getElementById("cameraModal");
const cameraVideo = document.getElementById("cameraVideo");

let selectedIcon = null;
let currentStream = null;

// =====================
// LOAD PHOTO
// =====================
function setPhotoFromFile(file) {
  if (!file || !photo) return;
  photo.src = URL.createObjectURL(file);
}

if (upload) {
  upload.addEventListener("change", (e) => {
    setPhotoFromFile(e.target.files[0]);
  });
}

if (cameraFile) {
  cameraFile.addEventListener("change", (e) => {
    setPhotoFromFile(e.target.files[0]);
  });
}

// =====================
// PUZZLE ELEMENTS
// =====================
const puzzleTray = document.getElementById("puzzleTray");
const puzzleBoard = document.getElementById("puzzleBoard");
const puzzleStatus = document.getElementById("puzzleStatus");

// =====================
// PUZZLE CONFIG
// =====================
const PUZZLE_W = 5361;
const PUZZLE_H = 2835;

const puzzlePieces = Array.from({ length: 15 }, (_, i) =>
  `Assets/puzzle/p${i + 1}.png`
);

let metaMap = {};
let order = [];
let placed = 0;

// =====================
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// =====================
function analyze(src) {
  return new Promise(res => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;

      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const data = ctx.getImageData(0, 0, c.width, c.height).data;

      let minX = c.width, minY = c.height, maxX = 0, maxY = 0;

      for (let y = 0; y < c.height; y++) {
        for (let x = 0; x < c.width; x++) {
          if (data[(y * c.width + x) * 4 + 3] > 0) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      const w = maxX - minX + 1;
      const h = maxY - minY + 1;

      const t = document.createElement("canvas");
      t.width = w;
      t.height = h;

      t.getContext("2d").drawImage(c, minX, minY, w, h, 0, 0, w, h);

      res({ src: t.toDataURL(), minX, minY, w, h });
    };
  });
}

// =====================
async function initPuzzle() {
  if (!puzzleTray || !puzzleBoard) return;

  for (const p of puzzlePieces) {
    metaMap[p] = await analyze(p);
  }

  order = shuffle(puzzlePieces);
  drawPuzzle();
}

// =====================
function drawPuzzle() {
  puzzleTray.innerHTML = "";
  puzzleBoard.querySelectorAll(".board-piece").forEach(p => p.remove());

  const rect = puzzleBoard.getBoundingClientRect();
  const sx = rect.width / PUZZLE_W;
  const sy = rect.height / PUZZLE_H;

  order.forEach(src => {
    const m = metaMap[src];

    const card = document.createElement("div");
    card.className = "puzzle-piece-card";

    const img = document.createElement("img");
    img.src = m.src;
    img.className = "puzzle-piece-thumb";

    card.appendChild(img);
    puzzleTray.appendChild(card);

    const p = document.createElement("img");
    p.src = m.src;
    p.className = "board-piece";

    const tx = m.minX * sx;
    const ty = m.minY * sy;

    p.dataset.tx = tx;
    p.dataset.ty = ty;

    p.style.width = m.w * sx + "px";
    p.style.height = m.h * sy + "px";

    p.style.left = Math.random() * 200 + "px";
    p.style.top = Math.random() * 200 + "px";

    puzzleBoard.appendChild(p);

    drag(p, card);
  });

  placed = 0;
  update();
}

// =====================
function drag(el, card) {
  let d = false, ox, oy;

  el.onpointerdown = e => {
    if (el.classList.contains("placed")) return;

    d = true;
    const r = el.getBoundingClientRect();
    ox = e.clientX - r.left;
    oy = e.clientY - r.top;

    el.setPointerCapture(e.pointerId);
  };

  el.onpointermove = e => {
    if (!d) return;

    const rect = puzzleBoard.getBoundingClientRect();
    el.style.left = e.clientX - rect.left - ox + "px";
    el.style.top = e.clientY - rect.top - oy + "px";
  };

  el.onpointerup = () => {
    d = false;

    const dx = el.offsetLeft - el.dataset.tx;
    const dy = el.offsetTop - el.dataset.ty;

    if (Math.hypot(dx, dy) < 80) {
      el.style.left = el.dataset.tx + "px";
      el.style.top = el.dataset.ty + "px";

      el.classList.add("placed");
      card.classList.add("placed");

      placed++;
      update();
    }
  };
}

// =====================
function update() {
  if (!puzzleStatus) return;

  puzzleStatus.innerText = `Progress: ${placed} / ${puzzlePieces.length}`;

  if (placed === puzzlePieces.length) {
    puzzleStatus.innerText = "✅ Enviro Hero Complete!";
  }
}

// =====================
function shufflePuzzlePieces() {
  order = shuffle(puzzlePieces);
  drawPuzzle();
}

function resetPuzzleBoard() {
  drawPuzzle();
}

// =====================
if (puzzleTray && puzzleBoard) {
  initPuzzle();
}

// Story
// =====================
// ECO STORY SLIDER
// =====================
let current = 0;
const slides = document.querySelectorAll(".slide");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

function showSlide(index) {
  if (!slides.length) return;

  slides.forEach(slide => slide.classList.remove("active"));
  slides[index].classList.add("active");

  // hide prev on first slide
  if (prevBtn) {
    prevBtn.style.display = index === 0 ? "none" : "inline-block";
  }

  // hide next on last slide
  if (nextBtn) {
    nextBtn.style.display = index === slides.length - 1 ? "none" : "inline-block";
  }
}

function nextSlide() {
  if (current < slides.length - 1) {
    current++;
    showSlide(current);
  }
}

function prevSlide() {
  if (current > 0) {
    current--;
    showSlide(current);
  }
}

// init only if story slides exist
if (slides.length) {
  showSlide(current);
}
