const url = "http://localhost:8000/alertas";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-alerta");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");

let modoEdicion = false;
let idEditando = null;

const cargarAlertas = () => {
    fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(response => response.json())
    .then(data => { mostrarAlertas(data); })
    .catch(error => console.log("Error al cargar alertas:", error));
};

const cargarPorVehiculo = () => {
    const id = document.getElementById("filtro_vehiculo").value;
    if (!id) { alert("Ingrese un ID de vehículo"); return; }
    fetch(`${url}/vehiculo/${id}`, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(response => response.json())
    .then(data => { mostrarAlertas(data); })
    .catch(error => console.log("Error al filtrar por vehículo:", error));
};

const cargarPendientes = () => {
    fetch(`${url}/pendientes/all`, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(response => response.json())
    .then(data => { mostrarAlertas(data); })
    .catch(error => console.log("Error al cargar pendientes:", error));
};

const mostrarAlertas = (data) => {
    let resultado = "";
    if (data.length === 0) { resultado = "<li>No se encontraron alertas.</li>"; }
    for (let i = 0; i < data.length; i++) {
        resultado += `
        <li>
            <p><b>ID:</b> ${data[i].id_alerta}</p>
            <p><b>ID Vehículo:</b> ${data[i].id_vehiculo}</p>
            <p><b>ID Tipo Servicio:</b> ${data[i].id_tipo_servicio}</p>
            <p><b>Tipo Alerta:</b> ${data[i].tipo_alerta}</p>
            <p><b>Fecha Alerta:</b> ${data[i].fecha_alerta ?? "—"}</p>
            <p><b>Kilometraje Alerta:</b> ${data[i].kilometraje_alerta ?? "—"}</p>
            <p><b>Mensaje:</b> ${data[i].mensaje ?? "—"}</p>
            <p><b>Estado:</b> ${data[i].estado}</p>
            <button onclick="prepararEdicion(${data[i].id_alerta})">Editar</button>
            <button onclick="eliminarAlerta(${data[i].id_alerta})">Eliminar</button>
            <hr>
        </li>`;
    }
    contenedor.innerHTML = resultado;
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
        id_alerta:          parseInt(document.getElementById("id_alerta").value),
        id_vehiculo:        parseInt(document.getElementById("id_vehiculo").value),
        id_tipo_servicio:   parseInt(document.getElementById("id_tipo_servicio").value),
        id_mantenimiento:   document.getElementById("id_mantenimiento").value ? parseInt(document.getElementById("id_mantenimiento").value) : null,
        tipo_alerta:        document.getElementById("tipo_alerta").value,
        fecha_alerta:       document.getElementById("fecha_alerta").value || null,
        kilometraje_alerta: document.getElementById("kilometraje_alerta").value ? parseInt(document.getElementById("kilometraje_alerta").value) : null,
        mensaje:            document.getElementById("mensaje").value || null,
        estado:             document.getElementById("estado").value
    };

    if (modoEdicion) {
        const datosUpdate = {
            tipo_alerta:        datos.tipo_alerta,
            fecha_alerta:       datos.fecha_alerta,
            kilometraje_alerta: datos.kilometraje_alerta,
            mensaje:            datos.mensaje,
            estado:             datos.estado
        };
        fetch(`${url}/${idEditando}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosUpdate)
        })
        .then(r => r.json()).then(data => { alert(data.mensaje); cancelarEdicion(); cargarAlertas(); })
        .catch(error => console.log("Error al actualizar:", error));
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(data => { alert(data.mensaje); form.reset(); cargarAlertas(); })
        .catch(error => console.log("Error al insertar:", error));
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(r => r.json())
    .then(data => {
        document.getElementById("id_alerta").value          = data.id_alerta;
        document.getElementById("id_alerta").disabled       = true;
        document.getElementById("id_vehiculo").value        = data.id_vehiculo;
        document.getElementById("id_tipo_servicio").value   = data.id_tipo_servicio;
        document.getElementById("id_mantenimiento").value   = data.id_mantenimiento ?? "";
        document.getElementById("tipo_alerta").value        = data.tipo_alerta;
        document.getElementById("fecha_alerta").value       = data.fecha_alerta ?? "";
        document.getElementById("kilometraje_alerta").value = data.kilometraje_alerta ?? "";
        document.getElementById("mensaje").value            = data.mensaje ?? "";
        document.getElementById("estado").value             = data.estado;
        modoEdicion = true; idEditando = id;
        tituloForm.textContent = `Editar Alerta #${id}`;
        btnCancelar.style.display = "inline";
    })
    .catch(error => console.log("Error al obtener alerta:", error));
};

const cancelarEdicion = () => {
    form.reset();
    document.getElementById("id_alerta").disabled = false;
    modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Registrar Alerta";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

const eliminarAlerta = (id) => {
    if (!confirm(`¿Eliminar alerta #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } })
    .then(r => r.json()).then(data => { alert(data.mensaje); cargarAlertas(); })
    .catch(error => console.log("Error al eliminar:", error));
};

cargarAlertas();