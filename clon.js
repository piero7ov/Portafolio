/* =========================================================
   clon.js
   - Render + filtros (simple)
   ========================================================= */

let origen = document.querySelector("#tpl-proyecto");
let destino = document.querySelector("#proyectos-grid");

let buscador = document.querySelector("#buscador");
let filtroTec = document.querySelector("#filtro-tecnologia");
let orden = document.querySelector("#orden");
let btnLimpiar = document.querySelector("#btn-limpiar");

let listaOriginal = []; // aquí guardamos TODOS los proyectos

fetch("proyectos.json")
    .then(function (respuesta) { return respuesta.json(); })
    .then(function (datos) {

        // Tu JSON: { proyectos: [ ... ] }
        listaOriginal = datos.proyectos;

        // 1) llenar select tecnologías
        llenarSelectTecnologias(listaOriginal);

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
            render(listaOriginal);
        });
    })
    .catch(function (error) {
        console.log("Error cargando proyectos.json:", error);
    });

/* =========================================================
   RENDER
   ========================================================= */
function render(lista) {
    // borra lo que haya (incluye los mocks del HTML)
    destino.innerHTML = "";

    lista.forEach(function (dato) {
        let clon = origen.content.cloneNode(true);

        clon.querySelector(".proyecto-titulo").textContent = dato.titulo;
        clon.querySelector(".proyecto-fecha").textContent = dato.fecha_de_creacion;

        clon.querySelector(".proyecto-img").setAttribute("src", dato.imagen);
        clon.querySelector(".proyecto-img").setAttribute("alt", "Captura de " + dato.titulo);

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
