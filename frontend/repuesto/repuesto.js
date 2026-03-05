const url = "http://localhost:8000/repuestos";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-repuesto");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
let modoEdicion = false, idEditando = null;

const cargarRepuestos = () => {
    fetch(url).then(r => r.json()).then(data => {
        let resultado = "";
        for (let i = 0; i < data.length; i++) {
            resultado += `<li>
                <p><b>ID:</b> ${data[i].id_repuesto} | <b>Nombre:</b> ${data[i].nombre} | <b>Precio:</b> Bs. ${data[i].precio_unitario ?? "—"} | <b>Activo:</b> ${data[i].activo ? "Sí" : "No"}</p>
                <button onclick="prepararEdicion(${data[i].id_repuesto})">Editar</button>
                <button onclick="eliminar(${data[i].id_repuesto})">Eliminar</button><hr></li>`;
        }
        contenedor.innerHTML = resultado;
    });
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
        codigo:          document.getElementById("codigo").value || null,
        nombre:          document.getElementById("nombre").value,
        marca_repuesto:  document.getElementById("marca_repuesto").value || null,
        unidad_medida:   document.getElementById("unidad_medida").value,
        precio_unitario: document.getElementById("precio_unitario").value ? parseFloat(document.getElementById("precio_unitario").value) : null,
        activo:          document.getElementById("activo").checked
    };
    if (modoEdicion) {
        fetch(`${url}/${idEditando}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); cancelarEdicion(); cargarRepuestos(); });
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); form.reset(); cargarRepuestos(); });
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`).then(r => r.json()).then(data => {
        document.getElementById("codigo").value          = data.codigo ?? "";
        document.getElementById("nombre").value          = data.nombre;
        document.getElementById("marca_repuesto").value  = data.marca_repuesto ?? "";
        document.getElementById("unidad_medida").value   = data.unidad_medida;
        document.getElementById("precio_unitario").value = data.precio_unitario ?? "";
        document.getElementById("activo").checked        = data.activo;
        modoEdicion = true; idEditando = id;
        tituloForm.textContent = `Editar Repuesto #${id}`;
        btnCancelar.style.display = "inline";
    });
};

const cancelarEdicion = () => {
    form.reset(); modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Registrar Repuesto";
    btnCancelar.style.display = "none";
};

const eliminar = (id) => {
    if (!confirm(`¿Eliminar repuesto #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE" }).then(r => r.json()).then(d => { alert(d.mensaje); cargarRepuestos(); });
};

btnCancelar.addEventListener("click", cancelarEdicion);
cargarRepuestos();