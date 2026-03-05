const url = "http://localhost:8000/modelos";
const contenedor = document.getElementById("data");
const form = document.getElementById("form-modelo");
const tituloForm = document.getElementById("titulo-form");
const btnCancelar = document.getElementById("btn-cancelar");
let modoEdicion = false, idEditando = null;

const cargarModelos = () => {
    fetch(url).then(r => r.json()).then(data => {
        let resultado = "";
        for (let i = 0; i < data.length; i++) {
            resultado += `<li>
                <p><b>ID:</b> ${data[i].id_modelo} | <b>ID Marca:</b> ${data[i].id_marca} | <b>Nombre:</b> ${data[i].nombre} | <b>Activo:</b> ${data[i].activo ? "Sí" : "No"}</p>
                <button onclick="prepararEdicion(${data[i].id_modelo})">Editar</button>
                <button onclick="eliminarModelo(${data[i].id_modelo})">Eliminar</button><hr>
            </li>`;
        }
        contenedor.innerHTML = resultado;
    }).catch(e => console.log("Error:", e));
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const datos = { id_marca: parseInt(document.getElementById("id_marca").value), nombre: document.getElementById("nombre").value, activo: document.getElementById("activo").checked };
    if (modoEdicion) {
        fetch(`${url}/${idEditando}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); cancelarEdicion(); cargarModelos(); });
    } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })
        .then(r => r.json()).then(d => { alert(d.mensaje); form.reset(); cargarModelos(); });
    }
});

const prepararEdicion = (id) => {
    fetch(`${url}/${id}`).then(r => r.json()).then(data => {
        document.getElementById("id_marca").value   = data.id_marca;
        document.getElementById("nombre").value     = data.nombre;
        document.getElementById("activo").checked   = data.activo;
        modoEdicion = true; idEditando = id;
        tituloForm.textContent = `Editar Modelo #${id}`;
        btnCancelar.style.display = "inline";
    });
};

const cancelarEdicion = () => {
    form.reset(); modoEdicion = false; idEditando = null;
    tituloForm.textContent = "Registrar Modelo";
    btnCancelar.style.display = "none";
};

const eliminarModelo = (id) => {
    if (!confirm(`¿Eliminar modelo #${id}?`)) return;
    fetch(`${url}/${id}`, { method: "DELETE" }).then(r => r.json()).then(d => { alert(d.mensaje); cargarModelos(); });
};

btnCancelar.addEventListener("click", cancelarEdicion);
cargarModelos();