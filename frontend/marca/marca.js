const url = "http://localhost:8000/marcas";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-marca");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");

let modoEdicion = false;
let idEditando = null;

const cargarMarcas = () => {
    fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(response => response.json())
    .then(data => {
        let resultado = "";
        for (let i = 0; i < data.length; i++) {
            resultado += `
            <li>
                <p><b>ID:</b> ${data[i].id_marca}</p>
                <p><b>Nombre:</b> ${data[i].nombre}</p>
                <p><b>Activo:</b> ${data[i].activo ? "Sí" : "No"}</p>
                <button onclick="prepararEdicion(${data[i].id_marca})">Editar</button>
                <button onclick="eliminarMarca(${data[i].id_marca})">Eliminar</button>
                <hr>
            </li>`;
        }
        contenedor.innerHTML = resultado;
    })
    .catch(error => console.log("Error al cargar marcas:", error));
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
        id_marca: parseInt(document.getElementById("id_marca").value),
        nombre:   document.getElementById("nombre").value,
        activo:   document.getElementById("activo").checked
    };

    if (modoEdicion) {
        fetch(`${url}/${idEditando}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: datos.nombre, activo: datos.activo })
        })
        .then(r => r.json()).then(data => { alert(data.mensaje); cancelarEdicion(); cargarMarcas(); })
        .catch(error => console.log("Error al actualizar:", error));
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(data => { alert(data.mensaje); form.reset(); cargarMarcas(); })
        .catch(error => console.log("Error al insertar:", error));
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(r => r.json())
    .then(data => {
        document.getElementById("id_marca").value     = data.id_marca;
        document.getElementById("id_marca").disabled  = true;
        document.getElementById("nombre").value       = data.nombre;
        document.getElementById("activo").checked     = data.activo;
        modoEdicion = true; idEditando = id;
        tituloForm.textContent = `Editar Marca #${id}`;
        btnCancelar.style.display = "inline";
    })
    .catch(error => console.log("Error al obtener marca:", error));
};

const cancelarEdicion = () => {
    form.reset();
    document.getElementById("id_marca").disabled = false;
    modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Registrar Marca";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

const eliminarMarca = (id) => {
    if (!confirm(`¿Eliminar marca #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } })
    .then(r => r.json()).then(data => { alert(data.mensaje); cargarMarcas(); })
    .catch(error => console.log("Error al eliminar:", error));
};

cargarMarcas();