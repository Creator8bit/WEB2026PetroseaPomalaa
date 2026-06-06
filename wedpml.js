// =====================
// HOMEPAGE NAVIGATION
// =====================
function goTwibbon() {
  window.location.href = "twibbon.html";
}

function goGame() {
  window.location.href = "ecogame.html";
}

function goStory() {
  alert("Our Story akan rilis tanggal 07/06/2026📖!");
}

// =====================
// ELEMENTS
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
  // fallback mobile kalau browser desktop/mobile tidak kasih akses video
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
    // fallback ke camera file input
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

    // batasi supaya tidak keluar layer
    x = Math.max(0, Math.min(x, layerRect.width - icon.offsetWidth));
    y = Math.max(0, Math.min(y, layerRect.height - icon.offsetHeight));

    icon.style.left = x + "px";
    icon.style.top = y + "px";

    // highlight trash kalau dekat
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

// draw image cover seperti CSS object-fit: cover
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

    // output besar supaya tajam
    const OUTPUT_W = 1600;
    const OUTPUT_H = Math.round(OUTPUT_W * (frameImg.height / frameImg.width || 1));

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_W;
    canvas.height = OUTPUT_H;

    const ctx = canvas.getContext("2d");

    // foto background mode cover
    drawCover(ctx, photoImg, 0, 0, OUTPUT_W, OUTPUT_H);

    // frame
    ctx.drawImage(frameImg, 0, 0, OUTPUT_W, OUTPUT_H);

    // icons
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
