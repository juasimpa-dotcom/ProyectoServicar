const url = "http://localhost:8000/mantenimiento-repuestos";
const tbody = document.getElementById("tbody"); // Vinculado a la tabla
const form = document.getElementById("form");    // Coincide con id="form" en el HTML
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
const countSpan = document.getElementById("count");

let modoEdicion = false;
let idEditando = null;

// --- 1. Cargar y Mostrar ---
const cargarTodos = () => {
    fetch(url)
        .then(r => r.json())
        .then(data => mostrar(data))
        .catch(e => {
            tbody.innerHTML = `<tr><td colspan="7" class="sin-datos">Error de conexión</td></tr>`;
        });
};

const filtrarM = () => {
    const id = document.getElementById("filtro_m").value;
    if (!id) { alert("Ingrese un ID de mantenimiento"); return; }
    
    fetch(`${url}/mantenimiento/${id}`)
        .then(r => r.json())
        .then(data => mostrar(data));
};

const mostrar = (data) => {
    let resultado = "";
    countSpan.textContent = data.length;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="sin-datos">No hay repuestos vinculados</td></tr>`;
        return;
    }

    data.forEach(mr => {
        const subtotal = mr.cantidad * mr.precio_unitario;
        resultado += `
        <tr>
            <td>${mr.id}</td>
            <td>📋 Mantenimiento #${mr.id_mantenimiento}</td>
            <td>🔩 Repuesto #${mr.id_repuesto}</td>
            <td>${mr.cantidad}</td>
            <td>Bs. ${parseFloat(mr.precio_unitario).toFixed(2)}</td>
            <td>**Bs. ${subtotal.toFixed(2)}**</td>
            <td>
                <button class="btn-edit" onclick="prepararEdicion(${mr.id})">✏️</button>
                <button class="btn-delete" onclick="eliminar(${mr.id})">🗑️</button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = resultado;
};

// --- 2. Guardar ---
form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const datos = {
        id_mantenimiento: parseInt(document.getElementById("id_mantenimiento").value),
        id_repuesto:      parseInt(document.getElementById("id_repuesto").value),
        cantidad:         parseFloat(document.getElementById("cantidad").value),
        precio_unitario:  parseFloat(document.getElementById("precio_unitario").value)
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
        alert(d.mensaje || "Registro actualizado");
        cancelarEdicion();
        cargarTodos();
    })
    .catch(e => alert("Error al procesar el registro"));
});

// --- 3. Editar ---
const prepararEdicion = (id) => {
    fetch(`${url}/${id}`)
        .then(r => r.json())
        .then(data => {
            document.getElementById("id_mantenimiento").value = data.id_mantenimiento;
            document.getElementById("id_repuesto").value      = data.id_repuesto;
            document.getElementById("cantidad").value         = data.cantidad;
            document.getElementById("precio_unitario").value  = data.precio_unitario;

            // Bloquear claves foráneas para evitar inconsistencias
            document.getElementById("id_mantenimiento").readOnly = true;
            document.getElementById("id_repuesto").readOnly      = true;
            
            modoEdicion = true;
            idEditando = id;
            tituloForm.textContent = `📝 Editando Detalle #${id}`;
            btnCancelar.style.display = "inline-block";
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
};

// --- 4. Eliminar ---
const eliminar = (id) => {
    if (!confirm("¿Quitar este repuesto del mantenimiento?")) return;
    fetch(`${url}/${id}`, { method: "DELETE" })
        .then(() => cargarTodos());
};

// --- Utilidades ---
const cancelarEdicion = () => {
    form.reset();
    document.getElementById("id_mantenimiento").readOnly = false;
    document.getElementById("id_repuesto").readOnly      = false;
    modoEdicion = false;
    idEditando = null;
    tituloForm.textContent = "➕ Agregar Repuesto a Mantenimiento";
    btnCancelar.style.display = "none";
};

// Vinculación de funciones globales para los botones del HTML
window.filtrarM = filtrarM;
window.cargar = cargarTodos;

btnCancelar.onclick = cancelarEdicion;
document.addEventListener("DOMContentLoaded", cargarTodos);
cargarTodos();