const url = "http://localhost:8000/mecanicos";
const tbody = document.getElementById("tbody"); // Vinculado a la tabla
const form = document.getElementById("form");    // Coincide con id="form" en el HTML
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
const countSpan = document.getElementById("count");

let modoEdicion = false;
let idEditando = null;

// --- 1. GET: Cargar Mecánicos ---
const cargarMecanicos = () => {
    fetch(url)
        .then(r => r.json())
        .then(data => {
            let resultado = "";
            countSpan.textContent = data.length;

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="sin-datos">No hay mecánicos registrados</td></tr>`;
                return;
            }

            data.forEach(mec => {
                resultado += `
                <tr>
                    <td>${mec.id_mecanico}</td>
                    <td>**${mec.nombres}**</td>
                    <td>${mec.apellidos}</td>
                    <td>${mec.especialidad ?? "—"}</td>
                    <td>${mec.telefono ?? "-"}</td>
                    <td>
                        <span class="badge ${mec.activo ? 'active' : 'inactive'}">
                            ${mec.activo ? "Activo" : "Inactivo"}
                        </span>
                    </td>
                    <td>
                        <button class="btn-edit" onclick="prepararEdicion(${mec.id_mecanico})">✏️</button>
                        <button class="btn-delete" onclick="eliminar(${mec.id_mecanico})">🗑️</button>
                    </td>
                </tr>`;
            });
            tbody.innerHTML = resultado;
        })
        .catch(e => {
            console.error("Error:", e);
            tbody.innerHTML = `<tr><td colspan="7" class="sin-datos">Error de conexión con el servidor</td></tr>`;
        });
};

// --- 2. POST & PUT: Guardar ---
form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const datos = {
        nombres:      document.getElementById("nombres").value,
        apellidos:    document.getElementById("apellidos").value,
        especialidad: document.getElementById("especialidad").value || null,
        telefono:     document.getElementById("telefono").value || null,
        activo:       document.getElementById("activo").checked
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
        alert(d.mensaje || "Mecánico guardado con éxito");
        cancelarEdicion();
        cargarMecanicos();
    })
    .catch(e => alert("Error al procesar la solicitud"));
});

// --- 3. GET (Single): Preparar Edición ---
const prepararEdicion = (id) => {
    fetch(`${url}/${id}`)
        .then(r => r.json())
        .then(data => {
            document.getElementById("id_usuario").value   = data.id_usuario ?? "";
            document.getElementById("nombres").value      = data.nombres;
            document.getElementById("apellidos").value    = data.apellidos;
            document.getElementById("especialidad").value = data.especialidad ?? "";
            document.getElementById("telefono").value     = data.telefono ?? "";
            document.getElementById("activo").checked     = data.activo;
            
            modoEdicion = true;
            idEditando = id;
            tituloForm.textContent = `🔧 Editando Mecánico #${id}`;
            btnCancelar.style.display = "inline-block";
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
};

// --- 4. DELETE: Eliminar ---
const eliminar = (id) => {
    if (!confirm(`¿Deseas eliminar al mecánico #${id}?`)) return;
    
    fetch(`${url}/${id}`, { method: "DELETE" })
        .then(r => r.json())
        .then(d => {
            alert(d.mensaje || "Mecánico eliminado");
            cargarMecanicos();
        });
};

// --- Utilidades ---
const cancelarEdicion = () => {
    form.reset();
    modoEdicion = false;
    idEditando = null;
    tituloForm.textContent = "➕ Registrar Mecánico";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

// Iniciar
document.addEventListener("DOMContentLoaded", cargarMecanicos);