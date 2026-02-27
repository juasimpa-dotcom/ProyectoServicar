const url = "http://localhost:8000/tipos-servicio";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-tipo");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");

let modoEdicion = false;
let idEditando = null;

// ── LISTAR ────────────────────────────────────────────────────
const cargarTiposServicio = () => {
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
                <p><b>ID:</b> ${data[i].id_tipo_servicio}</p>
                <p><b>Categoría:</b> ${data[i].categoria}</p>
                <p><b>Nombre:</b> ${data[i].nombre}</p>
                <p><b>Descripción:</b> ${data[i].descripcion ?? "—"}</p>
                <p><b>Intervalo KM:</b> ${data[i].intervalo_km ?? "—"}</p>
                <p><b>Intervalo Días:</b> ${data[i].intervalo_dias ?? "—"}</p>
                <p><b>Activo:</b> ${data[i].activo ? "Sí" : "No"}</p>
                <button onclick="prepararEdicion(${data[i].id_tipo_servicio})">Editar</button>
                <button onclick="eliminarTipo(${data[i].id_tipo_servicio})">Eliminar</button>
                <hr>
            </li>`;
        }
        contenedor.innerHTML = resultado;
        console.log("Tipos de servicio cargados:", data);
    })
    .catch(error => console.log("Error al cargar tipos de servicio:", error));
};

// ── INSERTAR / ACTUALIZAR ─────────────────────────────────────
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const datos = {
        id_tipo_servicio: parseInt(document.getElementById("id_tipo_servicio").value),
        id_categoria:     parseInt(document.getElementById("id_categoria").value),
        nombre:           document.getElementById("nombre").value,
        descripcion:      document.getElementById("descripcion").value || null,
        intervalo_km:     document.getElementById("intervalo_km").value
                            ? parseInt(document.getElementById("intervalo_km").value) : null,
        intervalo_dias:   document.getElementById("intervalo_dias").value
                            ? parseInt(document.getElementById("intervalo_dias").value) : null,
        activo:           document.getElementById("activo").checked
    };

    if (modoEdicion) {
        const datosUpdate = {
            id_categoria:   datos.id_categoria,
            nombre:         datos.nombre,
            descripcion:    datos.descripcion,
            intervalo_km:   datos.intervalo_km,
            intervalo_dias: datos.intervalo_dias,
            activo:         datos.activo
        };

        fetch(`${url}/${idEditando}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosUpdate)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.mensaje);
            alert(data.mensaje);
            cancelarEdicion();
            cargarTiposServicio();
        })
        .catch(error => console.log("Error al actualizar:", error));
    } else {
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
            cargarTiposServicio();
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
        document.getElementById("id_tipo_servicio").value  = data.id_tipo_servicio;
        document.getElementById("id_tipo_servicio").disabled = true;
        document.getElementById("id_categoria").value     = data.id_categoria;
        document.getElementById("nombre").value           = data.nombre;
        document.getElementById("descripcion").value      = data.descripcion ?? "";
        document.getElementById("intervalo_km").value     = data.intervalo_km ?? "";
        document.getElementById("intervalo_dias").value   = data.intervalo_dias ?? "";
        document.getElementById("activo").checked         = data.activo;

        modoEdicion = true;
        idEditando = id;
        tituloForm.textContent = `Editar Tipo de Servicio #${id}`;
        btnCancelar.style.display = "inline";
    })
    .catch(error => console.log("Error al obtener tipo de servicio:", error));
};

// ── CANCELAR EDICIÓN ──────────────────────────────────────────
const cancelarEdicion = () => {
    form.reset();
    document.getElementById("id_tipo_servicio").disabled = false;
    modoEdicion = false;
    idEditando = null;
    tituloForm.textContent = "Registrar Tipo de Servicio";
    btnCancelar.style.display = "none";
};

btnCancelar.addEventListener("click", cancelarEdicion);

// ── ELIMINAR ──────────────────────────────────────────────────
const eliminarTipo = (id) => {
    if (!confirm(`¿Está seguro de eliminar el tipo de servicio #${id}?`)) return;

    fetch(`${url}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.mensaje);
        alert(data.mensaje);
        cargarTiposServicio();
    })
    .catch(error => console.log("Error al eliminar:", error));
};

// ── INICIO ────────────────────────────────────────────────────
cargarTiposServicio();