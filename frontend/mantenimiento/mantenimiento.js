const url = "http://localhost:8000/mantenimientos";
const tbody = document.getElementById("tbody"); // Vinculado a la tabla
const form = document.getElementById("form");    // Coincide con id="form" en el HTML
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
const countSpan = document.getElementById("count");

let modoEdicion = false;
let idEditando = null;

// --- 1. Cargar y Mostrar ---
const cargarTodos = () => {
    fetch(url)
        .then(r => r.json())
        .then(data => mostrar(data))
        .catch(e => {
            tbody.innerHTML = `<tr><td colspan="8" class="sin-datos">Error de conexión</td></tr>`;
        });
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
        tbody.innerHTML = `<tr><td colspan="8" class="sin-datos">No hay registros encontrados</td></tr>`;
        return;
    }

    data.forEach(m => {
        // Lógica de color para el estado
        const estadoClase = m.estado.replace("_", "-"); // p.ej. en_proceso -> en-proceso
        
        resultado += `
        <tr>
            <td>${m.id_mantenimiento}</td>
            <td>🚗 ID: ${m.id_vehiculo}</td>
            <td>🛠️ ID: ${m.id_tipo_servicio}</td>
            <td>${m.fecha_servicio}</td>
            <td>${m.kilometraje_servicio.toLocaleString()} km</td>
            <td>Bs. ${parseFloat(m.costo_mano_obra).toFixed(2)}</td>
            <td>
                <span class="badge ${estadoClase}">
                    ${m.estado.toUpperCase().replace("_", " ")}
                </span>
            </td>
            <td>
                <button class="btn-edit" onclick="prepararEdicion(${m.id_mantenimiento})">✏️</button>
                <button class="btn-delete" onclick="eliminar(${m.id_mantenimiento})">🗑️</button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = resultado;
};

// --- 2. Guardar (POST & PUT) ---
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

    const metodo = modoEdicion ? "PUT" : "POST";
    const endpoint = modoEdicion ? `${url}/${idEditando}` : url;

    fetch(endpoint, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    .then(r => r.json())
    .then(d => {
        alert(d.mensaje || "Registro guardado");
        cancelarEdicion();
        cargarTodos();
    })
    .catch(e => alert("Error al guardar mantenimiento"));
});

// --- 3. Editar ---
const prepararEdicion = (id) => {
    fetch(`${url}/${id}`)
        .then(r => r.json())
        .then(data => {
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
            
            modoEdicion = true;
            idEditando = id;
            tituloForm.textContent = `📝 Editando Registro #${id}`;
            btnCancelar.style.display = "inline-block";
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
};

// --- 4. Eliminar ---
const eliminar = (id) => {
    if (!confirm(`¿Eliminar el registro #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE" })
        .then(r => r.json())
        .then(() => cargarTodos());
};

// --- Utilidades ---
const cancelarEdicion = () => {
    form.reset();
    modoEdicion = false;
    idEditando = null;
    tituloForm.textContent = "➕ Registrar Mantenimiento";
    btnCancelar.style.display = "none";
};

btnCancelar.onclick = cancelarEdicion;
document.addEventListener("DOMContentLoaded", cargarTodos);