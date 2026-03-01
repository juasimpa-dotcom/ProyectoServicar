const url = "http://localhost:8000/mantenimiento-repuestos";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-mr");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");

let modoEdicion = false;
let idEditando = null;

const cargarTodos = () => {
    fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(response => response.json())
    .then(data => { mostrarDatos(data); })
    .catch(error => console.log("Error al cargar:", error));
};

const cargarPorMantenimiento = () => {
    const id = document.getElementById("filtro_mantenimiento").value;
    if (!id) { alert("Ingrese un ID de mantenimiento"); return; }
    fetch(`${url}/mantenimiento/${id}`, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(response => response.json())
    .then(data => { mostrarDatos(data); })
    .catch(error => console.log("Error al filtrar:", error));
};

const mostrarDatos = (data) => {
    let resultado = "";
    if (data.length === 0) { resultado = "<li>No se encontraron registros.</li>"; }
    for (let i = 0; i < data.length; i++) {
        resultado += `
        <li>
            <p><b>ID:</b> ${data[i].id}</p>
            <p><b>ID Mantenimiento:</b> ${data[i].id_mantenimiento}</p>
            <p><b>ID Repuesto:</b> ${data[i].id_repuesto}</p>
            <p><b>Cantidad:</b> ${data[i].cantidad}</p>
            <p><b>Precio Unitario:</b> Bs. ${data[i].precio_unitario}</p>
            <p><b>Subtotal:</b> Bs. ${data[i].subtotal}</p>
            <button onclick="prepararEdicion(${data[i].id})">Editar</button>
            <button onclick="eliminarRegistro(${data[i].id})">Eliminar</button>
            <hr>
        </li>`;
    }
    contenedor.innerHTML = resultado;
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
        id:               parseInt(document.getElementById("id").value),
        id_mantenimiento: parseInt(document.getElementById("id_mantenimiento").value),
        id_repuesto:      parseInt(document.getElementById("id_repuesto").value),
        cantidad:         parseFloat(document.getElementById("cantidad").value),
        precio_unitario:  parseFloat(document.getElementById("precio_unitario").value)
    };

    if (modoEdicion) {
        fetch(`${url}/${idEditando}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cantidad: datos.cantidad, precio_unitario: datos.precio_unitario })
        })
        .then(r => r.json()).then(data => { alert(data.mensaje); cancelarEdicion(); cargarTodos(); })
        .catch(error => console.log("Error al actualizar:", error));
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(data => { alert(data.mensaje); form.reset(); cargarTodos(); })
        .catch(error => console.log("Error al insertar:", error));
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(r => r.json())
    .then(data => {
        document.getElementById("id").value               = data.id;
        document.getElementById("id").disabled            = true;
        document.getElementById("id_mantenimiento").value = data.id_mantenimiento;
        document.getElementById("id_mantenimiento").disabled = true;
        document.getElementById("id_repuesto").value      = data.id_repuesto;
        document.getElementById("id_repuesto").disabled   = true;
        document.getElementById("cantidad").value         = data.cantidad;
        document.getElementById("precio_unitario").value  = data.precio_unitario;
        modoEdicion = true; idEditando = id;
        tituloForm.textContent = `Editar Registro #${id}`;
        btnCancelar.style.display = "inline";
    })
    .catch(error => console.log("Error al obtener registro:", error));
};

const cancelarEdicion = () => {
    form.reset();
    document.getElementById("id").disabled = false;
    document.getElementById("id_mantenimiento").disabled = false;
    document.getElementById("id_repuesto").disabled = false;
    modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Agregar Repuesto a Mantenimiento";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

const eliminarRegistro = (id) => {
    if (!confirm(`¿Eliminar registro #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } })
    .then(r => r.json()).then(data => { alert(data.mensaje); cargarTodos(); })
    .catch(error => console.log("Error al eliminar:", error));
};

cargarTodos();