from fastapi import APIRouter, Depends, HTTPException
from config.conexionBD import get_conexion
from typing import Optional

router = APIRouter()

# ── REPORTE 1: Historial completo de mantenimientos ───────────
@router.get("/historial")
async def historial_mantenimientos(conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM v_historial_mantenimiento ORDER BY fecha_servicio DESC")
            return await cursor.fetchall()
    except Exception as e:
        print(f"Error reporte historial: {e}")
        raise HTTPException(status_code=400, detail="Error al obtener historial")

# ── REPORTE 1B: Historial filtrado por vehículo (placa) ───────
@router.get("/historial/vehiculo/{placa}")
async def historial_por_placa(placa: str, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "SELECT * FROM v_historial_mantenimiento WHERE placa = %s ORDER BY fecha_servicio DESC",
                (placa.upper(),)
            )
            return await cursor.fetchall()
    except Exception as e:
        print(f"Error reporte historial por placa: {e}")
        raise HTTPException(status_code=400, detail="Error al obtener historial del vehículo")

# ── REPORTE 2: Alertas pendientes ─────────────────────────────
@router.get("/alertas-pendientes")
async def alertas_pendientes(conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM v_alertas_pendientes ORDER BY fecha_alerta ASC")
            return await cursor.fetchall()
    except Exception as e:
        print(f"Error reporte alertas pendientes: {e}")
        raise HTTPException(status_code=400, detail="Error al obtener alertas pendientes")

# ── REPORTE 2B: Alertas pendientes filtradas por propietario ──
@router.get("/alertas-pendientes/propietario/{email}")
async def alertas_por_propietario(email: str, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "SELECT * FROM v_alertas_pendientes WHERE email = %s ORDER BY fecha_alerta ASC",
                (email,)
            )
            return await cursor.fetchall()
    except Exception as e:
        print(f"Error reporte alertas por propietario: {e}")
        raise HTTPException(status_code=400, detail="Error al obtener alertas del propietario")