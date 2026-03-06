const url = "http://localhost:8000/marcas";
const tbody = document.getElementById("tbody"); // Para insertar en la tabla
const form = document.getElementById("form");    // ID correcto según tu HTML
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
const countSpan = document.getElementById("count");

let modoEdicion = false;
let idEditando = null;

// --- 1. GET: Cargar Marcas ---
const cargarMarcas = () => {
    fetch(url)
        .then(r => r.json())
        .then(data => {
            let resultado = "";
            countSpan.textContent = data.length;

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="sin-datos">No hay marcas registradas</td></tr>`;
                return;
            }

            data.forEach(marca => {
                resultado += `
                <tr>
                    <td>${marca.id_marca}</td>
                    <td>**${marca.nombre}**</td>
                    <td>
                        <span class="badge ${marca.activo ? 'active' : 'inactive'}">
                            ${marca.activo ? "Activo" : "Inactivo"}
                        </span>
                    </td>
                    <td>
                        <button class="btn-edit" onclick="prepararEdicion(${marca.id_marca})">✏️</button>
                        <button class="btn-delete" onclick="eliminarMarca(${marca.id_marca})">🗑️</button>
                    </td>
                </tr>`;
            });
            tbody.innerHTML = resultado;
        })
        .catch(e => {
            console.error("Error:", e);
            tbody.innerHTML = `<tr><td colspan="4" class="sin-datos">Error al conectar con el servidor</td></tr>`;
        });
};

// --- 2. POST & PUT: Guardar ---
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
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
        alert(d.mensaje || "Operación exitosa");
        cancelarEdicion();
        cargarMarcas();
    })
    .catch(e => alert("Error al procesar la marca"));
});

// --- 3. GET (Single): Preparar Edición ---
const prepararEdicion = (id) => {
    fetch(`${url}/${id}`)
        .then(r => r.json())
        .then(data => {
            document.getElementById("nombre").value = data.nombre;
            document.getElementById("activo").checked = data.activo;
            
            modoEdicion = true;
            idEditando = id;
            tituloForm.textContent = `📝 Editando Marca #${id}`;
            btnCancelar.style.display = "inline-block";
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
};

// --- 4. DELETE: Eliminar ---
const eliminarMarca = (id) => {
    if (!confirm(`¿Deseas eliminar la marca #${id}?`)) return;
    
    fetch(`${url}/${id}`, { method: "DELETE" })
        .then(r => r.json())
        .then(d => {
            alert(d.mensaje || "Marca eliminada");
            cargarMarcas();
        });
};

// --- Utilidades ---
const cancelarEdicion = () => {
    form.reset();
    modoEdicion = false;
    idEditando = null;
    tituloForm.textContent = "➕ Registrar Marca";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", cargarMarcas);
cargarMarcas();