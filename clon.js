/* =========================================================
   clon.js
   - Render + filtros (simple)
   - Tech chips dinámicos
   - Botón "Detalles" abre el README del repo
   - (Extra) Deja data-* en la imagen para que modal.js la abra
   ========================================================= */

let origen = document.querySelector("#tpl-proyecto");
let destino = document.querySelector("#proyectos-grid");

let buscador = document.querySelector("#buscador");
let filtroTec = document.querySelector("#filtro-tecnologia");
let orden = document.querySelector("#orden");
let btnLimpiar = document.querySelector("#btn-limpiar");
let techChips = document.querySelector("#tech-chips");

let listaOriginal = []; // aquí guardamos TODOS los proyectos

fetch("proyectos.json")
    .then(function (respuesta) { return respuesta.json(); })
    .then(function (datos) {

        // Tu JSON: { proyectos: [ ... ] }
        listaOriginal = datos.proyectos;

        // 1) llenar select tecnologías
        llenarSelectTecnologias(listaOriginal);

        // 1.1) llenar tech chips dinámicos
        llenarTechChips(listaOriginal);

        // 2) render inicial
        render(listaOriginal);

        // 3) eventos (filtros)
        buscador.addEventListener("input", aplicarFiltros);
        filtroTec.addEventListener("change", aplicarFiltros);
        orden.addEventListener("change", aplicarFiltros);

        btnLimpiar.addEventListener("click", function () {
            buscador.value = "";
            filtroTec.value = "";
            orden.value = "reciente";
            aplicarFiltros(); // mejor que render(listaOriginal) para respetar el orden
        });
    })
    .catch(function (error) {
        console.log("Error cargando proyectos.json:", error);
    });

/* =========================================================
   RENDER
   ========================================================= */
function render(lista) {
    destino.innerHTML = "";

    lista.forEach(function (dato) {
        let clon = origen.content.cloneNode(true);

        clon.querySelector(".proyecto-titulo").textContent = dato.titulo;
        clon.querySelector(".proyecto-fecha").textContent = dato.fecha_de_creacion;

        // imagen
        let img = clon.querySelector(".proyecto-img");
        img.setAttribute("src", dato.imagen);
        img.setAttribute("alt", "Captura de " + dato.titulo);

        // (para modal.js) datos extra en la imagen
        img.setAttribute("data-full", dato.imagen);
        img.setAttribute("data-title", dato.titulo);

        clon.querySelector(".proyecto-descripcion").textContent = dato.descripcion;

        // tags
        let contTags = clon.querySelector(".proyecto-tags");
        contTags.innerHTML = "";

        dato.tecnologias.forEach(function (tec) {
            let tag = document.createElement("span");
            tag.className = "tag";
            tag.textContent = tec;
            contTags.appendChild(tag);
        });

        // repo
        clon.querySelector(".btn-repo").setAttribute("href", dato.enlace_al_repositorio);

        // detalles -> abre README del repo
        let btnDetalles = clon.querySelector(".btn-detalles");

        if (btnDetalles) {
            if (dato.enlace_al_repositorio) {
                btnDetalles.addEventListener("click", function () {
                    window.open(enlaceReadme(dato.enlace_al_repositorio), "_blank", "noopener,noreferrer");
                });
            } else {
                btnDetalles.disabled = true;
            }
        }

        destino.appendChild(clon);
    });

    // si no hay resultados
    if (lista.length === 0) {
        destino.innerHTML = "<p>No hay proyectos que coincidan con tu búsqueda.</p>";
    }
}

/* =========================================================
   FILTROS
   ========================================================= */
function aplicarFiltros() {
    let texto = buscador.value.toLowerCase();
    let tecnologia = filtroTec.value;
    let tipoOrden = orden.value;

    // 1) empezamos con una copia
    let lista = listaOriginal.slice();

    // 2) filtro búsqueda (titulo o descripcion)
    if (texto !== "") {
        lista = lista.filter(function (p) {
            let t = (p.titulo || "").toLowerCase();
            let d = (p.descripcion || "").toLowerCase();
            return t.includes(texto) || d.includes(texto);
        });
    }

    // 3) filtro tecnología
    if (tecnologia !== "") {
        lista = lista.filter(function (p) {
            return p.tecnologias.includes(tecnologia);
        });
    }

    // 4) orden
    if (tipoOrden === "titulo") {
        lista.sort(function (a, b) {
            return a.titulo.localeCompare(b.titulo);
        });
    }

    if (tipoOrden === "reciente") {
        lista.sort(function (a, b) {
            return new Date(b.fecha_de_creacion) - new Date(a.fecha_de_creacion);
        });
    }

    if (tipoOrden === "antiguo") {
        lista.sort(function (a, b) {
            return new Date(a.fecha_de_creacion) - new Date(b.fecha_de_creacion);
        });
    }

    render(lista);
}

/* =========================================================
   SELECT TECNOLOGÍAS
   ========================================================= */
function llenarSelectTecnologias(lista) {
    // OJO: tu HTML ya trae la opción "Todas las tecnologías"
    // Entonces solo agregamos las demás

    // sacar tecnologías únicas
    let unicas = [];

    lista.forEach(function (p) {
        p.tecnologias.forEach(function (t) {
            if (!unicas.includes(t)) {
                unicas.push(t);
            }
        });
    });

    // ordenar alfabético
    unicas.sort();

    // agregar al select
    unicas.forEach(function (t) {
        let opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        filtroTec.appendChild(opt);
    });
}

/* =========================================================
   TECH CHIPS (DINÁMICO DESDE JSON)
   ========================================================= */
function llenarTechChips(lista) {
    // Si no existe el contenedor, no hacemos nada
    if (!techChips) return;

    // Limpiar chips mock (los del HTML)
    techChips.innerHTML = "";

    // sacar tecnologías únicas
    let unicas = [];

    lista.forEach(function (p) {
        p.tecnologias.forEach(function (t) {
            if (!unicas.includes(t)) {
                unicas.push(t);
            }
        });
    });

    // ordenar alfabético
    unicas.sort();

    // crear chips
    unicas.forEach(function (t) {
        let chip = document.createElement("span");
        chip.className = "tech-chip"; // <- CADA TECNOLOGÍA ES UN TECH CHIP
        chip.textContent = t;

        techChips.appendChild(chip);
    });
}

/* =========================================================
   ENLACE DIRECTO A README (GitHub)
   - Usa enlace_al_repositorio y agrega #readme
   ========================================================= */
function enlaceReadme(repoUrl) {
    if (!repoUrl) return "";
    return repoUrl.replace(/\/$/, "") + "#readme";
}

