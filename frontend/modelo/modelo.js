const url = "http://localhost:8000/modelos";
const tbody = document.getElementById("tbody"); // Vinculado a la tabla
const form = document.getElementById("form");    // Coincide con id="form" en el HTML
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
const countSpan = document.getElementById("count");

let modoEdicion = false;
let idEditando = null;

// --- 1. GET: Cargar Modelos ---
const cargarModelos = () => {
    fetch(url)
        .then(r => r.json())
        .then(data => {
            let resultado = "";
            countSpan.textContent = data.length;

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="sin-datos">No hay modelos registrados</td></tr>`;
                return;
            }

            data.forEach(modelo => {
                resultado += `
                <tr>
                    <td>${modelo.id_modelo}</td>
                    <td><small>Marca ID:</small> ${modelo.id_marca}</td>
                    <td>**${modelo.nombre}**</td>
                    <td>
                        <span class="badge ${modelo.activo ? 'active' : 'inactive'}">
                            ${modelo.activo ? "Activo" : "Inactivo"}
                        </span>
                    </td>
                    <td>
                        <button class="btn-edit" onclick="prepararEdicion(${modelo.id_modelo})">✏️</button>
                        <button class="btn-delete" onclick="eliminarModelo(${modelo.id_modelo})">🗑️</button>
                    </td>
                </tr>`;
            });
            tbody.innerHTML = resultado;
        })
        .catch(e => {
            console.error("Error:", e);
            tbody.innerHTML = `<tr><td colspan="5" class="sin-datos">Error al cargar modelos</td></tr>`;
        });
};

// --- 2. POST & PUT: Guardar ---
form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const datos = {
        id_marca: parseInt(document.getElementById("id_marca").value),
        nombre: document.getElementById("nombre").value,
        activo: document.getElementById("activo").checked
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
        alert(d.mensaje || "Modelo guardado correctamente");
        cancelarEdicion();
        cargarModelos();
    })
    .catch(e => alert("Error en la operación"));
});

// --- 3. GET (Single): Preparar Edición ---
const prepararEdicion = (id) => {
    fetch(`${url}/${id}`)
        .then(r => r.json())
        .then(data => {
            document.getElementById("id_marca").value = data.id_marca;
            document.getElementById("nombre").value   = data.nombre;
            document.getElementById("activo").checked  = data.activo;
            
            modoEdicion = true;
            idEditando = id;
            tituloForm.textContent = `📝 Editando Modelo #${id}`;
            btnCancelar.style.display = "inline-block";
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
};

// --- 4. DELETE: Eliminar ---
const eliminarModelo = (id) => {
    if (!confirm(`¿Deseas eliminar el modelo #${id}?`)) return;
    
    fetch(`${url}/${id}`, { method: "DELETE" })
        .then(r => r.json())
        .then(d => {
            alert(d.mensaje || "Modelo eliminado");
            cargarModelos();
        });
};

// --- Utilidades ---
const cancelarEdicion = () => {
    form.reset();
    modoEdicion = false;
    idEditando = null;
    tituloForm.textContent = "➕ Registrar Modelo";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

// Iniciar
document.addEventListener("DOMContentLoaded", cargarModelos);
cargarModelos();