const url = "http://localhost:8000/tipos-transmision";
const tbody = document.getElementById("tbody"); // Vinculado a la tabla
const form = document.getElementById("form");    // Coincide con id="form" en el HTML
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
const countSpan = document.getElementById("count");

let modoEdicion = false;
let idEditando = null;

// --- 1. GET: Cargar Transmisiones ---
const cargarTransmisiones = () => {
    fetch(url)
        .then(r => r.json())
        .then(data => {
            let resultado = "";
            countSpan.textContent = data.length;

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="sin-datos">No hay transmisiones registradas</td></tr>`;
                return;
            }

            data.forEach(item => {
                resultado += `
                <tr>
                    <td>${item.id_transmision}</td>
                    <td>**${item.nombre}**</td>
                    <td>
                        <button class="btn-edit" onclick="prepararEdicion(${item.id_transmision})">✏️</button>
                        <button class="btn-delete" onclick="eliminar(${item.id_transmision})">🗑️</button>
                    </td>
                </tr>`;
            });
            tbody.innerHTML = resultado;
        })
        .catch(e => {
            console.error("Error:", e);
            tbody.innerHTML = `<tr><td colspan="3" class="sin-datos">Error de comunicación con el API</td></tr>`;
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
        alert(d.mensaje || "Operación realizada");
        cancelarEdicion();
        cargarTransmisiones();
    })
    .catch(e => alert("Error al guardar"));
});

// --- 3. GET (Single): Editar ---
const prepararEdicion = (id) => {
    fetch(`${url}/${id}`)
        .then(r => r.json())
        .then(data => {
            document.getElementById("nombre").value = data.nombre;
            
            modoEdicion = true;
            idEditando = id;
            tituloForm.textContent = `⚙️ Editando Transmisión #${id}`;
            btnCancelar.style.display = "inline-block";
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
};

// --- 4. DELETE: Eliminar ---
const eliminar = (id) => {
    if (!confirm(`¿Eliminar la transmisión #${id}?`)) return;
    
    fetch(`${url}/${id}`, { method: "DELETE" })
        .then(r => r.json())
        .then(d => {
            alert(d.mensaje || "Eliminado correctamente");
            cargarTransmisiones();
        });
};

// --- Utilidades ---
const cancelarEdicion = () => {
    form.reset();
    modoEdicion = false;
    idEditando = null;
    tituloForm.textContent = "➕ Registrar Transmisión";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

// Carga inicial
document.addEventListener("DOMContentLoaded", cargarTransmisiones);