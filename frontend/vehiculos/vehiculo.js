const url = "http://localhost:8000/vehiculos";
const tbody = document.getElementById("tbody"); // Vinculado a la tabla
const form = document.getElementById("form");    // Coincide con id="form" en el HTML
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
const countSpan = document.getElementById("count");

let modoEdicion = false;
let idEditando = null;

// --- 1. GET: Cargar Listado de Vehículos ---
const cargarVehiculos = () => {
    fetch(url)
        .then(r => r.json())
        .then(data => {
            let resultado = "";
            countSpan.textContent = data.length;

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" class="sin-datos">No hay vehículos registrados</td></tr>`;
                return;
            }

            data.forEach(v => {
                resultado += `
                <tr>
                    <td>${v.id_vehiculo}</td>
                    <td>**${v.placa}**</td>
                    <td>${v.anio_fabricacion}</td>
                    <td>${v.color ?? "-"}</td>
                    <td>${v.kilometraje_actual.toLocaleString()} km</td>
                    <td><small>Usuario ID:</small> ${v.id_usuario}</td>
                    <td>
                        <span class="badge ${v.activo ? 'active' : 'inactive'}">
                            ${v.activo ? "Activo" : "Inactivo"}
                        </span>
                    </td>
                    <td>
                        <button class="btn-edit" onclick="prepararEdicion(${v.id_vehiculo})">✏️</button>
                        <button class="btn-delete" onclick="eliminar(${v.id_vehiculo})">🗑️</button>
                    </td>
                </tr>`;
            });
            tbody.innerHTML = resultado;
        })
        .catch(e => {
            console.error("Error:", e);
            tbody.innerHTML = `<tr><td colspan="8" class="sin-datos">Error de conexión con el servidor</td></tr>`;
        });
};

// --- 2. POST & PUT: Guardar ---
form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const datos = {
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

    const metodo = modoEdicion ? "PUT" : "POST";
    const endpoint = modoEdicion ? `${url}/${idEditando}` : url;

    fetch(endpoint, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    })
    .then(r => r.json())
    .then(d => {
        alert(d.mensaje || "Vehículo guardado con éxito");
        cancelarEdicion();
        cargarVehiculos();
    })
    .catch(e => alert("Error al procesar el vehículo"));
});

// --- 3. GET (Single): Preparar Edición ---
const prepararEdicion = (id) => {
    fetch(`${url}/${id}`)
        .then(r => r.json())
        .then(data => {
            document.getElementById("id_usuario").value         = data.id_usuario;
            document.getElementById("id_modelo").value          = data.id_modelo;
            document.getElementById("id_combustible").value     = data.id_combustible;
            document.getElementById("id_transmision").value     = data.id_transmision;
            document.getElementById("placa").value              = data.placa;
            document.getElementById("anio_fabricacion").value   = data.anio_fabricacion;
            document.getElementById("color").value              = data.color ?? "";
            document.getElementById("numero_chasis").value      = data.numero_chasis ?? "";
            document.getElementById("numero_motor").value       = data.numero_motor ?? "";
            document.getElementById("kilometraje_actual").value = data.kilometraje_actual;
            document.getElementById("activo").checked           = data.activo;
            
            modoEdicion = true;
            idEditando = id;
            tituloForm.textContent = `📝 Editando Vehículo #${id}`;
            btnCancelar.style.display = "inline-block";
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
};

// --- 4. DELETE: Eliminar ---
const eliminar = (id) => {
    if (!confirm(`¿Deseas eliminar el vehículo #${id}?`)) return;
    
    fetch(`${url}/${id}`, { method: "DELETE" })
        .then(r => r.json())
        .then(d => {
            alert(d.mensaje || "Vehículo eliminado");
            cargarVehiculos();
        });
};

// --- Utilidades ---
const cancelarEdicion = () => {
    form.reset();
    modoEdicion = false;
    idEditando = null;
    tituloForm.textContent = "➕ Registrar Vehículo";
    btnCancelar.style.display = "none";
};

btnCancelar.onclick = cancelarEdicion;

// Carga inicial
document.addEventListener("DOMContentLoaded", cargarVehiculos);
cargarVehiculos();