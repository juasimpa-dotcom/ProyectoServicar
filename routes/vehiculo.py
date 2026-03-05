from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion
from typing import Optional

router = APIRouter()

class Vehiculo(BaseModel):
    id_usuario:         int
    id_modelo:          int
    id_combustible:     int
    id_transmision:     int
    placa:              str
    anio_fabricacion:   int
    color:              Optional[str] = None
    numero_chasis:      Optional[str] = None
    numero_motor:       Optional[str] = None
    kilometraje_actual: int = 0
    activo:             bool = True

class VehiculoUpdate(BaseModel):
    id_usuario:         int
    id_modelo:          int
    id_combustible:     int
    id_transmision:     int
    placa:              str
    anio_fabricacion:   int
    color:              Optional[str] = None
    numero_chasis:      Optional[str] = None
    numero_motor:       Optional[str] = None
    kilometraje_actual: int
    activo:             bool

@router.get("/")
async def listar_vehiculos(conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM vehiculos")
            return await cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al listar vehículos")

@router.get("/{id_vehiculo}")
async def obtener_vehiculo(id_vehiculo: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM vehiculos WHERE id_vehiculo = %s", (id_vehiculo,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Vehículo no encontrado")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al obtener vehículo")

@router.get("/usuario/{id_usuario}")
async def vehiculos_por_usuario(id_usuario: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM vehiculos WHERE id_usuario = %s", (id_usuario,))
            return await cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al obtener vehículos del usuario")

@router.post("/")
async def insertar_vehiculo(vehiculo: Vehiculo, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                """INSERT INTO vehiculos (id_usuario, id_modelo, id_combustible, id_transmision,
                   placa, anio_fabricacion, color, numero_chasis, numero_motor, kilometraje_actual, activo)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (vehiculo.id_usuario, vehiculo.id_modelo, vehiculo.id_combustible, vehiculo.id_transmision,
                 vehiculo.placa, vehiculo.anio_fabricacion, vehiculo.color, vehiculo.numero_chasis,
                 vehiculo.numero_motor, vehiculo.kilometraje_actual, vehiculo.activo)
            )
            await conn.commit()
            return {"mensaje": "Vehículo registrado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al registrar vehículo")

@router.put("/{id_vehiculo}")
async def actualizar_vehiculo(id_vehiculo: int, vehiculo: VehiculoUpdate, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                """UPDATE vehiculos SET id_usuario=%s, id_modelo=%s, id_combustible=%s, id_transmision=%s,
                   placa=%s, anio_fabricacion=%s, color=%s, numero_chasis=%s, numero_motor=%s,
                   kilometraje_actual=%s, activo=%s WHERE id_vehiculo=%s""",
                (vehiculo.id_usuario, vehiculo.id_modelo, vehiculo.id_combustible, vehiculo.id_transmision,
                 vehiculo.placa, vehiculo.anio_fabricacion, vehiculo.color, vehiculo.numero_chasis,
                 vehiculo.numero_motor, vehiculo.kilometraje_actual, vehiculo.activo, id_vehiculo)
            )
            await conn.commit()
            return {"mensaje": "Vehículo actualizado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al actualizar vehículo")

@router.delete("/{id_vehiculo}")
async def eliminar_vehiculo(id_vehiculo: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("DELETE FROM vehiculos WHERE id_vehiculo = %s", (id_vehiculo,))
            await conn.commit()
            return {"mensaje": "Vehículo eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al eliminar vehículo")