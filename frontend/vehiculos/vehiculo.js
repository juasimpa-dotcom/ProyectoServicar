const url = "http://localhost:8000/vehiculos";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-vehiculo");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
let modoEdicion = false, idEditando = null;

const cargarVehiculos = () => {
    fetch(url).then(r => r.json()).then(data => {
        let resultado = "";
        for (let i = 0; i < data.length; i++) {
            resultado += `<li>
                <p><b>ID:</b> ${data[i].id_vehiculo} | <b>Placa:</b> ${data[i].placa} | <b>Año:</b> ${data[i].anio_fabricacion} | <b>Km:</b> ${data[i].kilometraje_actual} | <b>Activo:</b> ${data[i].activo ? "Sí" : "No"}</p>
                <button onclick="prepararEdicion(${data[i].id_vehiculo})">Editar</button>
                <button onclick="eliminar(${data[i].id_vehiculo})">Eliminar</button><hr></li>`;
        }
        contenedor.innerHTML = resultado;
    });
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = {
        id_usuario:         parseInt(document.getElementById("id_usuario").value),
        id_modelo:          parseInt(document.getElementById("id_modelo").value),
        id_combustible:     parseInt(document.getElementById("id_combustible").value),
        id_transmision:     parseInt(document.getElementById("id_transmision").value),
        placa:              document.getElementById("placa").value,
        anio_fabricacion:   parseInt(document.getElementById("anio_fabricacion").value),
        color:              document.getElementById("color").value || null,
        numero_chasis:      document.getElementById("numero_chasis").value || null,
        numero_motor:       document.getElementById("numero_motor").value || null,
        kilometraje_actual: parseInt(document.getElementById("kilometraje_actual").value),
        activo:             document.getElementById("activo").checked
    };
    if (modoEdicion) {
        fetch(`${url}/${idEditando}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); cancelarEdicion(); cargarVehiculos(); });
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); form.reset(); cargarVehiculos(); });
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`).then(r => r.json()).then(data => {
        document.getElementById("id_usuario").value         = data.id_usuario;
        document.getElementById("id_modelo").value          = data.id_modelo;
        document.getElementById("id_combustible").value     = data.id_combustible;
        document.getElementById("id_transmision").value     = data.id_transmision;
        document.getElementById("placa").value              = data.placa;
        document.getElementById("anio_fabricacion").value   = data.anio_fabricacion;
        document.getElementById("color").value              = data.color ?? "";
        document.getElementById("numero_chasis").value      = data.numero_chasis ?? "";
        document.getElementById("numero_motor").value       = data.numero_motor ?? "";
        document.getElementById("kilometraje_actual").value = data.kilometraje_actual;
        document.getElementById("activo").checked           = data.activo;
        modoEdicion = true; idEditando = id;
        tituloForm.textContent = `Editar Vehículo #${id}`;
        btnCancelar.style.display = "inline";
    });
};

const cancelarEdicion = () => {
    form.reset(); modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Registrar Vehículo";
    btnCancelar.style.display = "none";
};

const eliminar = (id) => {
    if (!confirm(`¿Eliminar vehículo #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE" }).then(r => r.json()).then(d => { alert(d.mensaje); cargarVehiculos(); });
};

btnCancelar.addEventListener("click", cancelarEdicion);
cargarVehiculos();