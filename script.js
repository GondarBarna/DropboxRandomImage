function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

let activeIndex = 0;
let imageFiles = [];

async function loadImages() {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  let folderUrl;

  const fromURL = getQueryParam("folder");
  if (fromURL) {
    folderUrl = decodeURIComponent(fromURL);
  }

  let url = folderUrl.replace("dl=0", "raw=1");
  url = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);

  const response = await fetch(url);

  const blob = await response.blob();
  const zip = await JSZip.loadAsync(blob);

  // Collect image files (jpg, png, gif, webp)
  zip.forEach((relativePath, file) => {
    if (!file.dir && /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)) {
      imageFiles.push(file);
    }
  });

  // Show images
  if (imageFiles.length === 0) {
    gallery.innerHTML = "<p>No images found.</p>";
    return;
  }

  // Shuffle the array
  imageFiles = imageFiles.sort(() => Math.random() - 0.5);

  await loadActiveImage(0);
}

async function loadActiveImage()
{
  const file = imageFiles[activeIndex];
  const content = await file.async("blob");
  const imgUrl = URL.createObjectURL(content);
  const img = document.createElement("img");
  img.src = imgUrl;
  gallery.innerHTML = "";
  gallery.appendChild(img);
}

document.addEventListener("click", async (e) => {
  const screenWidth = window.innerWidth;
  const clickX = e.clientX;

  if (clickX < screenWidth * 0.1) {
    activeIndex--;

    if (activeIndex < 0)
      activeIndex = imageFiles.length - 1;

    await loadActiveImage();

  } else if (clickX > screenWidth * 0.9) {
    activeIndex++;

    if (activeIndex >= imageFiles.length)
      activeIndex = 0;

    await loadActiveImage();
  }
});

window.onload = () => loadImages();