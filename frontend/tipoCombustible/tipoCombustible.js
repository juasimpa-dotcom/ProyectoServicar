const url = "http://localhost:8000/tipos-combustible";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-combustible");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");

let modoEdicion = false;
let idEditando = null;

const cargarCombustibles = () => {
    fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(response => response.json())
    .then(data => {
        let resultado = "";
        for (let i = 0; i < data.length; i++) {
            resultado += `
            <li>
                <p><b>ID:</b> ${data[i].id_combustible}</p>
                <p><b>Nombre:</b> ${data[i].nombre}</p>
                <button onclick="prepararEdicion(${data[i].id_combustible})">Editar</button>
                <button onclick="eliminarCombustible(${data[i].id_combustible})">Eliminar</button>
                <hr>
            </li>`;
        }
        contenedor.innerHTML = resultado;
    })
    .catch(error => console.log("Error al cargar combustibles:", error));
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
        id_combustible: parseInt(document.getElementById("id_combustible").value),
        nombre:         document.getElementById("nombre").value
    };

    if (modoEdicion) {
        fetch(`${url}/${idEditando}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: datos.nombre })
        })
        .then(r => r.json()).then(data => { alert(data.mensaje); cancelarEdicion(); cargarCombustibles(); })
        .catch(error => console.log("Error al actualizar:", error));
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(data => { alert(data.mensaje); form.reset(); cargarCombustibles(); })
        .catch(error => console.log("Error al insertar:", error));
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(r => r.json())
    .then(data => {
        document.getElementById("id_combustible").value    = data.id_combustible;
        document.getElementById("id_combustible").disabled = true;
        document.getElementById("nombre").value            = data.nombre;
        modoEdicion = true; idEditando = id;
        tituloForm.textContent = `Editar Combustible #${id}`;
        btnCancelar.style.display = "inline";
    })
    .catch(error => console.log("Error al obtener combustible:", error));
};

const cancelarEdicion = () => {
    form.reset();
    document.getElementById("id_combustible").disabled = false;
    modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Registrar Tipo de Combustible";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

const eliminarCombustible = (id) => {
    if (!confirm(`¿Eliminar tipo de combustible #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } })
    .then(r => r.json()).then(data => { alert(data.mensaje); cargarCombustibles(); })
    .catch(error => console.log("Error al eliminar:", error));
};

cargarCombustibles();