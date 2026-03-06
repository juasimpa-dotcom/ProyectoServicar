const url = "http://localhost:8000/usuarios";
const tbody = document.getElementById("tbody"); // Vinculado a la tabla
const form = document.getElementById("form");    // Coincide con id="form" en el HTML
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
const countSpan = document.getElementById("count");

let modoEdicion = false;
let idEditando = null;

// --- 1. GET: Cargar Usuarios ---
const cargarUsuarios = () => {
    fetch(url)
        .then(r => r.json())
        .then(data => {
            let resultado = "";
            countSpan.textContent = data.length;

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" class="sin-datos">No hay usuarios registrados</td></tr>`;
                return;
            }

            data.forEach(user => {
                resultado += `
                <tr>
                    <td>${user.id_usuario}</td>
                    <td>**${user.nombres}**</td>
                    <td>${user.apellidos}</td>
                    <td>${user.email}</td>
                    <td>${user.telefono ?? "-"}</td>
                    <td><small>Rol ID:</small> ${user.id_rol}</td>
                    <td>
                        <span class="badge ${user.activo ? 'active' : 'inactive'}">
                            ${user.activo ? "Activo" : "Inactivo"}
                        </span>
                    </td>
                    <td>
                        <button class="btn-edit" onclick="prepararEdicion(${user.id_usuario})">✏️</button>
                        <button class="btn-delete" onclick="eliminar(${user.id_usuario})">🗑️</button>
                    </td>
                </tr>`;
            });
            tbody.innerHTML = resultado;
        })
        .catch(e => {
            console.error("Error:", e);
            tbody.innerHTML = `<tr><td colspan="8" class="sin-datos">Error al cargar la lista de usuarios</td></tr>`;
        });
};

// --- 2. POST & PUT: Guardar ---
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
        id_rol:    parseInt(document.getElementById("id_rol").value),
        nombres:   document.getElementById("nombres").value,
        apellidos: document.getElementById("apellidos").value,
        email:     document.getElementById("email").value,
        telefono:  document.getElementById("telefono").value || null,
        activo:    document.getElementById("activo").checked
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
        alert(d.mensaje || "Datos de usuario guardados");
        cancelarEdicion();
        cargarUsuarios();
    })
    .catch(e => alert("Error al procesar el usuario"));
});

// --- 3. GET (Single): Preparar Edición ---
const prepararEdicion = (id) => {
    fetch(`${url}/${id}`)
        .then(r => r.json())
        .then(data => {
            document.getElementById("id_rol").value    = data.id_rol;
            document.getElementById("nombres").value   = data.nombres;
            document.getElementById("apellidos").value = data.apellidos;
            document.getElementById("email").value     = data.email;
            document.getElementById("telefono").value  = data.telefono ?? "";
            document.getElementById("activo").checked  = data.activo;
            
            modoEdicion = true;
            idEditando = id;
            tituloForm.textContent = `📝 Editando Usuario #${id}`;
            btnCancelar.style.display = "inline-block";
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
};

// --- 4. DELETE: Eliminar ---
const eliminar = (id) => {
    if (!confirm(`¿Deseas eliminar al usuario #${id}?`)) return;
    
    fetch(`${url}/${id}`, { method: "DELETE" })
        .then(r => r.json())
        .then(d => {
            alert(d.mensaje || "Usuario eliminado");
            cargarUsuarios();
        });
};

// --- Utilidades ---
const cancelarEdicion = () => {
    form.reset();
    modoEdicion = false;
    idEditando = null;
    tituloForm.textContent = "➕ Registrar Usuario";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

// Iniciar al cargar la página
document.addEventListener("DOMContentLoaded", cargarUsuarios);
cargarUsuarios();