from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion
from typing import Optional

router = APIRouter()

class Alerta(BaseModel):
    id_vehiculo:        int
    id_tipo_servicio:   int
    id_mantenimiento:   Optional[int] = None
    tipo_alerta:        str
    fecha_alerta:       Optional[str] = None
    kilometraje_alerta: Optional[int] = None
    mensaje:            Optional[str] = None
    estado:             str = "pendiente"

class AlertaUpdate(BaseModel):
    tipo_alerta:        str
    fecha_alerta:       Optional[str] = None
    kilometraje_alerta: Optional[int] = None
    mensaje:            Optional[str] = None
    estado:             str

@router.get("/")
async def listar_alertas(conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM alertas_mantenimiento")
            return await cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al listar alertas")

@router.get("/{id_alerta}")
async def obtener_alerta(id_alerta: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM alertas_mantenimiento WHERE id_alerta = %s", (id_alerta,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Alerta no encontrada")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al obtener alerta")

@router.get("/vehiculo/{id_vehiculo}")
async def alertas_por_vehiculo(id_vehiculo: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM alertas_mantenimiento WHERE id_vehiculo = %s ORDER BY creado_en DESC", (id_vehiculo,))
            return await cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al obtener alertas del vehículo")

@router.get("/pendientes/all")
async def alertas_pendientes(conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM alertas_mantenimiento WHERE estado = 'pendiente' ORDER BY creado_en DESC")
            return await cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al obtener alertas pendientes")

@router.post("/")
async def insertar_alerta(alerta: Alerta, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                """INSERT INTO alertas_mantenimiento (id_vehiculo, id_tipo_servicio, id_mantenimiento,
                   tipo_alerta, fecha_alerta, kilometraje_alerta, mensaje, estado)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                (alerta.id_vehiculo, alerta.id_tipo_servicio, alerta.id_mantenimiento,
                 alerta.tipo_alerta, alerta.fecha_alerta, alerta.kilometraje_alerta, alerta.mensaje, alerta.estado)
            )
            await conn.commit()
            return {"mensaje": "Alerta registrada exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al registrar alerta")

@router.put("/{id_alerta}")
async def actualizar_alerta(id_alerta: int, alerta: AlertaUpdate, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "UPDATE alertas_mantenimiento SET tipo_alerta=%s, fecha_alerta=%s, kilometraje_alerta=%s, mensaje=%s, estado=%s WHERE id_alerta=%s",
                (alerta.tipo_alerta, alerta.fecha_alerta, alerta.kilometraje_alerta, alerta.mensaje, alerta.estado, id_alerta)
            )
            await conn.commit()
            return {"mensaje": "Alerta actualizada exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al actualizar alerta")

@router.delete("/{id_alerta}")
async def eliminar_alerta(id_alerta: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("DELETE FROM alertas_mantenimiento WHERE id_alerta = %s", (id_alerta,))
            await conn.commit()
            return {"mensaje": "Alerta eliminada exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al eliminar alerta")