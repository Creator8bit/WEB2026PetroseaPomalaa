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
// LOAD PHOTO FROM FILE
// =====================
function setPhotoFromFile(file) {
  if (!file || !photo) return;
  photo.src = URL.createObjectURL(file);
}

if (upload) {
  upload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    setPhotoFromFile(file);
  });
}

if (cameraFile) {
  cameraFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    setPhotoFromFile(file);
  });
}

// =====================
// CAMERA
// =====================
async function openCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (cameraFile) cameraFile.click();
    return;
  }

  try {
    currentStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });

    if (cameraVideo && cameraModal) {
      cameraVideo.srcObject = currentStream;
      cameraModal.classList.remove("hidden");
    }
  } catch (err) {
    if (cameraFile) cameraFile.click();
  }
}

function closeCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }

  if (cameraVideo) {
    cameraVideo.srcObject = null;
  }

  if (cameraModal) {
    cameraModal.classList.add("hidden");
  }
}

function takePhoto() {
  if (!cameraVideo || !photo) return;

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = cameraVideo.videoWidth;
  tempCanvas.height = cameraVideo.videoHeight;

  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.drawImage(cameraVideo, 0, 0, tempCanvas.width, tempCanvas.height);

  photo.src = tempCanvas.toDataURL("image/png");
  closeCamera();
}

// =====================
// ICON HELPERS
// =====================
function selectIcon(icon) {
  if (!layer) return;

  document.querySelectorAll("#icon-layer img").forEach(i => i.classList.remove("selected"));
  selectedIcon = icon;

  if (selectedIcon) {
    selectedIcon.classList.add("selected");
    if (sizeRange) {
      sizeRange.value = parseInt(selectedIcon.dataset.size || selectedIcon.offsetWidth, 10);
    }
  }
}

function deleteSelectedIcon() {
  if (selectedIcon) {
    selectedIcon.remove();
    selectedIcon = null;
  }
}

if (sizeRange) {
  sizeRange.addEventListener("input", () => {
    if (!selectedIcon) return;
    const newSize = parseInt(sizeRange.value, 10);
    selectedIcon.style.width = newSize + "px";
    selectedIcon.dataset.size = newSize;
  });
}

// =====================
// ADD ICON
// =====================
function addIcon(src) {
  if (!layer) return;

  const icon = document.createElement("img");
  icon.src = src;
  icon.style.position = "absolute";
  icon.style.left = "40%";
  icon.style.top = "40%";
  icon.style.width = "60px";
  icon.style.cursor = "move";
  icon.dataset.size = "60";

  layer.appendChild(icon);
  makeDraggable(icon);
  selectIcon(icon);

  icon.addEventListener("click", (e) => {
    e.stopPropagation();
    selectIcon(icon);
  });
}

// unselect icon kalau klik area kosong
if (layer) {
  layer.addEventListener("click", (e) => {
    if (e.target === layer) {
      document.querySelectorAll("#icon-layer img").forEach(i => i.classList.remove("selected"));
      selectedIcon = null;
    }
  });
}

// =====================
// DRAG ICON
// =====================
function makeDraggable(icon) {
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  icon.addEventListener("pointerdown", (e) => {
    dragging = true;
    selectIcon(icon);

    const iconRect = icon.getBoundingClientRect();
    offsetX = e.clientX - iconRect.left;
    offsetY = e.clientY - iconRect.top;

    icon.setPointerCapture(e.pointerId);
  });

  icon.addEventListener("pointermove", (e) => {
    if (!dragging || !layer) return;

    const layerRect = layer.getBoundingClientRect();

    let x = e.clientX - layerRect.left - offsetX;
    let y = e.clientY - layerRect.top - offsetY;

    x = Math.max(0, Math.min(x, layerRect.width - icon.offsetWidth));
    y = Math.max(0, Math.min(y, layerRect.height - icon.offsetHeight));

    icon.style.left = x + "px";
    icon.style.top = y + "px";

    if (trashBin) {
      const trashRect = trashBin.getBoundingClientRect();
      const overTrash =
        e.clientX >= trashRect.left &&
        e.clientX <= trashRect.right &&
        e.clientY >= trashRect.top &&
        e.clientY <= trashRect.bottom;

      trashBin.classList.toggle("active", overTrash);
    }
  });

  icon.addEventListener("pointerup", (e) => {
    dragging = false;

    if (trashBin) {
      const trashRect = trashBin.getBoundingClientRect();
      const overTrash =
        e.clientX >= trashRect.left &&
        e.clientX <= trashRect.right &&
        e.clientY >= trashRect.top &&
        e.clientY <= trashRect.bottom;

      if (overTrash) {
        icon.remove();
        if (selectedIcon === icon) selectedIcon = null;
      }

      trashBin.classList.remove("active");
    }
  });

  icon.addEventListener("pointercancel", () => {
    dragging = false;
    if (trashBin) trashBin.classList.remove("active");
  });
}

// =====================
// DOWNLOAD HIGH RES
// =====================
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;

  let drawWidth, drawHeight, dx, dy;

  if (imgRatio > boxRatio) {
    drawHeight = h;
    drawWidth = h * imgRatio;
    dx = x - (drawWidth - w) / 2;
    dy = y;
  } else {
    drawWidth = w;
    drawHeight = w / imgRatio;
    dx = x;
    dy = y - (drawHeight - h) / 2;
  }

  ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
}

async function downloadTwibbon() {
  if (!photo || !photo.src) {
    alert("Upload atau ambil foto dulu ya, Enviro Hero!");
    return;
  }

  const frameElement = document.getElementById("frameImg");
  const frameSrc = frameElement ? frameElement.src : "Assets/Frame.png";

  try {
    const photoImg = await loadImage(photo.src);
    const frameImg = await loadImage(frameSrc);

    const OUTPUT_W = 1600;
    const OUTPUT_H = Math.round(OUTPUT_W * (frameImg.height / frameImg.width || 1));

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_W;
    canvas.height = OUTPUT_H;

    const ctx = canvas.getContext("2d");

    drawCover(ctx, photoImg, 0, 0, OUTPUT_W, OUTPUT_H);
    ctx.drawImage(frameImg, 0, 0, OUTPUT_W, OUTPUT_H);

    if (container && layer) {
      const containerRect = container.getBoundingClientRect();
      const icons = document.querySelectorAll("#icon-layer img");

      for (const icon of icons) {
        const iconRect = icon.getBoundingClientRect();

        const xRatio = OUTPUT_W / containerRect.width;
        const yRatio = OUTPUT_H / containerRect.height;

        const x = (iconRect.left - containerRect.left) * xRatio;
        const y = (iconRect.top - containerRect.top) * yRatio;
        const w = iconRect.width * xRatio;
        const h = iconRect.height * yRatio;

        const iconImg = await loadImage(icon.src);
        ctx.drawImage(iconImg, x, y, w, h);
      }
    }

    const link = document.createElement("a");
    link.download = "twibbon-wed2026.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

  } catch (err) {
    console.error(err);
    alert("Gagal membuat twibbon. Cek apakah foto dan asset sudah terbaca.");
  }
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

//game mistake
// =====================
// WRONG CLICK
// =====================
function wrongClick(event) {
  const officeInfo = document.getElementById("info");
  const workshopInfo = document.getElementById("info-workshop");
  const campInfo = document.getElementById("info-camp");

  if (officeInfo) officeInfo.innerText = "❌ Lebih Spesifik 😏";
  if (workshopInfo) workshopInfo.innerText = "❌ Lebih Spesifik 😏";
  if (campInfo) campInfo.innerText = "❌ Lebih Spesifik 😏";
}

// =====================
// OFFICE FINDINGS
// =====================
function foundOffice(id) {
  const info = document.getElementById("info");
  if (!info) return;

  if (id === 1) {
    info.innerText = "✅ 😰 Menyimpan bahan kimia di botol minuman? fatal ini kalau tertelan.";
  }
  if (id === 2) {
    info.innerText = "✅ 🤢 Sampah kecil doang??? Nanti kecoa dan tikus bertamu lho!";
  }
  if (id === 3) {
    info.innerText = "✅ 😑 Ada lho 5R! Ringkas..Rapi..Resik..Rawat..Rajin";
  }
}

// =====================
// WORKSHOP FINDINGS
// =====================
function foundWorkshop(id) {
  const info = document.getElementById("info-workshop");
  if (!info) return;

  if (id === 1) {
    info.innerText = "✅ 😖 \"Licin… bau… ini bukan workshop, ini bahaya!\" Tumpahan oli yang dibiarkan bisa bikin kecelakaan dan mencemari tanah.";
  }
  if (id === 2) {
    info.innerText = "✅ 🤢 \"Udah penuh, tetep dibuang ke sini?\" Sampah numpuk bukan cuma kotor—tapi jadi sumber penyakit dan bau menyengat.";
  }
  if (id === 3) {
    info.innerText = "✅ 😡 \"Ini limbah berbahaya, bukan sampah biasa!\" Penanganan yang salah bisa mencemari tanah dan air dalam jangka panjang.";
  }
}

// =====================
// CAMP FINDINGS
// =====================
function foundCamp(id) {
  const info = document.getElementById("info-camp");
  if (!info) return;

  if (id === 1) {
    info.innerText = "✅ 😷 \"Ohok… ohok… pengap banget!\" Asap dari pembakaran sampah ini nggak cuma ganggu—tapi berbahaya buat kesehatan.";
  }
  if (id === 2) {
    info.innerText = "✅ 😵 Satu puntung kecil saja bisa mencemari lingkungan, apalagi sebanyak itu.";
  }
  if (id === 3) {
    info.innerText = "✅ 🤢 \"Bau… kotor… ini camp atau tempat pembuangan?\" Sampah tidak dikelola = sumber penyakit + pencemaran.";
  }
}

// =====================
// PUZZLE SMART SNAP VERSION
// =====================

const puzzleTray = document.getElementById("puzzleTray");
const puzzleBoard = document.getElementById("puzzleBoard");
const puzzleSlots = document.getElementById("puzzleSlots");
const puzzlePlacedLayer = document.getElementById("puzzlePlacedLayer");
const puzzleStatus = document.getElementById("puzzleStatus");

const puzzleSources = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  src: `Assets/puzzle/p${i + 1}.png`
}));

let puzzleData = [];
let draggedPieceId = null;

// ---------- HELPERS ----------
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function loadImageFile(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Cari area non-transparent dari PNG full-frame
 */
function getTrimBounds(img) {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);

  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 8) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  // kalau somehow kosong total
  if (maxX === -1 || maxY === -1) {
    return {
      x: 0,
      y: 0,
      w: width,
      h: height
    };
  }

  return {
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1
  };
}

/**
 * Crop piece jadi thumbnail/actual visible piece
 */
function createTrimmedDataURL(img, bounds) {
  const canvas = document.createElement("canvas");
  canvas.width = bounds.w;
  canvas.height = bounds.h;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    img,
    bounds.x, bounds.y, bounds.w, bounds.h,
    0, 0, bounds.w, bounds.h
  );

  return canvas.toDataURL("image/png");
}

function boardRect() {
  return puzzleBoard.getBoundingClientRect();
}

function getPieceById(id) {
  return puzzleData.find(p => p.id === id);
}

function getBoardMetrics(piece) {
  const rect = boardRect();

  const leftPx = (piece.bounds.x / piece.fullW) * rect.width;
  const topPx = (piece.bounds.y / piece.fullH) * rect.height;
  const widthPx = (piece.bounds.w / piece.fullW) * rect.width;
  const heightPx = (piece.bounds.h / piece.fullH) * rect.height;

  return { leftPx, topPx, widthPx, heightPx, rect };
}

function getCurrentPieceBoardPos(piece) {
  const rect = boardRect();
  const metrics = getBoardMetrics(piece);

  if (piece.snapped) {
    return {
      left: metrics.leftPx,
      top: metrics.topPx,
      width: metrics.widthPx,
      height: metrics.heightPx
    };
  }

  if (piece.placed) {
    return {
      left: piece.freeX * rect.width,
      top: piece.freeY * rect.height,
      width: metrics.widthPx,
      height: metrics.heightPx
    };
  }

  return null;
}

function countSnappedPieces() {
  return puzzleData.filter(p => p.snapped).length;
}

function updatePuzzleStatus() {
  if (!puzzleStatus) return;
  const snapped = countSnappedPieces();
  puzzleStatus.innerText = `Progress: ${snapped} / ${puzzleData.length}`;

  if (snapped === puzzleData.length) {
    puzzleStatus.innerText = `🎉 Puzzle selesai! ${snapped} / ${puzzleData.length}`;
  }
}

// ---------- RENDER ----------
function renderSlots() {
  if (!puzzleSlots) return;
  puzzleSlots.innerHTML = "";

  puzzleData.forEach(piece => {
    const slot = document.createElement("div");
    slot.className = "puzzle-slot";
    slot.dataset.pieceId = piece.id;
    slot.dataset.label = `P${piece.id}`;

    const left = (piece.bounds.x / piece.fullW) * 100;
    const top = (piece.bounds.y / piece.fullH) * 100;
    const width = (piece.bounds.w / piece.fullW) * 100;
    const height = (piece.bounds.h / piece.fullH) * 100;

    slot.style.left = left + "%";
    slot.style.top = top + "%";
    slot.style.width = width + "%";
    slot.style.height = height + "%";

    puzzleSlots.appendChild(slot);
  });
}

function renderTray() {
  if (!puzzleTray) return;
  puzzleTray.innerHTML = "";

  puzzleData
    .filter(piece => !piece.placed)
    .forEach(piece => {
      const card = document.createElement("div");
      card.className = "puzzle-piece-card";
      card.dataset.pieceId = piece.id;

      const img = document.createElement("img");
      img.src = piece.trimSrc;
      img.className = "puzzle-piece-thumb";
      img.alt = `Puzzle piece ${piece.id}`;

      card.appendChild(img);
      puzzleTray.appendChild(card);

      card.addEventListener("pointerdown", (e) => {
        startDragPiece(e, piece.id, "tray", card);
      });
    });
}

function renderBoardPieces() {
  if (!puzzlePlacedLayer) return;
  puzzlePlacedLayer.innerHTML = "";

  puzzleData
    .filter(piece => piece.placed)
    .forEach(piece => {
      const el = document.createElement("div");
      el.className = "board-piece" + (piece.snapped ? " snapped" : "");
      el.dataset.pieceId = piece.id;

      const img = document.createElement("img");
      img.src = piece.trimSrc;
      img.alt = `Puzzle piece ${piece.id}`;
      el.appendChild(img);

      const metrics = getBoardMetrics(piece);
      const widthPct = (piece.bounds.w / piece.fullW) * 100;
      const heightPct = (piece.bounds.h / piece.fullH) * 100;

      if (piece.snapped) {
        el.style.left = (piece.bounds.x / piece.fullW) * 100 + "%";
        el.style.top = (piece.bounds.y / piece.fullH) * 100 + "%";
      } else {
        el.style.left = (piece.freeX * 100) + "%";
        el.style.top = (piece.freeY * 100) + "%";
      }

      el.style.width = widthPct + "%";
      el.style.height = heightPct + "%";

      el.addEventListener("pointerdown", (e) => {
        startDragPiece(e, piece.id, "board", el);
      });

      puzzlePlacedLayer.appendChild(el);
    });
}

function renderPuzzle() {
  renderSlots();
  renderTray();
  renderBoardPieces();
  updatePuzzleStatus();
}

// ---------- SNAP LOGIC ----------
function highlightSlot(pieceId, on) {
  const slot = puzzleSlots?.querySelector(`.puzzle-slot[data-piece-id="${pieceId}"]`);
  if (!slot) return;
  slot.classList.toggle("highlight", on);
}

function isNearCorrectSlot(pieceId, clientX, clientY) {
  const piece = getPieceById(pieceId);
  if (!piece || !puzzleBoard) return { snap: false };

  const rect = boardRect();
  const m = getBoardMetrics(piece);

  const slotCenterX = rect.left + m.leftPx + (m.widthPx / 2);
  const slotCenterY = rect.top + m.topPx + (m.heightPx / 2);

  const dx = clientX - slotCenterX;
  const dy = clientY - slotCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const threshold = Math.max(40, Math.min(120, Math.max(m.widthPx, m.heightPx) * 0.6));

  return {
    snap: distance <= threshold,
    distance,
    threshold
  };
}

// ---------- DRAG ----------
function createGhost(piece, widthPx, heightPx) {
  const ghost = document.createElement("div");
  ghost.className = "puzzle-drag-ghost";
  ghost.style.width = widthPx + "px";
  ghost.style.height = heightPx + "px";

  const img = document.createElement("img");
  img.src = piece.trimSrc;
  ghost.appendChild(img);

  document.body.appendChild(ghost);
  return ghost;
}

function startDragPiece(e, pieceId, sourceType, sourceEl) {
  e.preventDefault();

  const piece = getPieceById(pieceId);
  if (!piece) return;

  draggedPieceId = pieceId;

  const rectBoard = boardRect();
  const metrics = getBoardMetrics(piece);

  let startVisual;

  if (sourceType === "board" && piece.placed) {
    startVisual = getCurrentPieceBoardPos(piece);
  } else {
    const sourceRect = sourceEl.getBoundingClientRect();
    const ratio = metrics.heightPx / metrics.widthPx || 1;

    // size ghost menyesuaikan kartu/tray tapi proporsional piece asli
    let gWidth = Math.min(140, sourceRect.width * 0.95);
    let gHeight = gWidth * ratio;

    if (gHeight > 110) {
      gHeight = 110;
      gWidth = gHeight / ratio;
    }

    startVisual = {
      left: e.clientX - (gWidth / 2),
      top: e.clientY - (gHeight / 2),
      width: gWidth,
      height: gHeight
    };
  }

  const offsetX = e.clientX - startVisual.left;
  const offsetY = e.clientY - startVisual.top;

  const ghost = createGhost(piece, startVisual.width, startVisual.height);
  moveGhost(e.clientX, e.clientY);

  function moveGhost(clientX, clientY) {
    ghost.style.left = clientX + "px";
    ghost.style.top = clientY + "px";
  }

  function pointerMove(ev) {
    moveGhost(ev.clientX, ev.clientY);

    const overBoard =
      ev.clientX >= rectBoard.left &&
      ev.clientX <= rectBoard.right &&
      ev.clientY >= rectBoard.top &&
      ev.clientY <= rectBoard.bottom;

    if (overBoard) {
      const near = isNearCorrectSlot(pieceId, ev.clientX, ev.clientY);
      highlightSlot(pieceId, near.snap);
    } else {
      highlightSlot(pieceId, false);
    }
  }

  function pointerUp(ev) {
    document.removeEventListener("pointermove", pointerMove);
    document.removeEventListener("pointerup", pointerUp);
    ghost.remove();

    const pieceData = getPieceById(pieceId);
    if (!pieceData) return;

    const overBoard =
      ev.clientX >= rectBoard.left &&
      ev.clientX <= rectBoard.right &&
      ev.clientY >= rectBoard.top &&
      ev.clientY <= rectBoard.bottom;

    const near = isNearCorrectSlot(pieceId, ev.clientX, ev.clientY);
    highlightSlot(pieceId, false);

    if (overBoard) {
      const pieceBoardMetrics = getBoardMetrics(pieceData);

      if (near.snap) {
        pieceData.placed = true;
        pieceData.snapped = true;

        // simpan posisi free juga biar aman kalau nanti dilepas lagi
        pieceData.freeX = pieceData.bounds.x / pieceData.fullW;
        pieceData.freeY = pieceData.bounds.y / pieceData.fullH;
      } else {
        // drop bebas di board (reposition)
        const freeLeft = clamp(
          (ev.clientX - rectBoard.left - pieceBoardMetrics.widthPx / 2) / rectBoard.width,
          0,
          1 - (pieceBoardMetrics.widthPx / rectBoard.width)
        );

        const freeTop = clamp(
          (ev.clientY - rectBoard.top - pieceBoardMetrics.heightPx / 2) / rectBoard.height,
          0,
          1 - (pieceBoardMetrics.heightPx / rectBoard.height)
        );

        pieceData.placed = true;
        pieceData.snapped = false;
        pieceData.freeX = freeLeft;
        pieceData.freeY = freeTop;
      }
    } else {
      // kalau dilepas di luar board:
      // - kalau asalnya dari tray => balik tray
      // - kalau asalnya dari board => tetap ke posisi sebelumnya
      if (sourceType === "tray") {
        pieceData.placed = false;
        pieceData.snapped = false;
      }
    }

    draggedPieceId = null;
    renderPuzzle();
  }

  document.addEventListener("pointermove", pointerMove);
  document.addEventListener("pointerup", pointerUp);
}

// ---------- INIT ----------
async function preparePuzzleData() {
  const loaded = await Promise.all(
    puzzleSources.map(async (item) => {
      const img = await loadImageFile(item.src);
      const bounds = getTrimBounds(img);
      const trimSrc = createTrimmedDataURL(img, bounds);

      return {
        id: item.id,
        src: item.src,
        trimSrc,
        fullW: img.naturalWidth || img.width,
        fullH: img.naturalHeight || img.height,
        bounds, // posisi asli piece dalam full frame
        placed: false,
        snapped: false,
        freeX: 0,
        freeY: 0
      };
    })
  );

  puzzleData = shuffleArray(loaded);
}

async function initPuzzle() {
  if (!puzzleTray || !puzzleBoard || !puzzleSlots || !puzzlePlacedLayer) return;

  if (puzzleStatus) {
    puzzleStatus.innerText = "Loading puzzle...";
  }

  try {
    await preparePuzzleData();
    renderPuzzle();
  } catch (err) {
    console.error("Puzzle init error:", err);
    if (puzzleStatus) {
      puzzleStatus.innerText = "Gagal load puzzle. Cek path Assets/puzzle/p1.png - p15.png";
    }
  }
}

function shufflePuzzlePieces() {
  puzzleData = shuffleArray(
    puzzleData.map(piece => ({
      ...piece,
      placed: false,
      snapped: false,
      freeX: 0,
      freeY: 0
    }))
  );
  renderPuzzle();
}

function resetPuzzleBoard() {
  puzzleData = puzzleData.map(piece => ({
    ...piece,
    placed: false,
    snapped: false,
    freeX: 0,
    freeY: 0
  }));
  renderPuzzle();
}

// re-render saat resize supaya posisi tetap presisi
window.addEventListener("resize", () => {
  if (puzzleBoard && puzzleData.length) {
    renderPuzzle();
  }
});

// INIT CALL
if (puzzleTray && puzzleBoard) {
  initPuzzle();
}
