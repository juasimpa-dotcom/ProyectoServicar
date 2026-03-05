from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion
from typing import Optional

router = APIRouter()

class Mantenimiento(BaseModel):
    id_vehiculo:          int
    id_tipo_servicio:     int
    id_mecanico:          Optional[int] = None
    id_usuario_registro:  int
    fecha_servicio:       str
    kilometraje_servicio: int
    costo_mano_obra:      float = 0
    observaciones:        Optional[str] = None
    proxima_fecha:        Optional[str] = None
    proximo_kilometraje:  Optional[int] = None
    estado:               str = "completado"

class MantenimientoUpdate(BaseModel):
    id_vehiculo:          int
    id_tipo_servicio:     int
    id_mecanico:          Optional[int] = None
    id_usuario_registro:  int
    fecha_servicio:       str
    kilometraje_servicio: int
    costo_mano_obra:      float
    observaciones:        Optional[str] = None
    proxima_fecha:        Optional[str] = None
    proximo_kilometraje:  Optional[int] = None
    estado:               str

@router.get("/")
async def listar_mantenimientos(conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM mantenimientos")
            return await cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al listar mantenimientos")

@router.get("/{id_mantenimiento}")
async def obtener_mantenimiento(id_mantenimiento: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM mantenimientos WHERE id_mantenimiento = %s", (id_mantenimiento,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al obtener mantenimiento")

@router.get("/vehiculo/{id_vehiculo}")
async def historial_por_vehiculo(id_vehiculo: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM mantenimientos WHERE id_vehiculo = %s ORDER BY fecha_servicio DESC", (id_vehiculo,))
            return await cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al obtener historial del vehículo")

@router.post("/")
async def insertar_mantenimiento(m: Mantenimiento, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                """INSERT INTO mantenimientos (id_vehiculo, id_tipo_servicio, id_mecanico, id_usuario_registro,
                   fecha_servicio, kilometraje_servicio, costo_mano_obra, observaciones,
                   proxima_fecha, proximo_kilometraje, estado)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (m.id_vehiculo, m.id_tipo_servicio, m.id_mecanico, m.id_usuario_registro,
                 m.fecha_servicio, m.kilometraje_servicio, m.costo_mano_obra, m.observaciones,
                 m.proxima_fecha, m.proximo_kilometraje, m.estado)
            )
            await conn.commit()
            return {"mensaje": "Mantenimiento registrado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al registrar mantenimiento")

@router.put("/{id_mantenimiento}")
async def actualizar_mantenimiento(id_mantenimiento: int, m: MantenimientoUpdate, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                """UPDATE mantenimientos SET id_vehiculo=%s, id_tipo_servicio=%s, id_mecanico=%s,
                   id_usuario_registro=%s, fecha_servicio=%s, kilometraje_servicio=%s,
                   costo_mano_obra=%s, observaciones=%s, proxima_fecha=%s, proximo_kilometraje=%s,
                   estado=%s WHERE id_mantenimiento=%s""",
                (m.id_vehiculo, m.id_tipo_servicio, m.id_mecanico, m.id_usuario_registro,
                 m.fecha_servicio, m.kilometraje_servicio, m.costo_mano_obra, m.observaciones,
                 m.proxima_fecha, m.proximo_kilometraje, m.estado, id_mantenimiento)
            )
            await conn.commit()
            return {"mensaje": "Mantenimiento actualizado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al actualizar mantenimiento")

@router.delete("/{id_mantenimiento}")
async def eliminar_mantenimiento(id_mantenimiento: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("DELETE FROM mantenimientos WHERE id_mantenimiento = %s", (id_mantenimiento,))
            await conn.commit()
            return {"mensaje": "Mantenimiento eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al eliminar mantenimiento")