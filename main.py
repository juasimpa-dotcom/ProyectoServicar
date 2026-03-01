from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.conexionBD import lifespan
from routes import (
    usuario, vehiculo, tipo_servicio, mantenimiento,
    rol, marca, modelo, tipo_combustible, tipo_transmision,
    categoria_mantenimiento, mecanico, repuesto, alerta,
    mantenimiento_repuesto
)

app = FastAPI(
    lifespan=lifespan,
    title="SERVICAR API",
    description="Sistema de Gestión de Mantenimiento Vehicular",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tablas principales
app.include_router(usuario.router,        prefix="/usuarios")
app.include_router(vehiculo.router,       prefix="/vehiculos")
app.include_router(tipo_servicio.router,  prefix="/tipos-servicio")
app.include_router(mantenimiento.router,  prefix="/mantenimientos")

# Tablas de catálogo
app.include_router(rol.router,                      prefix="/roles")
app.include_router(marca.router,                    prefix="/marcas")
app.include_router(modelo.router,                   prefix="/modelos")
app.include_router(tipo_combustible.router,         prefix="/tipos-combustible")
app.include_router(tipo_transmision.router,         prefix="/tipos-transmision")
app.include_router(categoria_mantenimiento.router,  prefix="/categorias-mantenimiento")
app.include_router(mecanico.router,                 prefix="/mecanicos")
app.include_router(repuesto.router,                 prefix="/repuestos")
app.include_router(alerta.router,                   prefix="/alertas")
app.include_router(mantenimiento_repuesto.router,   prefix="/mantenimiento-repuestos")