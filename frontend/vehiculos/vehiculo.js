const url = "http://localhost:8000/vehiculos";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-vehiculo");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");

let modoEdicion = false;
let idEditando = null;

// ── LISTAR ────────────────────────────────────────────────────
const cargarVehiculos = () => {
    fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        let resultado = "";
        for (let i = 0; i < data.length; i++) {
            resultado += `
            <li>
                <p><b>ID:</b> ${data[i].id_vehiculo}</p>
                <p><b>Placa:</b> ${data[i].placa}</p>
                <p><b>Propietario:</b> ${data[i].propietario}</p>
                <p><b>Marca:</b> ${data[i].marca}</p>
                <p><b>Modelo:</b> ${data[i].modelo}</p>
                <p><b>Año:</b> ${data[i].anio_fabricacion}</p>
                <p><b>Color:</b> ${data[i].color ?? "—"}</p>
                <p><b>Combustible:</b> ${data[i].combustible}</p>
                <p><b>Transmisión:</b> ${data[i].transmision}</p>
                <p><b>Kilometraje:</b> ${data[i].kilometraje_actual} km</p>
                <p><b>Activo:</b> ${data[i].activo ? "Sí" : "No"}</p>
                <button onclick="prepararEdicion(${data[i].id_vehiculo})">Editar</button>
                <button onclick="eliminarVehiculo(${data[i].id_vehiculo})">Eliminar</button>
                <hr>
            </li>`;
        }
        contenedor.innerHTML = resultado;
        console.log("Vehículos cargados:", data);
    })
    .catch(error => console.log("Error al cargar vehículos:", error));
};

// ── INSERTAR / ACTUALIZAR ─────────────────────────────────────
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const datos = {
        id_vehiculo:        parseInt(document.getElementById("id_vehiculo").value),
        id_usuario:         parseInt(document.getElementById("id_usuario").value),
        id_modelo:          parseInt(document.getElementById("id_modelo").value),
        id_combustible:     parseInt(document.getElementById("id_combustible").value),
        id_transmision:     parseInt(document.getElementById("id_transmision").value),
        placa:              document.getElementById("placa").value,
        anio_fabricacion:   parseInt(document.getElementById("anio_fabricacion").value),
        color:              document.getElementById("color").value || null,
        numero_chasis:      document.getElementById("numero_chasis").value || null,
        numero_motor:       document.getElementById("numero_motor").value || null,
        kilometraje_actual: parseInt(document.getElementById("kilometraje_actual").value),
        activo:             document.getElementById("activo").checked
    };

    if (modoEdicion) {
        // PUT - no incluye id_vehiculo en el body, va en la URL
        const datosUpdate = { ...datos };
        delete datosUpdate.id_vehiculo;

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
            cargarVehiculos();
        })
        .catch(error => console.log("Error al actualizar:", error));
    } else {
        // POST
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
            cargarVehiculos();
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
        document.getElementById("id_vehiculo").value       = data.id_vehiculo;
        document.getElementById("id_vehiculo").disabled   = true;
        document.getElementById("id_usuario").value       = data.id_usuario ?? "";
        document.getElementById("id_modelo").value        = data.id_modelo ?? "";
        document.getElementById("id_combustible").value   = data.id_combustible ?? "";
        document.getElementById("id_transmision").value   = data.id_transmision ?? "";
        document.getElementById("placa").value            = data.placa;
        document.getElementById("anio_fabricacion").value = data.anio_fabricacion;
        document.getElementById("color").value            = data.color ?? "";
        document.getElementById("numero_chasis").value    = data.numero_chasis ?? "";
        document.getElementById("numero_motor").value     = data.numero_motor ?? "";
        document.getElementById("kilometraje_actual").value = data.kilometraje_actual;
        document.getElementById("activo").checked         = data.activo;

        modoEdicion = true;
        idEditando = id;
        tituloForm.textContent = `Editar Vehículo #${id}`;
        btnCancelar.style.display = "inline";
    })
    .catch(error => console.log("Error al obtener vehículo:", error));
};

// ── CANCELAR EDICIÓN ──────────────────────────────────────────
const cancelarEdicion = () => {
    form.reset();
    document.getElementById("id_vehiculo").disabled = false;
    modoEdicion = false;
    idEditando = null;
    tituloForm.textContent = "Registrar Vehículo";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

// ── ELIMINAR ──────────────────────────────────────────────────
const eliminarVehiculo = (id) => {
    if (!confirm(`¿Está seguro de eliminar el vehículo #${id}?`)) return;

    fetch(`${url}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.mensaje);
        alert(data.mensaje);
        cargarVehiculos();
    })
    .catch(error => console.log("Error al eliminar:", error));
};

// ── INICIO ────────────────────────────────────────────────────
cargarVehiculos();