from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.conexionBD import lifespan
from routes import usuario, vehiculo, tipo_servicio, mantenimiento

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

app.include_router(usuario.router,        prefix="/usuarios")
app.include_router(vehiculo.router,       prefix="/vehiculos")
app.include_router(tipo_servicio.router,  prefix="/tipos-servicio")
app.include_router(mantenimiento.router,  prefix="/mantenimientos")