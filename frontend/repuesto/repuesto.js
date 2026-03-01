const url = "http://localhost:8000/repuestos";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-repuesto");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");

let modoEdicion = false;
let idEditando = null;

const cargarRepuestos = () => {
    fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(response => response.json())
    .then(data => {
        let resultado = "";
        for (let i = 0; i < data.length; i++) {
            resultado += `
            <li>
                <p><b>ID:</b> ${data[i].id_repuesto}</p>
                <p><b>Código:</b> ${data[i].codigo ?? "—"}</p>
                <p><b>Nombre:</b> ${data[i].nombre}</p>
                <p><b>Marca:</b> ${data[i].marca_repuesto ?? "—"}</p>
                <p><b>Unidad:</b> ${data[i].unidad_medida}</p>
                <p><b>Precio Unitario:</b> Bs. ${data[i].precio_unitario ?? "—"}</p>
                <p><b>Activo:</b> ${data[i].activo ? "Sí" : "No"}</p>
                <button onclick="prepararEdicion(${data[i].id_repuesto})">Editar</button>
                <button onclick="eliminarRepuesto(${data[i].id_repuesto})">Eliminar</button>
                <hr>
            </li>`;
        }
        contenedor.innerHTML = resultado;
    })
    .catch(error => console.log("Error al cargar repuestos:", error));
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
        id_repuesto:     parseInt(document.getElementById("id_repuesto").value),
        codigo:          document.getElementById("codigo").value || null,
        nombre:          document.getElementById("nombre").value,
        marca_repuesto:  document.getElementById("marca_repuesto").value || null,
        unidad_medida:   document.getElementById("unidad_medida").value,
        precio_unitario: document.getElementById("precio_unitario").value ? parseFloat(document.getElementById("precio_unitario").value) : null,
        activo:          document.getElementById("activo").checked
    };

    if (modoEdicion) {
        const datosUpdate = { ...datos };
        delete datosUpdate.id_repuesto;
        fetch(`${url}/${idEditando}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosUpdate)
        })
        .then(r => r.json()).then(data => { alert(data.mensaje); cancelarEdicion(); cargarRepuestos(); })
        .catch(error => console.log("Error al actualizar:", error));
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(data => { alert(data.mensaje); form.reset(); cargarRepuestos(); })
        .catch(error => console.log("Error al insertar:", error));
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(r => r.json())
    .then(data => {
        document.getElementById("id_repuesto").value    = data.id_repuesto;
        document.getElementById("id_repuesto").disabled = true;
        document.getElementById("codigo").value         = data.codigo ?? "";
        document.getElementById("nombre").value         = data.nombre;
        document.getElementById("marca_repuesto").value = data.marca_repuesto ?? "";
        document.getElementById("unidad_medida").value  = data.unidad_medida;
        document.getElementById("precio_unitario").value = data.precio_unitario ?? "";
        document.getElementById("activo").checked       = data.activo;
        modoEdicion = true; idEditando = id;
        tituloForm.textContent = `Editar Repuesto #${id}`;
        btnCancelar.style.display = "inline";
    })
    .catch(error => console.log("Error al obtener repuesto:", error));
};

const cancelarEdicion = () => {
    form.reset();
    document.getElementById("id_repuesto").disabled = false;
    modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Registrar Repuesto";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

const eliminarRepuesto = (id) => {
    if (!confirm(`¿Eliminar repuesto #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } })
    .then(r => r.json()).then(data => { alert(data.mensaje); cargarRepuestos(); })
    .catch(error => console.log("Error al eliminar:", error));
};

cargarRepuestos();