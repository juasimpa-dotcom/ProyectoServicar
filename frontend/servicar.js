const toast = (mensaje, tipo = "success") => {
    const el = document.createElement("div");
    el.className = `toast ${tipo}`;
    el.textContent = tipo === "success" ? `✅ ${mensaje}` : `❌ ${mensaje}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
};