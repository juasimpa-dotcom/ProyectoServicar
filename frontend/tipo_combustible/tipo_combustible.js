const url = "http://localhost:8000/tipos-combustible";
const tbody = document.getElementById("tbody"); // Vinculado al cuerpo de la tabla
const form = document.getElementById("form");    // ID correcto según tu HTML
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
const countSpan = document.getElementById("count");

let modoEdicion = false;
let idEditando = null;

// --- 1. GET: Cargar Listado ---
const cargarCombustibles = () => {
    fetch(url)
        .then(r => r.json())
        .then(data => {
            let resultado = "";
            countSpan.textContent = data.length;

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="sin-datos">No hay combustibles registrados</td></tr>`;
                return;
            }

            data.forEach(item => {
                resultado += `
                <tr>
                    <td>${item.id_combustible}</td>
                    <td>**${item.nombre}**</td>
                    <td>
                        <button class="btn-edit" onclick="prepararEdicion(${item.id_combustible})">✏️</button>
                        <button class="btn-delete" onclick="eliminar(${item.id_combustible})">🗑️</button>
                    </td>
                </tr>`;
            });
            tbody.innerHTML = resultado;
        })
        .catch(e => {
            console.error("Error:", e);
            tbody.innerHTML = `<tr><td colspan="3" class="sin-datos">Error de conexión</td></tr>`;
        });
};

// --- 2. POST & PUT: Guardar ---
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
        nombre: document.getElementById("nombre").value
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
        alert(d.mensaje || "Guardado con éxito");
        cancelarEdicion();
        cargarCombustibles();
    })
    .catch(e => alert("Error al procesar la solicitud"));
});

// --- 3. GET (Single): Editar ---
const prepararEdicion = (id) => {
    fetch(`${url}/${id}`)
        .then(r => r.json())
        .then(data => {
            document.getElementById("nombre").value = data.nombre;
            
            modoEdicion = true;
            idEditando = id;
            tituloForm.textContent = `📝 Editando Combustible #${id}`;
            btnCancelar.style.display = "inline-block";
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
};

// --- 4. DELETE: Eliminar ---
const eliminar = (id) => {
    if (!confirm(`¿Estás seguro de eliminar el combustible #${id}?`)) return;
    
    fetch(`${url}/${id}`, { method: "DELETE" })
        .then(r => r.json())
        .then(d => {
            alert(d.mensaje || "Eliminado correctamente");
            cargarCombustibles();
        });
};

// --- Utilidades ---
const cancelarEdicion = () => {
    form.reset();
    modoEdicion = false;
    idEditando = null;
    tituloForm.textContent = "➕ Registrar Combustible";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

// Carga inicial
document.addEventListener("DOMContentLoaded", cargarCombustibles);
cargarCombustibles();