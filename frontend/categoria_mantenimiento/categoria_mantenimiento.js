const url = "http://localhost:8000/categorias-mantenimiento";
const tbody = document.getElementById("tbody"); // Vinculado a la tabla
const form = document.getElementById("form");    // Coincide con id="form" en el HTML
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
const countSpan = document.getElementById("count");

let modoEdicion = false;
let idEditando = null;

// --- 1. GET: Cargar Categorías ---
const cargarCategorias = () => {
    fetch(url)
        .then(r => r.json())
        .then(data => {
            let resultado = "";
            countSpan.textContent = data.length;

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="sin-datos">No hay categorías registradas</td></tr>`;
                return;
            }

            data.forEach(cat => {
                resultado += `
                <tr>
                    <td>${cat.id_categoria}</td>
                    <td>**${cat.nombre}**</td>
                    <td>${cat.descripcion ?? "-"}</td>
                    <td>
                        <span class="badge ${cat.activo ? 'active' : 'inactive'}">
                            ${cat.activo ? "Activo" : "Inactivo"}
                        </span>
                    </td>
                    <td>
                        <button class="btn-edit" onclick="prepararEdicion(${cat.id_categoria})">✏️</button>
                        <button class="btn-delete" onclick="eliminar(${cat.id_categoria})">🗑️</button>
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
        cargarCategorias();
    })
    .catch(e => alert("Error al procesar la categoría"));
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
            tituloForm.textContent = `📝 Editando Categoría #${id}`;
            btnCancelar.style.display = "inline-block";
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
};

// --- 4. DELETE: Eliminar ---
const eliminar = (id) => {
    if (!confirm(`¿Eliminar la categoría #${id}?`)) return;
    
    fetch(`${url}/${id}`, { method: "DELETE" })
        .then(r => r.json())
        .then(d => {
            alert(d.mensaje || "Categoría eliminada");
            cargarCategorias();
        });
};

// --- Utilidades ---
const cancelarEdicion = () => {
    form.reset();
    modoEdicion = false;
    idEditando = null;
    tituloForm.textContent = "➕ Registrar Categoría";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

// Iniciar
document.addEventListener("DOMContentLoaded", cargarCategorias);
cargarCategorias();