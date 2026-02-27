const url = "http://localhost:8000/mantenimientos";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-mantenimiento");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");

let modoEdicion = false;
let idEditando = null;

// ── LISTAR TODOS ──────────────────────────────────────────────
const cargarMantenimientos = () => {
    fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        mostrarMantenimientos(data);
        console.log("Mantenimientos cargados:", data);
    })
    .catch(error => console.log("Error al cargar mantenimientos:", error));
};

// ── HISTORIAL POR VEHÍCULO ────────────────────────────────────
const cargarHistorial = () => {
    const idVehiculo = document.getElementById("filtro_vehiculo").value;
    if (!idVehiculo) {
        alert("Ingrese el ID del vehículo para consultar el historial");
        return;
    }

    fetch(`${url}/vehiculo/${idVehiculo}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        mostrarMantenimientos(data);
        console.log(`Historial del vehículo #${idVehiculo}:`, data);
    })
    .catch(error => console.log("Error al cargar historial:", error));
};

// ── MOSTRAR DATOS EN PANTALLA ─────────────────────────────────
const mostrarMantenimientos = (data) => {
    let resultado = "";
    if (data.length === 0) {
        resultado = "<li>No se encontraron mantenimientos.</li>";
    }
    for (let i = 0; i < data.length; i++) {
        resultado += `
        <li>
            <p><b>ID:</b> ${data[i].id_mantenimiento}</p>
            <p><b>Placa:</b> ${data[i].placa}</p>
            <p><b>Propietario:</b> ${data[i].propietario}</p>
            <p><b>Tipo Servicio:</b> ${data[i].tipo_servicio}</p>
            <p><b>Categoría:</b> ${data[i].categoria}</p>
            <p><b>Fecha:</b> ${data[i].fecha_servicio}</p>
            <p><b>Kilometraje:</b> ${data[i].kilometraje_servicio} km</p>
            <p><b>Mecánico:</b> ${data[i].mecanico ?? "—"}</p>
            <p><b>Costo M.O.:</b> Bs. ${data[i].costo_mano_obra}</p>
            <p><b>Observaciones:</b> ${data[i].observaciones ?? "—"}</p>
            <p><b>Próxima Fecha:</b> ${data[i].proxima_fecha ?? "—"}</p>
            <p><b>Próximo KM:</b> ${data[i].proximo_kilometraje ?? "—"}</p>
            <p><b>Estado:</b> ${data[i].estado}</p>
            <button onclick="prepararEdicion(${data[i].id_mantenimiento})">Editar</button>
            <button onclick="eliminarMantenimiento(${data[i].id_mantenimiento})">Eliminar</button>
            <hr>
        </li>`;
    }
    contenedor.innerHTML = resultado;
};

// ── INSERTAR / ACTUALIZAR ─────────────────────────────────────
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const datos = {
        id_mantenimiento:    parseInt(document.getElementById("id_mantenimiento").value),
        id_vehiculo:         parseInt(document.getElementById("id_vehiculo").value),
        id_tipo_servicio:    parseInt(document.getElementById("id_tipo_servicio").value),
        id_mecanico:         document.getElementById("id_mecanico").value
                               ? parseInt(document.getElementById("id_mecanico").value) : null,
        id_usuario_registro: parseInt(document.getElementById("id_usuario_registro").value),
        fecha_servicio:      document.getElementById("fecha_servicio").value,
        kilometraje_servicio: parseInt(document.getElementById("kilometraje_servicio").value),
        costo_mano_obra:     parseFloat(document.getElementById("costo_mano_obra").value),
        observaciones:       document.getElementById("observaciones").value || null,
        proxima_fecha:       document.getElementById("proxima_fecha").value || null,
        proximo_kilometraje: document.getElementById("proximo_kilometraje").value
                               ? parseInt(document.getElementById("proximo_kilometraje").value) : null,
        estado:              document.getElementById("estado").value
    };

    if (modoEdicion) {
        const datosUpdate = {
            id_tipo_servicio:    datos.id_tipo_servicio,
            id_mecanico:         datos.id_mecanico,
            fecha_servicio:      datos.fecha_servicio,
            kilometraje_servicio: datos.kilometraje_servicio,
            costo_mano_obra:     datos.costo_mano_obra,
            observaciones:       datos.observaciones,
            proxima_fecha:       datos.proxima_fecha,
            proximo_kilometraje: datos.proximo_kilometraje,
            estado:              datos.estado
        };

        fetch(`${url}/${idEditando}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosUpdate)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.mensaje);
            alert(data.mensaje);
            cancelarEdicion();
            cargarMantenimientos();
        })
        .catch(error => console.log("Error al actualizar:", error));
    } else {
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.mensaje);
            alert(data.mensaje);
            form.reset();
            cargarMantenimientos();
        })
        .catch(error => console.log("Error al insertar:", error));
    }
});

// ── PREPARAR EDICIÓN ──────────────────────────────────────────
const prepararEdicion = (id) => {
    fetch(`${url}/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("id_mantenimiento").value    = data.id_mantenimiento;
        document.getElementById("id_mantenimiento").disabled = true;
        document.getElementById("id_vehiculo").value         = data.id_vehiculo;
        document.getElementById("id_tipo_servicio").value    = data.id_tipo_servicio;
        document.getElementById("id_mecanico").value         = data.id_mecanico ?? "";
        document.getElementById("id_usuario_registro").value = data.id_usuario_registro ?? "";
        document.getElementById("fecha_servicio").value      = data.fecha_servicio;
        document.getElementById("kilometraje_servicio").value = data.kilometraje_servicio;
        document.getElementById("costo_mano_obra").value     = data.costo_mano_obra;
        document.getElementById("observaciones").value       = data.observaciones ?? "";
        document.getElementById("proxima_fecha").value       = data.proxima_fecha ?? "";
        document.getElementById("proximo_kilometraje").value = data.proximo_kilometraje ?? "";
        document.getElementById("estado").value              = data.estado;

        modoEdicion = true;
        idEditando = id;
        tituloForm.textContent = `Editar Mantenimiento #${id}`;
        btnCancelar.style.display = "inline";
    })
    .catch(error => console.log("Error al obtener mantenimiento:", error));
};

// ── CANCELAR EDICIÓN ──────────────────────────────────────────
const cancelarEdicion = () => {
    form.reset();
    document.getElementById("id_mantenimiento").disabled = false;
    modoEdicion = false;
    idEditando = null;
    tituloForm.textContent = "Registrar Mantenimiento";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

// ── ELIMINAR ──────────────────────────────────────────────────
const eliminarMantenimiento = (id) => {
    if (!confirm(`¿Está seguro de eliminar el mantenimiento #${id}?`)) return;

    fetch(`${url}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.mensaje);
        alert(data.mensaje);
        cargarMantenimientos();
    })
    .catch(error => console.log("Error al eliminar:", error));
};

// ── INICIO ────────────────────────────────────────────────────
cargarMantenimientos();