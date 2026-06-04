// =====================
// ✅ ELEMENT
// =====================
const upload = document.getElementById("upload");
const photo = document.getElementById("photo");

// =====================
// ✅ UPLOAD FOTO
// =====================
if (upload && photo) {
  upload.addEventListener("change", function (e) {
    const file = e.target.files[0];
    photo.src = URL.createObjectURL(file);
  });
}

// =====================
// ✅ TAMBAH ICON
// =====================
function addIcon(src) {
  const layer = document.getElementById("icon-layer");
  if (!layer) return;

  const icon = document.createElement("img");
  icon.src = src;

  // posisi awal
  icon.style.position = "absolute";
  icon.style.top = "100px";
  icon.style.left = "100px";
  icon.style.width = "50px";
  icon.style.cursor = "move";

  layer.appendChild(icon);

  // =====================
  // ✅ DRAG ICON (BISA GESER 🔥)
  // =====================
  let isDragging = false;
  let offsetX, offsetY;

  icon.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const rect = layer.getBoundingClientRect();
    icon.style.left = e.clientX - rect.left - offsetX + "px";
    icon.style.top = e.clientY - rect.top - offsetY + "px";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

// =====================
// ✅ DOWNLOAD CLEAN PNG
// =====================
function download() {
  const photo = document.getElementById("photo");

  if (!photo.src) {
    alert("Upload foto dulu ya, Enviro Hero!");
    return;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = photo.src;

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;

    // ✅ FOTO USER
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // ✅ FRAME
    const frame = new Image();
    frame.src = "Assets/Frame.png";

    frame.onload = () => {
      ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

      // ✅ ICON (SEMUA DIAMBIL DARI LAYER)
      const icons = document.querySelectorAll("#icon-layer img");

      icons.forEach(icon => {
        const x = icon.offsetLeft;
        const y = icon.offsetTop;

        const iconImg = new Image();
        iconImg.src = icon.src;

        ctx.drawImage(iconImg, x, y, 50, 50);
      });

      // ✅ EXPORT
      const link = document.createElement("a");
      link.download = "twibbon-wed2026.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };
}
