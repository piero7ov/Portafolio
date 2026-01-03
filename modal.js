/* =========================================================
   modal.js
   - Modal simple para ver imágenes en grande
   ========================================================= */

let modal = document.querySelector("#modal-img");
let modalVer = document.querySelector("#modal-img-ver");
let modalCerrar = document.querySelector("#modal-img-cerrar");
let modalTitulo = document.querySelector("#modal-img-titulo");

function abrirModalImagen(src, titulo) {
    if (!modal || !modalVer) return;

    modalVer.src = src;
    modalVer.alt = titulo || "Imagen";

    if (modalTitulo) modalTitulo.textContent = titulo || "Imagen";

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
}

function cerrarModalImagen() {
    if (!modal) return;

    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");

    if (modalVer) modalVer.src = "";
}

// Delegación: escucha clicks en el documento
document.addEventListener("click", function (e) {
    // Si clickean una imagen de proyecto (creada por clon.js)
    let img = e.target.closest(".proyecto-img");

    if (img) {
        let src = img.getAttribute("data-full") || img.getAttribute("src");
        let titulo = img.getAttribute("data-title") || "Imagen";
        abrirModalImagen(src, titulo);
        return;
    }

    // Cerrar con click fuera
    if (modal && e.target === modal) {
        cerrarModalImagen();
    }
});

// Botón cerrar
if (modalCerrar) {
    modalCerrar.addEventListener("click", cerrarModalImagen);
}

// Cerrar con ESC
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
        cerrarModalImagen();
    }
});
