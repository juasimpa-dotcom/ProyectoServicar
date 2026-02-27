const url = "http://localhost:8000/usuarios";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-usuario");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");

let modoEdicion = false;
let idEditando = null;

// ── LISTAR ────────────────────────────────────────────────────
const cargarUsuarios = () => {
    fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        let resultado = "";
        for (let i = 0; i < data.length; i++) {
            resultado += `
            <li>
                <p><b>ID:</b> ${data[i].id_usuario}</p>
                <p><b>Rol:</b> ${data[i].rol}</p>
                <p><b>Nombres:</b> ${data[i].nombres}</p>
                <p><b>Apellidos:</b> ${data[i].apellidos}</p>
                <p><b>Email:</b> ${data[i].email}</p>
                <p><b>Teléfono:</b> ${data[i].telefono ?? "—"}</p>
                <p><b>Activo:</b> ${data[i].activo ? "Sí" : "No"}</p>
                <button onclick="prepararEdicion(${data[i].id_usuario})">Editar</button>
                <button onclick="eliminarUsuario(${data[i].id_usuario})">Eliminar</button>
                <hr>
            </li>`;
        }
        contenedor.innerHTML = resultado;
        console.log("Usuarios cargados:", data);
    })
    .catch(error => console.log("Error al cargar usuarios:", error));
};

// ── INSERTAR / ACTUALIZAR (submit del form) ───────────────────
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const datos = {
        id_usuario:    parseInt(document.getElementById("id_usuario").value),
        id_rol:        parseInt(document.getElementById("id_rol").value),
        nombres:       document.getElementById("nombres").value,
        apellidos:     document.getElementById("apellidos").value,
        email:         document.getElementById("email").value,
        telefono:      document.getElementById("telefono").value || null,
        activo:        document.getElementById("activo").checked
    };

    if (modoEdicion) {
        // PUT - actualizar
        fetch(`${url}/${idEditando}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_rol:    datos.id_rol,
                nombres:   datos.nombres,
                apellidos: datos.apellidos,
                email:     datos.email,
                telefono:  datos.telefono,
                activo:    datos.activo
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.mensaje);
            alert(data.mensaje);
            cancelarEdicion();
            cargarUsuarios();
        })
        .catch(error => console.log("Error al actualizar:", error));
    } else {
        // POST - insertar
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.mensaje);
            alert(data.mensaje);
            form.reset();
            cargarUsuarios();
        })
        .catch(error => console.log("Error al insertar:", error));
    }
});

// ── PREPARAR EDICIÓN ──────────────────────────────────────────
const prepararEdicion = (id) => {
    fetch(`${url}/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("id_usuario").value    = data.id_usuario;
        document.getElementById("id_usuario").disabled = true;
        document.getElementById("id_rol").value        = data.id_rol;
        document.getElementById("nombres").value       = data.nombres;
        document.getElementById("apellidos").value     = data.apellidos;
        document.getElementById("email").value         = data.email;
        document.getElementById("telefono").value      = data.telefono ?? "";
        document.getElementById("activo").checked      = data.activo;

        modoEdicion = true;
        idEditando = id;
        tituloForm.textContent = `Editar Usuario #${id}`;
        btnCancelar.style.display = "inline";
    })
    .catch(error => console.log("Error al obtener usuario:", error));
};

// ── CANCELAR EDICIÓN ──────────────────────────────────────────
const cancelarEdicion = () => {
    form.reset();
    document.getElementById("id_usuario").disabled = false;
    modoEdicion = false;
    idEditando = null;
    tituloForm.textContent = "Registrar Usuario";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

// ── ELIMINAR ──────────────────────────────────────────────────
const eliminarUsuario = (id) => {
    if (!confirm(`¿Está seguro de eliminar el usuario #${id}?`)) return;

    fetch(`${url}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.mensaje);
        alert(data.mensaje);
        cargarUsuarios();
    })
    .catch(error => console.log("Error al eliminar:", error));
};

// ── INICIO ────────────────────────────────────────────────────
cargarUsuarios();