const base = "http://localhost:8000/reportes";

// ── TABS ──
const cambiarTab = (nombre, el) => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("activo"));
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("activo"));
    el.classList.add("activo");
    
    const panelId = `panel-${nombre}`;
    document.getElementById(panelId).classList.add("activo");
    
    // Cargar datos según el tab
    if(nombre === 'historial') cargarHistorial();
    if(nombre === 'alertas') cargarAlertas();
};

// ── HISTORIAL ──
const cargarHistorial = () => {
    fetch(`${base}/historial`)
        .then(r => r.json())
        .then(data => renderHistorial(data))
        .catch(e => console.error("Error cargando historial", e));
};

const buscarPlaca = () => {
    const placa = document.getElementById("filtro-placa").value.trim();
    if (!placa) { alert("Ingrese una placa"); return; }
    fetch(`${base}/historial/vehiculo/${placa}`)
        .then(r => r.json())
        .then(data => renderHistorial(data));
};

const renderHistorial = (data) => {
    const tbody = document.getElementById("tbody-h");
    const resumen = document.getElementById("resumen-h");

    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="13" class="sin-datos">No hay historial para mostrar.</td></tr>`;
        resumen.innerHTML = "";
        return;
    }

    // Cálculos para el resumen
    const totalCosto = data.reduce((s, r) => s + (parseFloat(r.costo_total) || 0), 0);
    const completados = data.filter(r => r.estado === 'completado').length;

    resumen.innerHTML = `
        <div class="card-r"><div class="num">${data.length}</div><div class="lbl">Servicios</div></div>
        <div class="card-r"><div class="num">Bs. ${totalCosto.toLocaleString(undefined, {minimumFractionDigits: 2})}</div><div class="lbl">Ingresos Totales</div></div>
        <div class="card-r"><div class="num">${completados}</div><div class="lbl">Completados</div></div>
    `;

    tbody.innerHTML = data.map((r, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><b>${r.placa}</b></td>
            <td>${r.propietario}</td>
            <td><small>${r.marca} ${r.modelo}</small></td>
            <td>${r.tipo_servicio}</td>
            <td><small>${r.categoria}</small></td>
            <td>${r.fecha_servicio}</td>
            <td>${r.kilometraje_servicio.toLocaleString()}</td>
            <td>${r.mecanico ?? "—"}</td>
            <td>Bs. ${r.costo_mano_obra}</td>
            <td>Bs. ${r.costo_repuestos}</td>
            <td><b style="color:var(--accent)">Bs. ${r.costo_total}</b></td>
            <td><span class="badge ${r.estado}">${r.estado.toUpperCase()}</span></td>
        </tr>
    `).join("");
};

// ── ALERTAS ──
const cargarAlertas = () => {
    fetch(`${base}/alertas-pendientes`)
        .then(r => r.json())
        .then(data => renderAlertas(data))
        .catch(e => console.error("Error cargando alertas", e));
};

const buscarEmail = () => {
    const email = document.getElementById("filtro-email").value.trim();
    if (!email) { alert("Ingrese un email"); return; }
    fetch(`${base}/alertas-pendientes/propietario/${email}`)
        .then(r => r.json())
        .then(data => renderAlertas(data));
};

const renderAlertas = (data) => {
    const tbody = document.getElementById("tbody-a");
    const resumen = document.getElementById("resumen-a");

    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="11" class="sin-datos">No hay alertas críticas pendientes.</td></tr>`;
        resumen.innerHTML = "";
        return;
    }

    const porKm = data.filter(a => a.tipo_alerta === 'por_km' || a.tipo_alerta === 'ambos').length;

    resumen.innerHTML = `
        <div class="card-r"><div class="num">${data.length}</div><div class="lbl">Alertas Hoy</div></div>
        <div class="card-r"><div class="num">${porKm}</div><div class="lbl">Por Kilometraje</div></div>
    `;

    tbody.innerHTML = data.map((r, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><b>${r.placa}</b></td>
            <td>${r.propietario}</td>
            <td><small>${r.email}</small></td>
            <td>${r.telefono ?? "—"}</td>
            <td>${r.servicio_pendiente}</td>
            <td><span class="badge info">${r.tipo_alerta}</span></td>
            <td>${r.fecha_alerta ?? "—"}</td>
            <td>${r.kilometraje_alerta ?? "—"}</td>
            <td>${r.kilometraje_actual} km</td>
            <td><i style="font-size:0.9em">${r.mensaje ?? "Sin mensaje"}</i></td>
        </tr>
    `).join("");
};

// Inicialización
document.addEventListener("DOMContentLoaded", cargarHistorial);
cargarHistorial();
document.addEventListener("DOMContentLoaded", cargarAlertas);
cargarAlertas();
window.buscarPlaca = buscarPlaca;
window.buscarEmail = buscarEmail;
window.cambiarTab = cambiarTab;
window.cargarHistorial = cargarHistorial;
window.cargarAlertas = cargarAlertas;