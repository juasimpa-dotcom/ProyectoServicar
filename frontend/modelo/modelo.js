const url = "http://localhost:8000/modelos";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-modelo");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");

let modoEdicion = false;
let idEditando = null;

const cargarModelos = () => {
    fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(response => response.json())
    .then(data => {
        let resultado = "";
        for (let i = 0; i < data.length; i++) {
            resultado += `
            <li>
                <p><b>ID:</b> ${data[i].id_modelo}</p>
                <p><b>ID Marca:</b> ${data[i].id_marca}</p>
                <p><b>Nombre:</b> ${data[i].nombre}</p>
                <p><b>Activo:</b> ${data[i].activo ? "Sí" : "No"}</p>
                <button onclick="prepararEdicion(${data[i].id_modelo})">Editar</button>
                <button onclick="eliminarModelo(${data[i].id_modelo})">Eliminar</button>
                <hr>
            </li>`;
        }
        contenedor.innerHTML = resultado;
    })
    .catch(error => console.log("Error al cargar modelos:", error));
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
        id_modelo: parseInt(document.getElementById("id_modelo").value),
        id_marca:  parseInt(document.getElementById("id_marca").value),
        nombre:    document.getElementById("nombre").value,
        activo:    document.getElementById("activo").checked
    };

    if (modoEdicion) {
        fetch(`${url}/${idEditando}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_marca: datos.id_marca, nombre: datos.nombre, activo: datos.activo })
        })
        .then(r => r.json()).then(data => { alert(data.mensaje); cancelarEdicion(); cargarModelos(); })
        .catch(error => console.log("Error al actualizar:", error));
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(data => { alert(data.mensaje); form.reset(); cargarModelos(); })
        .catch(error => console.log("Error al insertar:", error));
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(r => r.json())
    .then(data => {
        document.getElementById("id_modelo").value    = data.id_modelo;
        document.getElementById("id_modelo").disabled = true;
        document.getElementById("id_marca").value     = data.id_marca;
        document.getElementById("nombre").value       = data.nombre;
        document.getElementById("activo").checked     = data.activo;
        modoEdicion = true; idEditando = id;
        tituloForm.textContent = `Editar Modelo #${id}`;
        btnCancelar.style.display = "inline";
    })
    .catch(error => console.log("Error al obtener modelo:", error));
};

const cancelarEdicion = () => {
    form.reset();
    document.getElementById("id_modelo").disabled = false;
    modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Registrar Modelo";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

const eliminarModelo = (id) => {
    if (!confirm(`¿Eliminar modelo #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } })
    .then(r => r.json()).then(data => { alert(data.mensaje); cargarModelos(); })
    .catch(error => console.log("Error al eliminar:", error));
};

cargarModelos();