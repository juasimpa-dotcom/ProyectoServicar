from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion
from typing import Optional

router = APIRouter()

# ── Modelo Pydantic ────────────────────────────────────────────
class Vehiculo(BaseModel):
    id_vehiculo:         int
    id_usuario:          int
    id_modelo:           int
    id_combustible:      int
    id_transmision:      int
    placa:               str
    anio_fabricacion:    int
    color:               Optional[str] = None
    numero_chasis:       Optional[str] = None
    numero_motor:        Optional[str] = None
    kilometraje_actual:  int = 0
    activo:              bool = True

class VehiculoUpdate(BaseModel):
    id_usuario:          int
    id_modelo:           int
    id_combustible:      int
    id_transmision:      int
    placa:               str
    anio_fabricacion:    int
    color:               Optional[str] = None
    numero_chasis:       Optional[str] = None
    numero_motor:        Optional[str] = None
    kilometraje_actual:  int
    activo:              bool

# ── GET / ─────────────────────────────────────────────────────
@router.get("/")
async def listar_vehiculos(conn=Depends(get_conexion)):
    consulta = "SELECT * FROM vehiculos"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta)
            return await cursor.fetchall()
    except Exception as e:
        print(f"Error al listar vehículos: {e}")
        raise HTTPException(status_code=400, detail="Error al listar vehículos")

# ── GET /{id} ─────────────────────────────────────────────────
@router.get("/{id_vehiculo}")
async def obtener_vehiculo(id_vehiculo: int, conn=Depends(get_conexion)):
    consulta = "SELECT * FROM vehiculos WHERE id_vehiculo = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_vehiculo,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Vehículo no encontrado")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al obtener vehículo: {e}")
        raise HTTPException(status_code=400, detail="Error al obtener vehículo")

# ── POST / ────────────────────────────────────────────────────
@router.post("/")
async def insertar_vehiculo(vehiculo: Vehiculo, conn=Depends(get_conexion)):
    consulta = """
        INSERT INTO vehiculos (id_vehiculo, id_usuario, id_modelo, id_combustible, id_transmision,
                               placa, anio_fabricacion, color, numero_chasis, numero_motor,
                               kilometraje_actual, activo)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    parametros = (
        vehiculo.id_vehiculo, vehiculo.id_usuario, vehiculo.id_modelo,
        vehiculo.id_combustible, vehiculo.id_transmision, vehiculo.placa,
        vehiculo.anio_fabricacion, vehiculo.color, vehiculo.numero_chasis,
        vehiculo.numero_motor, vehiculo.kilometraje_actual, vehiculo.activo
    )
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Vehículo registrado exitosamente"}
    except Exception as e:
        print(f"Error al insertar vehículo: {e}")
        raise HTTPException(status_code=400, detail="Error al registrar vehículo")

# ── PUT /{id} ─────────────────────────────────────────────────
@router.put("/{id_vehiculo}")
async def actualizar_vehiculo(id_vehiculo: int, vehiculo: VehiculoUpdate, conn=Depends(get_conexion)):
    consulta = """
        UPDATE vehiculos
        SET id_usuario = %s, id_modelo = %s, id_combustible = %s, id_transmision = %s,
            placa = %s, anio_fabricacion = %s, color = %s, numero_chasis = %s,
            numero_motor = %s, kilometraje_actual = %s, activo = %s
        WHERE id_vehiculo = %s
    """
    parametros = (
        vehiculo.id_usuario, vehiculo.id_modelo, vehiculo.id_combustible,
        vehiculo.id_transmision, vehiculo.placa, vehiculo.anio_fabricacion,
        vehiculo.color, vehiculo.numero_chasis, vehiculo.numero_motor,
        vehiculo.kilometraje_actual, vehiculo.activo, id_vehiculo
    )
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Vehículo actualizado exitosamente"}
    except Exception as e:
        print(f"Error al actualizar vehículo: {e}")
        raise HTTPException(status_code=400, detail="Error al actualizar vehículo")

# ── DELETE /{id} ──────────────────────────────────────────────
@router.delete("/{id_vehiculo}")
async def eliminar_vehiculo(id_vehiculo: int, conn=Depends(get_conexion)):
    consulta = "DELETE FROM vehiculos WHERE id_vehiculo = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_vehiculo,))
            await conn.commit()
            return {"mensaje": "Vehículo eliminado exitosamente"}
    except Exception as e:
        print(f"Error al eliminar vehículo: {e}")
        raise HTTPException(status_code=400, detail="Error al eliminar vehículo")