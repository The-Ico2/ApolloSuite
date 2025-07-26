function createNewDoc() {
  // Redirect to the editor or API that creates a new document
  window.location.href = "/editor"; // Replace with your actual endpoint
}

document.addEventListener("DOMContentLoaded", () => {
  // Populate with dummy recent docs for now
  const docGrid = document.getElementById("docGrid");

  for (let i = 1; i <= 6; i++) {
    const doc = document.createElement("div");
    doc.className = "doc-template";
    doc.innerHTML = `<div class="doc-icon">📄</div><div class="doc-label">Doc ${i}</div>`;
    doc.onclick = () => window.location.href = `/editor?id=doc${i}`;
    docGrid.appendChild(doc);
  }
});
