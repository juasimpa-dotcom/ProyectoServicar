const url = "http://localhost:8000/mecanicos";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-mecanico");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
let modoEdicion = false, idEditando = null;

const cargarMecanicos = () => {
    fetch(url).then(r => r.json()).then(data => {
        let resultado = "";
        for (let i = 0; i < data.length; i++) {
            resultado += `<li>
                <p><b>ID:</b> ${data[i].id_mecanico} | <b>Nombre:</b> ${data[i].nombres} ${data[i].apellidos} | <b>Especialidad:</b> ${data[i].especialidad ?? "—"} | <b>Activo:</b> ${data[i].activo ? "Sí" : "No"}</p>
                <button onclick="prepararEdicion(${data[i].id_mecanico})">Editar</button>
                <button onclick="eliminar(${data[i].id_mecanico})">Eliminar</button><hr></li>`;
        }
        contenedor.innerHTML = resultado;
    });
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
        id_usuario:   document.getElementById("id_usuario").value ? parseInt(document.getElementById("id_usuario").value) : null,
        nombres:      document.getElementById("nombres").value,
        apellidos:    document.getElementById("apellidos").value,
        especialidad: document.getElementById("especialidad").value || null,
        telefono:     document.getElementById("telefono").value || null,
        activo:       document.getElementById("activo").checked
    };
    if (modoEdicion) {
        fetch(`${url}/${idEditando}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); cancelarEdicion(); cargarMecanicos(); });
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); form.reset(); cargarMecanicos(); });
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`).then(r => r.json()).then(data => {
        document.getElementById("id_usuario").value   = data.id_usuario ?? "";
        document.getElementById("nombres").value      = data.nombres;
        document.getElementById("apellidos").value    = data.apellidos;
        document.getElementById("especialidad").value = data.especialidad ?? "";
        document.getElementById("telefono").value     = data.telefono ?? "";
        document.getElementById("activo").checked     = data.activo;
        modoEdicion = true; idEditando = id;
        tituloForm.textContent = `Editar Mecánico #${id}`;
        btnCancelar.style.display = "inline";
    });
};

const cancelarEdicion = () => {
    form.reset(); modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Registrar Mecánico";
    btnCancelar.style.display = "none";
};

const eliminar = (id) => {
    if (!confirm(`¿Eliminar mecánico #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE" }).then(r => r.json()).then(d => { alert(d.mensaje); cargarMecanicos(); });
};

btnCancelar.addEventListener("click", cancelarEdicion);
cargarMecanicos();