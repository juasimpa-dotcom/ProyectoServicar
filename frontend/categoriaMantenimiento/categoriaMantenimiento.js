const url = "http://localhost:8000/categorias-mantenimiento";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-categoria");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");

let modoEdicion = false;
let idEditando = null;

const cargarCategorias = () => {
    fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(response => response.json())
    .then(data => {
        let resultado = "";
        for (let i = 0; i < data.length; i++) {
            resultado += `
            <li>
                <p><b>ID:</b> ${data[i].id_categoria}</p>
                <p><b>Nombre:</b> ${data[i].nombre}</p>
                <p><b>Descripción:</b> ${data[i].descripcion ?? "—"}</p>
                <p><b>Activo:</b> ${data[i].activo ? "Sí" : "No"}</p>
                <button onclick="prepararEdicion(${data[i].id_categoria})">Editar</button>
                <button onclick="eliminarCategoria(${data[i].id_categoria})">Eliminar</button>
                <hr>
            </li>`;
        }
        contenedor.innerHTML = resultado;
    })
    .catch(error => console.log("Error al cargar categorías:", error));
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
        id_categoria: parseInt(document.getElementById("id_categoria").value),
        nombre:       document.getElementById("nombre").value,
        descripcion:  document.getElementById("descripcion").value || null,
        activo:       document.getElementById("activo").checked
    };

    if (modoEdicion) {
        fetch(`${url}/${idEditando}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: datos.nombre, descripcion: datos.descripcion, activo: datos.activo })
        })
        .then(r => r.json()).then(data => { alert(data.mensaje); cancelarEdicion(); cargarCategorias(); })
        .catch(error => console.log("Error al actualizar:", error));
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(data => { alert(data.mensaje); form.reset(); cargarCategorias(); })
        .catch(error => console.log("Error al insertar:", error));
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(r => r.json())
    .then(data => {
        document.getElementById("id_categoria").value    = data.id_categoria;
        document.getElementById("id_categoria").disabled = true;
        document.getElementById("nombre").value          = data.nombre;
        document.getElementById("descripcion").value     = data.descripcion ?? "";
        document.getElementById("activo").checked        = data.activo;
        modoEdicion = true; idEditando = id;
        tituloForm.textContent = `Editar Categoría #${id}`;
        btnCancelar.style.display = "inline";
    })
    .catch(error => console.log("Error al obtener categoría:", error));
};

const cancelarEdicion = () => {
    form.reset();
    document.getElementById("id_categoria").disabled = false;
    modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Registrar Categoría";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

const eliminarCategoria = (id) => {
    if (!confirm(`¿Eliminar categoría #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } })
    .then(r => r.json()).then(data => { alert(data.mensaje); cargarCategorias(); })
    .catch(error => console.log("Error al eliminar:", error));
};

cargarCategorias();