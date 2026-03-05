const base = "http://localhost:8000/reportes";

// ── TABS ──────────────────────────────────────────────────────
const cambiarTab = (nombre, el) => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("activo"));
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("activo"));
    el.classList.add("activo");
    document.getElementById(`panel-${nombre}`).classList.add("activo");
};

// ── HISTORIAL ─────────────────────────────────────────────────
const cargarHistorial = () => {
    fetch(`${base}/historial`)
        .then(r => r.json())
        .then(data => renderHistorial(data));
};

const buscarPorPlaca = () => {
    const placa = document.getElementById("filtro-placa").value.trim();
    if (!placa) { alert("Ingrese una placa"); return; }
    fetch(`${base}/historial/vehiculo/${placa}`)
        .then(r => r.json())
        .then(data => renderHistorial(data));
};

const renderHistorial = (data) => {
    const tbody = document.getElementById("tabla-historial");
    const resumen = document.getElementById("resumen-historial");

    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="13" class="sin-datos">No se encontraron registros.</td></tr>`;
        resumen.innerHTML = "";
        return;
    }

    // Resumen
    const totalCosto = data.reduce((s, r) => s + (r.costo_total || 0), 0);
    const estados = {};
    data.forEach(r => { estados[r.estado] = (estados[r.estado] || 0) + 1; });

    resumen.innerHTML = `
        <div class="card-resumen"><div class="numero">${data.length}</div><div class="etiqueta">Total Registros</div></div>
        <div class="card-resumen"><div class="numero">Bs. ${totalCosto.toFixed(2)}</div><div class="etiqueta">Costo Total</div></div>
        ${Object.entries(estados).map(([e, c]) => `<div class="card-resumen"><div class="numero">${c}</div><div class="etiqueta">${e}</div></div>`).join("")}
    `;

    // Tabla
    tbody.innerHTML = data.map((r, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><b>${r.placa}</b></td>
            <td>${r.propietario}</td>
            <td>${r.marca} ${r.modelo} (${r.anio_fabricacion})</td>
            <td>${r.tipo_servicio}</td>
            <td>${r.categoria}</td>
            <td>${r.fecha_servicio}</td>
            <td>${r.kilometraje_servicio} km</td>
            <td>${r.mecanico ?? "—"}</td>
            <td>Bs. ${r.costo_mano_obra}</td>
            <td>Bs. ${r.costo_repuestos}</td>
            <td><b>Bs. ${r.costo_total}</b></td>
            <td><span class="badge ${r.estado}">${r.estado}</span></td>
        </tr>
    `).join("");
};

// ── ALERTAS ───────────────────────────────────────────────────
const cargarAlertas = () => {
    fetch(`${base}/alertas-pendientes`)
        .then(r => r.json())
        .then(data => renderAlertas(data));
};

const buscarPorEmail = () => {
    const email = document.getElementById("filtro-email").value.trim();
    if (!email) { alert("Ingrese un email"); return; }
    fetch(`${base}/alertas-pendientes/propietario/${email}`)
        .then(r => r.json())
        .then(data => renderAlertas(data));
};

const renderAlertas = (data) => {
    const tbody = document.getElementById("tabla-alertas");
    const resumen = document.getElementById("resumen-alertas");

    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="11" class="sin-datos">No hay alertas pendientes.</td></tr>`;
        resumen.innerHTML = "";
        return;
    }

    // Resumen
    const tipos = {};
    data.forEach(r => { tipos[r.tipo_alerta] = (tipos[r.tipo_alerta] || 0) + 1; });

    resumen.innerHTML = `
        <div class="card-resumen"><div class="numero">${data.length}</div><div class="etiqueta">Total Alertas</div></div>
        ${Object.entries(tipos).map(([t, c]) => `<div class="card-resumen"><div class="numero">${c}</div><div class="etiqueta">${t}</div></div>`).join("")}
    `;

    // Tabla
    tbody.innerHTML = data.map((r, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><b>${r.placa}</b></td>
            <td>${r.propietario}</td>
            <td>${r.email}</td>
            <td>${r.telefono ?? "—"}</td>
            <td>${r.servicio_pendiente}</td>
            <td>${r.tipo_alerta}</td>
            <td>${r.fecha_alerta ?? "—"}</td>
            <td>${r.kilometraje_alerta ?? "—"}</td>
            <td>${r.kilometraje_actual} km</td>
            <td>${r.mensaje ?? "—"}</td>
        </tr>
    `).join("");
};

// Cargar al iniciar
cargarHistorial();