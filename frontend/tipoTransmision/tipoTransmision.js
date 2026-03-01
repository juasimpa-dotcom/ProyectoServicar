const url = "http://localhost:8000/tipos-transmision";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-transmision");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");

let modoEdicion = false;
let idEditando = null;

const cargarTransmisiones = () => {
    fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(response => response.json())
    .then(data => {
        let resultado = "";
        for (let i = 0; i < data.length; i++) {
            resultado += `
            <li>
                <p><b>ID:</b> ${data[i].id_transmision}</p>
                <p><b>Nombre:</b> ${data[i].nombre}</p>
                <button onclick="prepararEdicion(${data[i].id_transmision})">Editar</button>
                <button onclick="eliminarTransmision(${data[i].id_transmision})">Eliminar</button>
                <hr>
            </li>`;
        }
        contenedor.innerHTML = resultado;
    })
    .catch(error => console.log("Error al cargar transmisiones:", error));
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
        id_transmision: parseInt(document.getElementById("id_transmision").value),
        nombre:         document.getElementById("nombre").value
    };

    if (modoEdicion) {
        fetch(`${url}/${idEditando}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: datos.nombre })
        })
        .then(r => r.json()).then(data => { alert(data.mensaje); cancelarEdicion(); cargarTransmisiones(); })
        .catch(error => console.log("Error al actualizar:", error));
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(data => { alert(data.mensaje); form.reset(); cargarTransmisiones(); })
        .catch(error => console.log("Error al insertar:", error));
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(r => r.json())
    .then(data => {
        document.getElementById("id_transmision").value    = data.id_transmision;
        document.getElementById("id_transmision").disabled = true;
        document.getElementById("nombre").value            = data.nombre;
        modoEdicion = true; idEditando = id;
        tituloForm.textContent = `Editar Transmisión #${id}`;
        btnCancelar.style.display = "inline";
    })
    .catch(error => console.log("Error al obtener transmisión:", error));
};

const cancelarEdicion = () => {
    form.reset();
    document.getElementById("id_transmision").disabled = false;
    modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Registrar Tipo de Transmisión";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

const eliminarTransmision = (id) => {
    if (!confirm(`¿Eliminar tipo de transmisión #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } })
    .then(r => r.json()).then(data => { alert(data.mensaje); cargarTransmisiones(); })
    .catch(error => console.log("Error al eliminar:", error));
};

cargarTransmisiones();