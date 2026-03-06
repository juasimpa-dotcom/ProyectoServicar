const url = "http://localhost:8000/repuestos";
const tbody = document.getElementById("tbody"); // Vinculado a la tabla
const form = document.getElementById("form");    // Coincide con id="form" en el HTML
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
const countSpan = document.getElementById("count");

let modoEdicion = false;
let idEditando = null;

// --- 1. GET: Cargar Repuestos ---
const cargarRepuestos = () => {
    fetch(url)
        .then(r => r.json())
        .then(data => {
            let resultado = "";
            countSpan.textContent = data.length;

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" class="sin-datos">No hay repuestos registrados</td></tr>`;
                return;
            }

            data.forEach(rep => {
                resultado += `
                <tr>
                    <td>${rep.id_repuesto}</td>
                    <td><code class="text-muted">${rep.codigo ?? '—'}</code></td>
                    <td>**${rep.nombre}**</td>
                    <td>${rep.marca_repuesto ?? "Genérico"}</td>
                    <td>${rep.unidad_medida}</td>
                    <td>Bs. ${rep.precio_unitario ? parseFloat(rep.precio_unitario).toFixed(2) : "0.00"}</td>
                    <td>
                        <span class="badge ${rep.activo ? 'active' : 'inactive'}">
                            ${rep.activo ? "Activo" : "Inactivo"}
                        </span>
                    </td>
                    <td>
                        <button class="btn-edit" onclick="prepararEdicion(${rep.id_repuesto})">✏️</button>
                        <button class="btn-delete" onclick="eliminar(${rep.id_repuesto})">🗑️</button>
                    </td>
                </tr>`;
            });
            tbody.innerHTML = resultado;
        })
        .catch(e => {
            console.error("Error:", e);
            tbody.innerHTML = `<tr><td colspan="8" class="sin-datos">Error al conectar con el servidor</td></tr>`;
        });
};

// --- 2. POST & PUT: Guardar ---
form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const datos = {
        codigo:          document.getElementById("codigo").value || null,
        nombre:          document.getElementById("nombre").value,
        marca_repuesto:  document.getElementById("marca_repuesto").value || null,
        unidad_medida:   document.getElementById("unidad_medida").value,
        precio_unitario: document.getElementById("precio_unitario").value ? parseFloat(document.getElementById("precio_unitario").value) : 0,
        activo:          document.getElementById("activo").checked
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
        alert(d.mensaje || "Repuesto guardado");
        cancelarEdicion();
        cargarRepuestos();
    })
    .catch(e => alert("Error al procesar el repuesto"));
});

// --- 3. GET (Single): Editar ---
const prepararEdicion = (id) => {
    fetch(`${url}/${id}`)
        .then(r => r.json())
        .then(data => {
            document.getElementById("codigo").value          = data.codigo ?? "";
            document.getElementById("nombre").value          = data.nombre;
            document.getElementById("marca_repuesto").value  = data.marca_repuesto ?? "";
            document.getElementById("unidad_medida").value   = data.unidad_medida;
            document.getElementById("precio_unitario").value = data.precio_unitario ?? "";
            document.getElementById("activo").checked        = data.activo;
            
            modoEdicion = true;
            idEditando = id;
            tituloForm.textContent = `🔩 Editando Repuesto #${id}`;
            btnCancelar.style.display = "inline-block";
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
};

// --- 4. DELETE: Eliminar ---
const eliminar = (id) => {
    if (!confirm(`¿Eliminar repuesto #${id}?`)) return;
    
    fetch(`${url}/${id}`, { method: "DELETE" })
        .then(r => r.json())
        .then(d => {
            alert(d.mensaje || "Repuesto eliminado");
            cargarRepuestos();
        });
};

// --- Utilidades ---
const cancelarEdicion = () => {
    form.reset();
    document.getElementById("unidad_medida").value = "unidad"; // Valor por defecto
    modoEdicion = false;
    idEditando = null;
    tituloForm.textContent = "➕ Registrar Repuesto";
    btnCancelar.style.display = "none";
};

btnCancelar.onclick = cancelarEdicion;

// Carga inicial
document.addEventListener("DOMContentLoaded", cargarRepuestos);
cargarRepuestos();