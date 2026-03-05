const url = "http://localhost:8000/categorias-mantenimiento";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-categoria");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
let modoEdicion = false, idEditando = null;

const cargarCategorias = () => {
    fetch(url).then(r => r.json()).then(data => {
        let resultado = "";
        for (let i = 0; i < data.length; i++) {
            resultado += `<li>
                <p><b>ID:</b> ${data[i].id_categoria} | <b>Nombre:</b> ${data[i].nombre} | <b>Activo:</b> ${data[i].activo ? "Sí" : "No"}</p>
                <p>${data[i].descripcion ?? ""}</p>
                <button onclick="prepararEdicion(${data[i].id_categoria})">Editar</button>
                <button onclick="eliminar(${data[i].id_categoria})">Eliminar</button><hr></li>`;
        }
        contenedor.innerHTML = resultado;
    });
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = { nombre: document.getElementById("nombre").value, descripcion: document.getElementById("descripcion").value || null, activo: document.getElementById("activo").checked };
    if (modoEdicion) {
        fetch(`${url}/${idEditando}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); cancelarEdicion(); cargarCategorias(); });
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); form.reset(); cargarCategorias(); });
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`).then(r => r.json()).then(data => {
        document.getElementById("nombre").value      = data.nombre;
        document.getElementById("descripcion").value = data.descripcion ?? "";
        document.getElementById("activo").checked    = data.activo;
        modoEdicion = true; idEditando = id;
        tituloForm.textContent = `Editar Categoría #${id}`;
        btnCancelar.style.display = "inline";
    });
};

const cancelarEdicion = () => {
    form.reset(); modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Registrar Categoría";
    btnCancelar.style.display = "none";
};

const eliminar = (id) => {
    if (!confirm(`¿Eliminar categoría #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE" }).then(r => r.json()).then(d => { alert(d.mensaje); cargarCategorias(); });
};

btnCancelar.addEventListener("click", cancelarEdicion);
cargarCategorias();