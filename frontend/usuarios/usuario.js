const url = "http://localhost:8000/usuarios";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-usuario");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
let modoEdicion = false, idEditando = null;

const cargarUsuarios = () => {
    fetch(url).then(r => r.json()).then(data => {
        let resultado = "";
        for (let i = 0; i < data.length; i++) {
            resultado += `<li>
                <p><b>ID:</b> ${data[i].id_usuario} | <b>Nombre:</b> ${data[i].nombres} ${data[i].apellidos} | <b>Email:</b> ${data[i].email} | <b>Activo:</b> ${data[i].activo ? "Sí" : "No"}</p>
                <button onclick="prepararEdicion(${data[i].id_usuario})">Editar</button>
                <button onclick="eliminar(${data[i].id_usuario})">Eliminar</button><hr></li>`;
        }
        contenedor.innerHTML = resultado;
    });
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
        id_rol: parseInt(document.getElementById("id_rol").value),
        nombres: document.getElementById("nombres").value,
        apellidos: document.getElementById("apellidos").value,
        email: document.getElementById("email").value,
        telefono: document.getElementById("telefono").value || null,
        activo: document.getElementById("activo").checked
    };
    if (modoEdicion) {
        fetch(`${url}/${idEditando}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); cancelarEdicion(); cargarUsuarios(); });
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); form.reset(); cargarUsuarios(); });
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`).then(r => r.json()).then(data => {
        document.getElementById("id_rol").value    = data.id_rol;
        document.getElementById("nombres").value   = data.nombres;
        document.getElementById("apellidos").value = data.apellidos;
        document.getElementById("email").value     = data.email;
        document.getElementById("telefono").value  = data.telefono ?? "";
        document.getElementById("activo").checked  = data.activo;
        modoEdicion = true; idEditando = id;
        tituloForm.textContent = `Editar Usuario #${id}`;
        btnCancelar.style.display = "inline";
    });
};

const cancelarEdicion = () => {
    form.reset(); modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Registrar Usuario";
    btnCancelar.style.display = "none";
};

const eliminar = (id) => {
    if (!confirm(`¿Eliminar usuario #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE" }).then(r => r.json()).then(d => { alert(d.mensaje); cargarUsuarios(); });
};

btnCancelar.addEventListener("click", cancelarEdicion);
cargarUsuarios();