// =====================
// NAVIGATION (homepage)
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
// TWIBBON ELEMENTS
// =====================
const upload = document.getElementById("upload");
const photo = document.getElementById("photo");
const layer = document.getElementById("icon-layer");
const container = document.querySelector(".twibbon-container");

// =====================
// UPLOAD FOTO
// =====================
if (upload && photo) {
  upload.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    photo.src = URL.createObjectURL(file);
  });
}

// =====================
// TAMBAH ICON
// =====================
function addIcon(src) {
  if (!layer) return;

  const icon = document.createElement("img");
  icon.src = src;
  icon.style.position = "absolute";
  icon.style.top = "100px";
  icon.style.left = "100px";
  icon.style.width = "50px";
  icon.style.cursor = "move";

  layer.appendChild(icon);

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  icon.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const rect = layer.getBoundingClientRect();
    icon.style.left = (e.clientX - rect.left - offsetX) + "px";
    icon.style.top = (e.clientY - rect.top - offsetY) + "px";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

// =====================
// DOWNLOAD CLEAN PNG
// =====================
function download() {
  if (!photo || !photo.src) {
    alert("Upload foto dulu ya, Enviro Hero!");
    return;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.src = photo.src;

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;

    // foto
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // frame
    const frame = new Image();
    frame.src = "Assets/Frame.png";

    frame.onload = () => {
      ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

      // icons
      if (container && layer) {
        const containerRect = container.getBoundingClientRect();
        const icons = document.querySelectorAll("#icon-layer img");

        icons.forEach((icon) => {
          const iconRect = icon.getBoundingClientRect();
          const xRatio = canvas.width / containerRect.width;
          const yRatio = canvas.height / containerRect.height;

          const x = (iconRect.left - containerRect.left) * xRatio;
          const y = (iconRect.top - containerRect.top) * yRatio;
          const w = iconRect.width * xRatio;
          const h = iconRect.height * yRatio;

          const iconImg = new Image();
          iconImg.src = icon.src;
          ctx.drawImage(iconImg, x, y, w, h);
        });
      }

      // export
      const link = document.createElement("a");
      link.download = "twibbon-wed2026.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };
}
