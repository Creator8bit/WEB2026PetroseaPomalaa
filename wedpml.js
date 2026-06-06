// =====================// NAVIGATION
// =====================
function goTwibbon() {
  window.location.href = "twibbon.html";
}

function goGame() {
  window.location.href = "ecogame.html";
}

function goStory() {
  alert("On Progress~");
}

// =====================
// ECO GAME NAVIGATION
// =====================
function openScene(scene) {
  window.location.href = "scene-" + scene + ".html";
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
    info.innerText = "❌ 😰 Menyimpan bahan kimia di botol minuman? fatal ini kalau tertelan.";
  }
  if (id === 2) {
    info.innerText = "❌ 🤢 Sampah kecil doang??? Nanti kecoa dan tikus bertamu lho!";
  }
  if (id === 3) {
    info.innerText = "❌ 😑 Ada lho 5R! Ringkas..Rapi..Resik..Rawat..Rajin";
  }
}

// =====================
// WORKSHOP FINDINGS
// =====================
function foundWorkshop(id) {
  const info = document.getElementById("info-workshop");
  if (!info) return;

  if (id === 1) {
    info.innerText = "❌ 😖 \"Licin… bau… ini bukan workshop, ini bahaya!\" Tumpahan oli yang dibiarkan bisa bikin kecelakaan dan mencemari tanah.";
  }
  if (id === 2) {
    info.innerText = "❌ 🤢 \"Udah penuh, tetep dibuang ke sini?\" Sampah numpuk bukan cuma kotor—tapi jadi sumber penyakit dan bau menyengat.";
  }
  if (id === 3) {
    info.innerText = "❌ 😡 \"Ini limbah berbahaya, bukan sampah biasa!\" Penanganan yang salah bisa mencemari tanah dan air dalam jangka panjang.";
  }
}

// =====================
// CAMP FINDINGS
// =====================
function foundCamp(id) {
  const info = document.getElementById("info-camp");
  if (!info) return;

  if (id === 1) {
    info.innerText = "❌ 😷 \"Ohok… ohok… pengap banget!\" Asap dari pembakaran sampah ini nggak cuma ganggu—tapi berbahaya buat kesehatan.";
  }
  if (id === 2) {
    info.innerText = "❌ 😵 Satu puntung kecil saja bisa mencemari lingkungan, apalagi sebanyak itu.";
  }
  if (id === 3) {
    info.innerText = "❌ 🤢 \"Bau… kotor… ini camp atau tempat pembuangan?\" Sampah tidak dikelola = sumber penyakit + pencemaran.";
  }
}

