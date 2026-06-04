// =====================// =====================Id("photo");
const layer = document.getElementById("icon-layer");
const container = document.querySelector(".twibbon-container");
const sizeRange = document.getElementById("sizeRange");
const photoZoom = document.getElementById("photoZoom");
const trashBin = document.getElementById("trashBin");
const frameImg = document.getElementById("frameImg");

const cameraModal = document.getElementById("cameraModal");
const cameraVideo = document.getElementById("cameraVideo");

let selectedIcon = null;
let currentStream = null;

// =====================
// PHOTO STATE (ZOOM + REPOSITION)
// =====================
let photoState = {
  scale: 1,
  x: 0,
  y: 0
};

let draggingPhoto = false;
let startPhotoX = 0;
let startPhotoY = 0;

// =====================
// HELPERS PHOTO
// =====================
function clampPhotoPosition() {
  if (!container) return;

  const maxX = (container.clientWidth * (photoState.scale - 1)) / 2;
  const maxY = (container.clientHeight * (photoState.scale - 1)) / 2;

  photoState.x = Math.max(-maxX, Math.min(photoState.x, maxX));
  photoState.y = Math.max(-maxY, Math.min(photoState.y, maxY));
}

function applyPhotoTransform() {
  if (!photo) return;
  clampPhotoPosition();
  photo.style.transform = `translate(${photoState.x}px, ${photoState.y}px) scale(${photoState.scale})`;
}

function resetPhotoAdjust() {
  photoState.scale = 1;
  photoState.x = 0;
  photoState.y = 0;

  if (photoZoom) photoZoom.value = 1;
  applyPhotoTransform();
}

// =====================
// LOAD PHOTO FROM FILE
// =====================
function setPhotoFromFile(file) {
  if (!file || !photo) return;
  photo.src = URL.createObjectURL(file);
  setTimeout(() => resetPhotoAdjust(), 50);
}

if (upload) {
  upload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    setPhotoFromFile(file);
  });
}

if (cameraFileFront) {
  cameraFileFront.addEventListener("change", (e) => {
    const file = e.target.files[0];
    setPhotoFromFile(file);
  });
}

if (cameraFileBack) {
  cameraFileBack.addEventListener("change", (e) => {
    const file = e.target.files[0];
    setPhotoFromFile(file);
  });
}

// =====================
// CAMERA FRONT/BACK
// =====================
async function openCamera(mode = "user") {
  // fallback ke input kamera native kalau getUserMedia tidak tersedia
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (mode === "environment" && cameraFileBack) {
      cameraFileBack.click();
    } else if (cameraFileFront) {
      cameraFileFront.click();
    }
    return;
  }

  try {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      currentStream = null;
    }

    currentStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: mode }
      },
      audio: false
    });

    if (cameraVideo && cameraModal) {
      cameraVideo.srcObject = currentStream;
      cameraModal.classList.remove("hidden");
    }

  } catch (err) {
    console.error(err);

    // fallback ke kamera native HP
    if (mode === "environment" && cameraFileBack) {
      cameraFileBack.click();
    } else if (cameraFileFront) {
      cameraFileFront.click();
    } else {
      alert("Kamera tidak bisa dibuka. Coba izinkan akses kamera di browser.");
    }
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

  const ctx = tempCanvas.getContext("2d");
  ctx.drawImage(cameraVideo, 0, 0, tempCanvas.width, tempCanvas.height);

  photo.src = tempCanvas.toDataURL("image/png");
  setTimeout(() => resetPhotoAdjust(), 50);

  closeCamera();
}

// =====================
// PHOTO ZOOM SLIDER
// =====================
if (photoZoom) {
  photoZoom.addEventListener("input", () => {
    photoState.scale = parseFloat(photoZoom.value);
    applyPhotoTransform();
  });
}

// =====================
// DRAG PHOTO (DESKTOP + MOBILE)
// =====================
if (photo && container) {
  photo.addEventListener("pointerdown", (e) => {
    draggingPhoto = true;
    startPhotoX = e.clientX - photoState.x;
    startPhotoY = e.clientY - photoState.y;
    photo.setPointerCapture(e.pointerId);
  });

  photo.addEventListener("pointermove", (e) => {
    if (!draggingPhoto) return;

    photoState.x = e.clientX - startPhotoX;
    photoState.y = e.clientY - startPhotoY;
    applyPhotoTransform();
  });

  photo.addEventListener("pointerup", () => {
    draggingPhoto = false;
  });

  photo.addEventListener("pointercancel", () => {
    draggingPhoto = false;
  });
}

// =====================
// ICON SELECT
// =====================
function selectIcon(icon) {
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

if (layer) {
  layer.addEventListener("click", (e) => {
    if (e.target === layer) {
      document.querySelectorAll("#icon-layer img").forEach(i => i.classList.remove("selected"));
      selectedIcon = null;
    }
  });
}

// =====================
// DRAG ICON (DESKTOP + MOBILE)
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
    if (trashBin) {
      trashBin.classList.remove("active");
    }
  });
}

// =====================
// EXPORT HELPERS
// =====================
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCoverAdjusted(ctx, img, x, y, w, h) {
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

  const scaledWidth = drawWidth * photoState.scale;
  const scaledHeight = drawHeight * photoState.scale;

  const xRatio = w / container.clientWidth;
  const yRatio = h / container.clientHeight;

  const translatedX = photoState.x * xRatio;
  const translatedY = photoState.y * yRatio;

  const finalX = dx - (scaledWidth - drawWidth) / 2 + translatedX;
  const finalY = dy - (scaledHeight - drawHeight) / 2 + translatedY;

  ctx.drawImage(img, finalX, finalY, scaledWidth, scaledHeight);
}

// =====================
// DOWNLOAD HIGH RES
// =====================
async function downloadTwibbon() {
  if (!photo || !photo.src) {
    alert("Upload atau ambil foto dulu ya, Enviro Hero!");
    return;
  }

  try {
    const photoImg = await loadImage(photo.src);
    const frameAsset = frameImg ? frameImg.src : "Assets/Frame.png";
    const frame = await loadImage(frameAsset);

    // output besar supaya tajam
    const OUTPUT_W = 2048;
    const OUTPUT_H = Math.round(OUTPUT_W * (frame.height / frame.width || 1));

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_W;
    canvas.height = OUTPUT_H;

    const ctx = canvas.getContext("2d");

    // draw foto dengan adjustment
    drawCoverAdjusted(ctx, photoImg, 0, 0, OUTPUT_W, OUTPUT_H);

    // draw frame
    ctx.drawImage(frame, 0, 0, OUTPUT_W, OUTPUT_H);

    // draw icons
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
``
// HOMEPAGE NAVIGATION
// =====================
function goTwibbon() {
  window.location.href = "twibbon.html";
}

function goGame() {
  alert("Eco Game coming soon 🌱");
}

function goStory() {
  alert("Our Story coming soon 📖");
}

// =====================
// ELEMENTS
// =====================
const upload = document.getElementById("upload");
const cameraFileFront = document.getElementById("cameraFileFront");
const cameraFileBack = document.getElementById("cameraFileBack");
