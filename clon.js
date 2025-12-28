/* =========================================================
   clon.js
   - Lee proyectos.json y clona #tpl-proyecto dentro de #proyectos-grid
   ========================================================= */

let origen = document.querySelector("#tpl-proyecto");
let destino = document.querySelector("#proyectos-grid");

fetch("proyectos.json")
    .then(function (respuesta) { return respuesta.json(); })
    .then(function (datos) {

        // datos.proyectos es tu array
        let lista = datos.proyectos;

        // Borra los artículos "mock" que tienes en el HTML
        destino.innerHTML = "";

        lista.forEach(function (dato) {
            let clon = origen.content.cloneNode(true);

            // Título
            clon.querySelector(".proyecto-titulo").textContent = dato.titulo;

            // Fecha (tu JSON usa fecha_de_creacion)
            clon.querySelector(".proyecto-fecha").textContent = dato.fecha_de_creacion;

            // Imagen
            clon.querySelector(".proyecto-img").setAttribute("src", dato.imagen);
            clon.querySelector(".proyecto-img").setAttribute("alt", "Captura de " + dato.titulo);

            // Descripción
            clon.querySelector(".proyecto-descripcion").textContent = dato.descripcion;

            // Tecnologías (crear tags)
            let contTags = clon.querySelector(".proyecto-tags");
            contTags.innerHTML = "";

            dato.tecnologias.forEach(function (tec) {
                let tag = document.createElement("span");
                tag.className = "tag";
                tag.textContent = tec;
                contTags.appendChild(tag);
            });

            // Repo (tu JSON usa enlace_al_repositorio)
            clon.querySelector(".btn-repo").setAttribute("href", dato.enlace_al_repositorio);

            // Insertar en el DOM
            destino.appendChild(clon);
        });
    })
    .catch(function (error) {
        console.log("Error cargando proyectos.json:", error);
    });
