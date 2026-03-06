const url = "http://localhost:8000/alertas";
const tbody = document.getElementById("tbody"); // Vinculado a la tabla
const form = document.getElementById("form");    // Coincide con id="form" en el HTML
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
const countSpan = document.getElementById("count");

let modoEdicion = false;
let idEditando = null;

// --- 1. Cargar y Mostrar ---
const cargarTodas = () => {
    fetch(url)
        .then(r => r.json())
        .then(data => mostrar(data))
        .catch(e => {
            tbody.innerHTML = `<tr><td colspan="8" class="sin-datos">Error al conectar con el servidor</td></tr>`;
        });
};

const cargarPendientes = () => {
    fetch(`${url}/pendientes/all`)
        .then(r => r.json())
        .then(data => mostrar(data));
};

const filtrarV = () => {
    const id = document.getElementById("filtro_v").value;
    if (!id) { alert("Ingrese un ID de vehículo"); return; }
    fetch(`${url}/vehiculo/${id}`)
        .then(r => r.json())
        .then(data => mostrar(data));
};

const mostrar = (data) => {
    let resultado = "";
    countSpan.textContent = data.length;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="sin-datos">No se encontraron alertas</td></tr>`;
        return;
    }

    data.forEach(al => {
        // Formateo de tipo de alerta para mejor lectura
        const tipoLabel = al.tipo_alerta.replace("_", " ").toUpperCase();
        
        resultado += `
        <tr>
            <td>${al.id_alerta}</td>
            <td>🚗 ID: ${al.id_vehiculo}</td>
            <td>🛠️ ID: ${al.id_tipo_servicio}</td>
            <td><small>${tipoLabel}</small></td>
            <td>${al.fecha_alerta ?? "—"}</td>
            <td>${al.kilometraje_alerta ? al.kilometraje_alerta.toLocaleString() + " Km" : "—"}</td>
            <td>
                <span class="badge ${al.estado}">
                    ${al.estado.toUpperCase()}
                </span>
            </td>
            <td>
                <button class="btn-edit" onclick="prepararEdicion(${al.id_alerta})">✏️</button>
                <button class="btn-delete" onclick="eliminar(${al.id_alerta})">🗑️</button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = resultado;
};

// --- 2. Guardar (POST & PUT) ---
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

    const metodo = modoEdicion ? "PUT" : "POST";
    const endpoint = modoEdicion ? `${url}/${idEditando}` : url;

    fetch(endpoint, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    .then(r => r.json())
    .then(d => {
        alert(d.mensaje || "Alerta procesada correctamente");
        cancelarEdicion();
        cargarTodas();
    })
    .catch(e => alert("Error al guardar la alerta"));
});

// --- 3. Editar ---
const prepararEdicion = (id) => {
    fetch(`${url}/${id}`)
        .then(r => r.json())
        .then(data => {
            document.getElementById("id_vehiculo").value        = data.id_vehiculo;
            document.getElementById("id_tipo_servicio").value   = data.id_tipo_servicio;
            document.getElementById("id_mantenimiento").value   = data.id_mantenimiento ?? "";
            document.getElementById("tipo_alerta").value        = data.tipo_alerta;
            document.getElementById("fecha_alerta").value       = data.fecha_alerta ?? "";
            document.getElementById("kilometraje_alerta").value = data.kilometraje_alerta ?? "";
            document.getElementById("mensaje").value            = data.mensaje ?? "";
            document.getElementById("estado").value             = data.estado;
            
            modoEdicion = true;
            idEditando = id;
            tituloForm.textContent = `🔔 Editando Alerta #${id}`;
            btnCancelar.style.display = "inline-block";
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
};

// --- 4. Eliminar ---
const eliminar = (id) => {
    if (!confirm(`¿Eliminar la alerta #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE" })
        .then(() => cargarTodas());
};

// --- Utilidades ---
const cancelarEdicion = () => {
    form.reset();
    modoEdicion = false;
    idEditando = null;
    tituloForm.textContent = "➕ Registrar Alerta";
    btnCancelar.style.display = "none";
};

// Exponer funciones al objeto window para los botones del HTML
window.filtrarV = filtrarV;
window.cargar = cargarTodas;
window.cargarPendientes = cargarPendientes;

btnCancelar.onclick = cancelarEdicion;
document.addEventListener("DOMContentLoaded", cargarTodas);