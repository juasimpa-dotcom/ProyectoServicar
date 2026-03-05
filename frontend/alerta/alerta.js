const url = "http://localhost:8000/alertas";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-alerta");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
let modoEdicion = false, idEditando = null;

const cargarTodas = () => {
    fetch(url).then(r => r.json()).then(data => { mostrar(data); });
};

const cargarPendientes = () => {
    fetch(`${url}/pendientes/all`).then(r => r.json()).then(data => { mostrar(data); });
};

const cargarPorVehiculo = () => {
    const id = document.getElementById("filtro_vehiculo").value;
    if (!id) { alert("Ingrese un ID de vehículo"); return; }
    fetch(`${url}/vehiculo/${id}`).then(r => r.json()).then(data => { mostrar(data); });
};

const mostrar = (data) => {
    let resultado = data.length === 0 ? "<li>No se encontraron alertas.</li>" : "";
    for (let i = 0; i < data.length; i++) {
        resultado += `<li>
            <p><b>ID:</b> ${data[i].id_alerta} | <b>Vehículo:</b> ${data[i].id_vehiculo} | <b>Tipo:</b> ${data[i].tipo_alerta} | <b>Estado:</b> ${data[i].estado}</p>
            <p>${data[i].mensaje ?? ""}</p>
            <button onclick="prepararEdicion(${data[i].id_alerta})">Editar</button>
            <button onclick="eliminar(${data[i].id_alerta})">Eliminar</button><hr></li>`;
    }
    contenedor.innerHTML = resultado;
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
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
        fetch(`${url}/${idEditando}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); cancelarEdicion(); cargarTodas(); });
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); form.reset(); cargarTodas(); });
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`).then(r => r.json()).then(data => {
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
    });
};

const cancelarEdicion = () => {
    form.reset(); modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Registrar Alerta";
    btnCancelar.style.display = "none";
};

const eliminar = (id) => {
    if (!confirm(`¿Eliminar alerta #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE" }).then(r => r.json()).then(d => { alert(d.mensaje); cargarTodas(); });
};

btnCancelar.addEventListener("click", cancelarEdicion);
cargarTodas();