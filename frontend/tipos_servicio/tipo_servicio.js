const url = "http://localhost:8000/tipos-servicio";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-ts");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
let modoEdicion = false, idEditando = null;

const cargarTipos = () => {
    fetch(url).then(r => r.json()).then(data => {
        let resultado = "";
        for (let i = 0; i < data.length; i++) {
            resultado += `<li>
                <p><b>ID:</b> ${data[i].id_tipo_servicio} | <b>Nombre:</b> ${data[i].nombre} | <b>Km:</b> ${data[i].intervalo_km ?? "—"} | <b>Días:</b> ${data[i].intervalo_dias ?? "—"} | <b>Activo:</b> ${data[i].activo ? "Sí" : "No"}</p>
                <button onclick="prepararEdicion(${data[i].id_tipo_servicio})">Editar</button>
                <button onclick="eliminar(${data[i].id_tipo_servicio})">Eliminar</button><hr></li>`;
        }
        contenedor.innerHTML = resultado;
    });
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
        id_categoria:   parseInt(document.getElementById("id_categoria").value),
        nombre:         document.getElementById("nombre").value,
        descripcion:    document.getElementById("descripcion").value || null,
        intervalo_km:   document.getElementById("intervalo_km").value ? parseInt(document.getElementById("intervalo_km").value) : null,
        intervalo_dias: document.getElementById("intervalo_dias").value ? parseInt(document.getElementById("intervalo_dias").value) : null,
        activo:         document.getElementById("activo").checked
    };
    if (modoEdicion) {
        fetch(`${url}/${idEditando}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); cancelarEdicion(); cargarTipos(); });
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); form.reset(); cargarTipos(); });
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`).then(r => r.json()).then(data => {
        document.getElementById("id_categoria").value   = data.id_categoria;
        document.getElementById("nombre").value         = data.nombre;
        document.getElementById("descripcion").value    = data.descripcion ?? "";
        document.getElementById("intervalo_km").value   = data.intervalo_km ?? "";
        document.getElementById("intervalo_dias").value = data.intervalo_dias ?? "";
        document.getElementById("activo").checked       = data.activo;
        modoEdicion = true; idEditando = id;
        tituloForm.textContent = `Editar Tipo Servicio #${id}`;
        btnCancelar.style.display = "inline";
    });
};

const cancelarEdicion = () => {
    form.reset(); modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Registrar Tipo de Servicio";
    btnCancelar.style.display = "none";
};

const eliminar = (id) => {
    if (!confirm(`¿Eliminar tipo de servicio #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE" }).then(r => r.json()).then(d => { alert(d.mensaje); cargarTipos(); });
};

btnCancelar.addEventListener("click", cancelarEdicion);
cargarTipos();