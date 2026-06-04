const upload = document.getElementById("upload");
const photo = document.getElementById("photo");

// ✅ upload foto
upload.addEventListener("change", function (e) {
  const file = e.target.files[0];
  photo.src = URL.createObjectURL(file);
});

// ✅ tambah icon
function addIcon(src) {
  const icon = document.createElement("img");
  icon.src = src;

  icon.style.top = "100px";
  icon.style.left = "100px";

  document.getElementById("icon-layer").appendChild(icon);
}

// ✅ download (basic screenshot trick)
function download() {
  alert("Nanti kita aktifkan download clean ya 😏🔥");
}

