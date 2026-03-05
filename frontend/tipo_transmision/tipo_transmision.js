const url = "http://localhost:8000/tipos-transmision";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-transmision");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
let modoEdicion = false, idEditando = null;

const cargarTransmisiones = () => {
    fetch(url).then(r => r.json()).then(data => {
        let resultado = "";
        for (let i = 0; i < data.length; i++) {
            resultado += `<li><p><b>ID:</b> ${data[i].id_transmision} | <b>Nombre:</b> ${data[i].nombre}</p>
                <button onclick="prepararEdicion(${data[i].id_transmision})">Editar</button>
                <button onclick="eliminar(${data[i].id_transmision})">Eliminar</button><hr></li>`;
        }
        contenedor.innerHTML = resultado;
    });
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = { nombre: document.getElementById("nombre").value };
    if (modoEdicion) {
        fetch(`${url}/${idEditando}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); cancelarEdicion(); cargarTransmisiones(); });
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); form.reset(); cargarTransmisiones(); });
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`).then(r => r.json()).then(data => {
        document.getElementById("nombre").value = data.nombre;
        modoEdicion = true; idEditando = id;
        tituloForm.textContent = `Editar Transmisión #${id}`;
        btnCancelar.style.display = "inline";
    });
};

const cancelarEdicion = () => {
    form.reset(); modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Registrar Tipo de Transmisión";
    btnCancelar.style.display = "none";
};

const eliminar = (id) => {
    if (!confirm(`¿Eliminar #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE" }).then(r => r.json()).then(d => { alert(d.mensaje); cargarTransmisiones(); });
};

btnCancelar.addEventListener("click", cancelarEdicion);
cargarTransmisiones();