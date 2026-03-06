const url = "http://localhost:8000/roles";
const tbody = document.getElementById("tbody"); // Cambiado de 'data' a 'tbody'
const form = document.getElementById("form");    // Cambiado de 'form-rol' a 'form'
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
const countSpan = document.getElementById("count");

let modoEdicion = false;
let idEditando = null;

// --- 1. GET: Cargar Roles en la Tabla ---
const cargarRoles = () => {
    fetch(url)
        .then(r => r.json())
        .then(data => {
            let resultado = "";
            countSpan.textContent = data.length;

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="sin-datos">No hay roles registrados</td></tr>`;
                return;
            }

            data.forEach(rol => {
                resultado += `
                <tr>
                    <td>${rol.id_rol}</td>
                    <td>**${rol.nombre}**</td>
                    <td>${rol.descripcion ?? "-"}</td>
                    <td>
                        <span class="badge ${rol.activo ? 'active' : 'inactive'}">
                            ${rol.activo ? "Activo" : "Inactivo"}
                        </span>
                    </td>
                    <td>
                        <button class="btn-edit" onclick="prepararEdicion(${rol.id_rol})">✏️</button>
                        <button class="btn-delete" onclick="eliminarRol(${rol.id_rol})">🗑️</button>
                    </td>
                </tr>`;
            });
            tbody.innerHTML = resultado;
        })
        .catch(e => {
            console.error("Error:", e);
            tbody.innerHTML = `<tr><td colspan="5" class="sin-datos">Error de conexión con el servidor</td></tr>`;
        });
};

// --- 2. POST & PUT: Guardar ---
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
        nombre:      document.getElementById("nombre").value,
        descripcion: document.getElementById("descripcion").value || null,
        activo:      document.getElementById("activo").checked
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
        alert(d.mensaje || "Operación exitosa");
        cancelarEdicion();
        cargarRoles();
    })
    .catch(e => alert("Error al guardar los datos"));
});

// --- 3. GET (Single): Preparar Edición ---
const prepararEdicion = (id) => {
    fetch(`${url}/${id}`)
        .then(r => r.json())
        .then(data => {
            document.getElementById("nombre").value      = data.nombre;
            document.getElementById("descripcion").value = data.descripcion ?? "";
            document.getElementById("activo").checked    = data.activo;
            
            modoEdicion = true;
            idEditando = id;
            tituloForm.textContent = `📝 Editando Rol #${id}`;
            btnCancelar.style.display = "inline-block";
            
            // Scroll suave hacia arriba para ver el formulario
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
};

// --- 4. DELETE: Eliminar ---
const eliminarRol = (id) => {
    if (!confirm(`¿Estás seguro de eliminar el rol #${id}?`)) return;
    
    fetch(`${url}/${id}`, { method: "DELETE" })
        .then(r => r.json())
        .then(d => {
            alert(d.mensaje || "Rol eliminado");
            cargarRoles();
        });
};

// --- Utilidades ---
const cancelarEdicion = () => {
    form.reset();
    modoEdicion = false;
    idEditando = null;
    tituloForm.textContent = "➕ Registrar Rol";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

// Inicializar
document.addEventListener("DOMContentLoaded", cargarRoles);
cargarRoles();  