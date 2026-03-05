const url = "http://localhost:8000/mantenimiento-repuestos";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-mr");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
let modoEdicion = false, idEditando = null;

const cargarTodos = () => {
    fetch(url).then(r => r.json()).then(data => { mostrar(data); });
};

const cargarPorMantenimiento = () => {
    const id = document.getElementById("filtro_mantenimiento").value;
    if (!id) { alert("Ingrese un ID de mantenimiento"); return; }
    fetch(`${url}/mantenimiento/${id}`).then(r => r.json()).then(data => { mostrar(data); });
};

const mostrar = (data) => {
    let resultado = data.length === 0 ? "<li>No se encontraron registros.</li>" : "";
    for (let i = 0; i < data.length; i++) {
        resultado += `<li>
            <p><b>ID:</b> ${data[i].id} | <b>Mantenimiento:</b> ${data[i].id_mantenimiento} | <b>Repuesto:</b> ${data[i].id_repuesto} | <b>Cantidad:</b> ${data[i].cantidad} | <b>Precio:</b> Bs. ${data[i].precio_unitario} | <b>Subtotal:</b> Bs. ${data[i].subtotal}</p>
            <button onclick="prepararEdicion(${data[i].id})">Editar</button>
            <button onclick="eliminar(${data[i].id})">Eliminar</button><hr></li>`;
    }
    contenedor.innerHTML = resultado;
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (modoEdicion) {
        const datos = {
            cantidad:        parseFloat(document.getElementById("cantidad").value),
            precio_unitario: parseFloat(document.getElementById("precio_unitario").value)
        };
        fetch(`${url}/${idEditando}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); cancelarEdicion(); cargarTodos(); });
    } else {
        const datos = {
            id_mantenimiento: parseInt(document.getElementById("id_mantenimiento").value),
            id_repuesto:      parseInt(document.getElementById("id_repuesto").value),
            cantidad:         parseFloat(document.getElementById("cantidad").value),
            precio_unitario:  parseFloat(document.getElementById("precio_unitario").value)
        };
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); form.reset(); cargarTodos(); });
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`).then(r => r.json()).then(data => {
        document.getElementById("id_mantenimiento").value = data.id_mantenimiento;
        document.getElementById("id_repuesto").value      = data.id_repuesto;
        document.getElementById("cantidad").value         = data.cantidad;
        document.getElementById("precio_unitario").value  = data.precio_unitario;
        // Bloquear campos de relación en edición
        document.getElementById("id_mantenimiento").disabled = true;
        document.getElementById("id_repuesto").disabled      = true;
        modoEdicion = true; idEditando = id;
        tituloForm.textContent = `Editar Registro #${id}`;
        btnCancelar.style.display = "inline";
    });
};

const cancelarEdicion = () => {
    form.reset();
    document.getElementById("id_mantenimiento").disabled = false;
    document.getElementById("id_repuesto").disabled      = false;
    modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Agregar Repuesto a Mantenimiento";
    btnCancelar.style.display = "none";
};

const eliminar = (id) => {
    if (!confirm(`¿Eliminar registro #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE" }).then(r => r.json()).then(d => { alert(d.mensaje); cargarTodos(); });
};

btnCancelar.addEventListener("click", cancelarEdicion);
cargarTodos();