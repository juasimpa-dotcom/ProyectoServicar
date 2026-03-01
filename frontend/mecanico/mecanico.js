const url = "http://localhost:8000/mecanicos";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-mecanico");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");

let modoEdicion = false;
let idEditando = null;

const cargarMecanicos = () => {
    fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(response => response.json())
    .then(data => {
        let resultado = "";
        for (let i = 0; i < data.length; i++) {
            resultado += `
            <li>
                <p><b>ID:</b> ${data[i].id_mecanico}</p>
                <p><b>Nombres:</b> ${data[i].nombres}</p>
                <p><b>Apellidos:</b> ${data[i].apellidos}</p>
                <p><b>Especialidad:</b> ${data[i].especialidad ?? "—"}</p>
                <p><b>Teléfono:</b> ${data[i].telefono ?? "—"}</p>
                <p><b>ID Usuario:</b> ${data[i].id_usuario ?? "—"}</p>
                <p><b>Activo:</b> ${data[i].activo ? "Sí" : "No"}</p>
                <button onclick="prepararEdicion(${data[i].id_mecanico})">Editar</button>
                <button onclick="eliminarMecanico(${data[i].id_mecanico})">Eliminar</button>
                <hr>
            </li>`;
        }
        contenedor.innerHTML = resultado;
    })
    .catch(error => console.log("Error al cargar mecánicos:", error));
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
        id_mecanico:  parseInt(document.getElementById("id_mecanico").value),
        id_usuario:   document.getElementById("id_usuario").value ? parseInt(document.getElementById("id_usuario").value) : null,
        nombres:      document.getElementById("nombres").value,
        apellidos:    document.getElementById("apellidos").value,
        especialidad: document.getElementById("especialidad").value || null,
        telefono:     document.getElementById("telefono").value || null,
        activo:       document.getElementById("activo").checked
    };

    if (modoEdicion) {
        const datosUpdate = { ...datos };
        delete datosUpdate.id_mecanico;
        fetch(`${url}/${idEditando}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosUpdate)
        })
        .then(r => r.json()).then(data => { alert(data.mensaje); cancelarEdicion(); cargarMecanicos(); })
        .catch(error => console.log("Error al actualizar:", error));
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(data => { alert(data.mensaje); form.reset(); cargarMecanicos(); })
        .catch(error => console.log("Error al insertar:", error));
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`, { method: "GET", headers: { "Content-Type": "application/json" } })
    .then(r => r.json())
    .then(data => {
        document.getElementById("id_mecanico").value    = data.id_mecanico;
        document.getElementById("id_mecanico").disabled = true;
        document.getElementById("id_usuario").value     = data.id_usuario ?? "";
        document.getElementById("nombres").value        = data.nombres;
        document.getElementById("apellidos").value      = data.apellidos;
        document.getElementById("especialidad").value   = data.especialidad ?? "";
        document.getElementById("telefono").value       = data.telefono ?? "";
        document.getElementById("activo").checked       = data.activo;
        modoEdicion = true; idEditando = id;
        tituloForm.textContent = `Editar Mecánico #${id}`;
        btnCancelar.style.display = "inline";
    })
    .catch(error => console.log("Error al obtener mecánico:", error));
};

const cancelarEdicion = () => {
    form.reset();
    document.getElementById("id_mecanico").disabled = false;
    modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Registrar Mecánico";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

const eliminarMecanico = (id) => {
    if (!confirm(`¿Eliminar mecánico #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } })
    .then(r => r.json()).then(data => { alert(data.mensaje); cargarMecanicos(); })
    .catch(error => console.log("Error al eliminar:", error));
};

cargarMecanicos();