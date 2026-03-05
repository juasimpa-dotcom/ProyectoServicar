const url = "http://localhost:8000/mantenimientos";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-m");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
let modoEdicion = false, idEditando = null;

const cargarTodos = () => {
    fetch(url).then(r => r.json()).then(data => { mostrar(data); });
};

const cargarPorVehiculo = () => {
    const id = document.getElementById("filtro_vehiculo").value;
    if (!id) { alert("Ingrese un ID de vehículo"); return; }
    fetch(`${url}/vehiculo/${id}`).then(r => r.json()).then(data => { mostrar(data); });
};

const mostrar = (data) => {
    let resultado = data.length === 0 ? "<li>No se encontraron registros.</li>" : "";
    for (let i = 0; i < data.length; i++) {
        resultado += `<li>
            <p><b>ID:</b> ${data[i].id_mantenimiento} | <b>Vehículo:</b> ${data[i].id_vehiculo} | <b>Fecha:</b> ${data[i].fecha_servicio} | <b>Estado:</b> ${data[i].estado}</p>
            <button onclick="prepararEdicion(${data[i].id_mantenimiento})">Editar</button>
            <button onclick="eliminar(${data[i].id_mantenimiento})">Eliminar</button><hr></li>`;
    }
    contenedor.innerHTML = resultado;
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
        id_vehiculo:          parseInt(document.getElementById("id_vehiculo").value),
        id_tipo_servicio:     parseInt(document.getElementById("id_tipo_servicio").value),
        id_mecanico:          document.getElementById("id_mecanico").value ? parseInt(document.getElementById("id_mecanico").value) : null,
        id_usuario_registro:  parseInt(document.getElementById("id_usuario_registro").value),
        fecha_servicio:       document.getElementById("fecha_servicio").value,
        kilometraje_servicio: parseInt(document.getElementById("kilometraje_servicio").value),
        costo_mano_obra:      parseFloat(document.getElementById("costo_mano_obra").value),
        observaciones:        document.getElementById("observaciones").value || null,
        proxima_fecha:        document.getElementById("proxima_fecha").value || null,
        proximo_kilometraje:  document.getElementById("proximo_kilometraje").value ? parseInt(document.getElementById("proximo_kilometraje").value) : null,
        estado:               document.getElementById("estado").value
    };
    if (modoEdicion) {
        fetch(`${url}/${idEditando}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); cancelarEdicion(); cargarTodos(); });
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); form.reset(); cargarTodos(); });
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`).then(r => r.json()).then(data => {
        document.getElementById("id_vehiculo").value          = data.id_vehiculo;
        document.getElementById("id_tipo_servicio").value     = data.id_tipo_servicio;
        document.getElementById("id_mecanico").value          = data.id_mecanico ?? "";
        document.getElementById("id_usuario_registro").value  = data.id_usuario_registro;
        document.getElementById("fecha_servicio").value       = data.fecha_servicio;
        document.getElementById("kilometraje_servicio").value = data.kilometraje_servicio;
        document.getElementById("costo_mano_obra").value      = data.costo_mano_obra;
        document.getElementById("observaciones").value        = data.observaciones ?? "";
        document.getElementById("proxima_fecha").value        = data.proxima_fecha ?? "";
        document.getElementById("proximo_kilometraje").value  = data.proximo_kilometraje ?? "";
        document.getElementById("estado").value               = data.estado;
        modoEdicion = true; idEditando = id;
        tituloForm.textContent = `Editar Mantenimiento #${id}`;
        btnCancelar.style.display = "inline";
    });
};

const cancelarEdicion = () => {
    form.reset(); modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Registrar Mantenimiento";
    btnCancelar.style.display = "none";
};

const eliminar = (id) => {
    if (!confirm(`¿Eliminar mantenimiento #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE" }).then(r => r.json()).then(d => { alert(d.mensaje); cargarTodos(); });
};

btnCancelar.addEventListener("click", cancelarEdicion);
cargarTodos();