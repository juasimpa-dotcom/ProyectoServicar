const url = "http://localhost:8000/tipos-servicio";
const tbody = document.getElementById("tbody"); // Vinculado a la tabla
const form = document.getElementById("form");    // Coincide con id="form" en el HTML
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
const countSpan = document.getElementById("count");

let modoEdicion = false;
let idEditando = null;

// --- 1. GET: Cargar Tipos de Servicio ---
const cargarTipos = () => {
    fetch(url)
        .then(r => r.json())
        .then(data => {
            let resultado = "";
            countSpan.textContent = data.length;

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="sin-datos">No hay servicios registrados</td></tr>`;
                return;
            }

            data.forEach(ts => {
                resultado += `
                <tr>
                    <td>${ts.id_tipo_servicio}</td>
                    <td><small>Cat ID:</small> ${ts.id_categoria}</td>
                    <td>**${ts.nombre}**</td>
                    <td>${ts.intervalo_km ? ts.intervalo_km.toLocaleString() + ' km' : "—"}</td>
                    <td>${ts.intervalo_dias ? ts.intervalo_dias + ' días' : "—"}</td>
                    <td>
                        <span class="badge ${ts.activo ? 'active' : 'inactive'}">
                            ${ts.activo ? "Activo" : "Inactivo"}
                        </span>
                    </td>
                    <td>
                        <button class="btn-edit" onclick="prepararEdicion(${ts.id_tipo_servicio})">✏️</button>
                        <button class="btn-delete" onclick="eliminar(${ts.id_tipo_servicio})">🗑️</button>
                    </td>
                </tr>`;
            });
            tbody.innerHTML = resultado;
        })
        .catch(e => {
            console.error("Error:", e);
            tbody.innerHTML = `<tr><td colspan="7" class="sin-datos">Error de conexión</td></tr>`;
        });
};

// --- 2. POST & PUT: Guardar ---
form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const datos = {
        id_categoria:   parseInt(document.getElementById("id_categoria").value),
        nombre:         document.getElementById("nombre").value,
        descripcion:    document.getElementById("descripcion").value || null,
        intervalo_km:   document.getElementById("intervalo_km").value ? parseInt(document.getElementById("intervalo_km").value) : null,
        intervalo_dias: document.getElementById("intervalo_dias").value ? parseInt(document.getElementById("intervalo_dias").value) : null,
        activo:         document.getElementById("activo").checked
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
        alert(d.mensaje || "Servicio guardado correctamente");
        cancelarEdicion();
        cargarTipos();
    })
    .catch(e => alert("Error al procesar el tipo de servicio"));
});

// --- 3. GET (Single): Preparar Edición ---
const prepararEdicion = (id) => {
    fetch(`${url}/${id}`)
        .then(r => r.json())
        .then(data => {
            document.getElementById("id_categoria").value   = data.id_categoria;
            document.getElementById("nombre").value         = data.nombre;
            document.getElementById("descripcion").value    = data.descripcion ?? "";
            document.getElementById("intervalo_km").value   = data.intervalo_km ?? "";
            document.getElementById("intervalo_dias").value = data.intervalo_dias ?? "";
            document.getElementById("activo").checked       = data.activo;
            
            modoEdicion = true;
            idEditando = id;
            tituloForm.textContent = `🛠️ Editando Servicio #${id}`;
            btnCancelar.style.display = "inline-block";
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
};

// --- 4. DELETE: Eliminar ---
const eliminar = (id) => {
    if (!confirm(`¿Eliminar el tipo de servicio #${id}?`)) return;
    
    fetch(`${url}/${id}`, { method: "DELETE" })
        .then(r => r.json())
        .then(d => {
            alert(d.mensaje || "Servicio eliminado");
            cargarTipos();
        });
};

// --- Utilidades ---
const cancelarEdicion = () => {
    form.reset();
    modoEdicion = false;
    idEditando = null;
    tituloForm.textContent = "➕ Registrar Tipo de Servicio";
    btnCancelar.style.display = "none";
};

btnCancelar.onclick = cancelarEdicion;

// Iniciar
document.addEventListener("DOMContentLoaded", cargarTipos);
cargarTipos();