from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion
from typing import Optional

router = APIRouter()

# ── Modelo Pydantic ────────────────────────────────────────────
class Mantenimiento(BaseModel):
    id_mantenimiento:      int
    id_vehiculo:           int
    id_tipo_servicio:      int
    id_mecanico:           Optional[int] = None
    id_usuario_registro:   int
    fecha_servicio:        str
    kilometraje_servicio:  int
    costo_mano_obra:       float = 0.0
    observaciones:         Optional[str] = None
    proxima_fecha:         Optional[str] = None
    proximo_kilometraje:   Optional[int] = None
    estado:                str = "completado"

class MantenimientoUpdate(BaseModel):
    id_tipo_servicio:     int
    id_mecanico:          Optional[int] = None
    fecha_servicio:       str
    kilometraje_servicio: int
    costo_mano_obra:      float
    observaciones:        Optional[str] = None
    proxima_fecha:        Optional[str] = None
    proximo_kilometraje:  Optional[int] = None
    estado:               str

# ── GET / ─────────────────────────────────────────────────────
@router.get("/")
async def listar_mantenimientos(conn=Depends(get_conexion)):
    consulta = """
        SELECT m.id_mantenimiento, v.placa,
               u_prop.nombres || ' ' || u_prop.apellidos AS propietario,
               ts.nombre AS tipo_servicio, cm.nombre AS categoria,
               m.fecha_servicio, m.kilometraje_servicio,
               mec.nombres || ' ' || mec.apellidos AS mecanico,
               m.costo_mano_obra, m.observaciones,
               m.proxima_fecha, m.proximo_kilometraje, m.estado
        FROM mantenimientos m
        JOIN vehiculos v                  ON m.id_vehiculo = v.id_vehiculo
        JOIN usuarios u_prop              ON v.id_usuario = u_prop.id_usuario
        JOIN tipos_servicio ts            ON m.id_tipo_servicio = ts.id_tipo_servicio
        JOIN categorias_mantenimiento cm  ON ts.id_categoria = cm.id_categoria
        LEFT JOIN mecanicos mec           ON m.id_mecanico = mec.id_mecanico
        ORDER BY m.fecha_servicio DESC
    """
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta)
            return await cursor.fetchall()
    except Exception as e:
        print(f"Error al listar mantenimientos: {e}")
        raise HTTPException(status_code=400, detail="Error al listar mantenimientos")

# ── GET /{id} ─────────────────────────────────────────────────
@router.get("/{id_mantenimiento}")
async def obtener_mantenimiento(id_mantenimiento: int, conn=Depends(get_conexion)):
    consulta = """
        SELECT m.id_mantenimiento, m.id_vehiculo, m.id_tipo_servicio,
               m.id_mecanico, m.id_usuario_registro,
               v.placa, ts.nombre AS tipo_servicio, cm.nombre AS categoria,
               m.fecha_servicio, m.kilometraje_servicio, m.costo_mano_obra,
               m.observaciones, m.proxima_fecha, m.proximo_kilometraje, m.estado,
               mec.nombres || ' ' || mec.apellidos AS mecanico
        FROM mantenimientos m
        JOIN vehiculos v                  ON m.id_vehiculo = v.id_vehiculo
        JOIN tipos_servicio ts            ON m.id_tipo_servicio = ts.id_tipo_servicio
        JOIN categorias_mantenimiento cm  ON ts.id_categoria = cm.id_categoria
        LEFT JOIN mecanicos mec           ON m.id_mecanico = mec.id_mecanico
        WHERE m.id_mantenimiento = %s
    """
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_mantenimiento,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al obtener mantenimiento: {e}")
        raise HTTPException(status_code=400, detail="Error al obtener mantenimiento")

# ── GET historial por vehiculo ────────────────────────────────
@router.get("/vehiculo/{id_vehiculo}")
async def historial_por_vehiculo(id_vehiculo: int, conn=Depends(get_conexion)):
    consulta = """
        SELECT m.id_mantenimiento, ts.nombre AS tipo_servicio, cm.nombre AS categoria,
               m.fecha_servicio, m.kilometraje_servicio, m.costo_mano_obra,
               m.observaciones, m.proxima_fecha, m.proximo_kilometraje, m.estado,
               mec.nombres || ' ' || mec.apellidos AS mecanico
        FROM mantenimientos m
        JOIN tipos_servicio ts            ON m.id_tipo_servicio = ts.id_tipo_servicio
        JOIN categorias_mantenimiento cm  ON ts.id_categoria = cm.id_categoria
        LEFT JOIN mecanicos mec           ON m.id_mecanico = mec.id_mecanico
        WHERE m.id_vehiculo = %s
        ORDER BY m.fecha_servicio DESC
    """
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_vehiculo,))
            return await cursor.fetchall()
    except Exception as e:
        print(f"Error al obtener historial: {e}")
        raise HTTPException(status_code=400, detail="Error al obtener historial del vehículo")

# ── POST / ────────────────────────────────────────────────────
@router.post("/")
async def insertar_mantenimiento(mant: Mantenimiento, conn=Depends(get_conexion)):
    consulta = """
        INSERT INTO mantenimientos (id_mantenimiento, id_vehiculo, id_tipo_servicio, id_mecanico,
                                    id_usuario_registro, fecha_servicio, kilometraje_servicio,
                                    costo_mano_obra, observaciones, proxima_fecha,
                                    proximo_kilometraje, estado)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    parametros = (
        mant.id_mantenimiento, mant.id_vehiculo, mant.id_tipo_servicio,
        mant.id_mecanico, mant.id_usuario_registro, mant.fecha_servicio,
        mant.kilometraje_servicio, mant.costo_mano_obra, mant.observaciones,
        mant.proxima_fecha, mant.proximo_kilometraje, mant.estado
    )
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Mantenimiento registrado exitosamente"}
    except Exception as e:
        print(f"Error al insertar mantenimiento: {e}")
        raise HTTPException(status_code=400, detail="Error al registrar mantenimiento")

# ── PUT /{id} ─────────────────────────────────────────────────
@router.put("/{id_mantenimiento}")
async def actualizar_mantenimiento(id_mantenimiento: int, mant: MantenimientoUpdate, conn=Depends(get_conexion)):
    consulta = """
        UPDATE mantenimientos
        SET id_tipo_servicio = %s, id_mecanico = %s, fecha_servicio = %s,
            kilometraje_servicio = %s, costo_mano_obra = %s, observaciones = %s,
            proxima_fecha = %s, proximo_kilometraje = %s, estado = %s
        WHERE id_mantenimiento = %s
    """
    parametros = (
        mant.id_tipo_servicio, mant.id_mecanico, mant.fecha_servicio,
        mant.kilometraje_servicio, mant.costo_mano_obra, mant.observaciones,
        mant.proxima_fecha, mant.proximo_kilometraje, mant.estado,
        id_mantenimiento
    )
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Mantenimiento actualizado exitosamente"}
    except Exception as e:
        print(f"Error al actualizar mantenimiento: {e}")
        raise HTTPException(status_code=400, detail="Error al actualizar mantenimiento")

# ── DELETE /{id} ──────────────────────────────────────────────
@router.delete("/{id_mantenimiento}")
async def eliminar_mantenimiento(id_mantenimiento: int, conn=Depends(get_conexion)):
    consulta = "DELETE FROM mantenimientos WHERE id_mantenimiento = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_mantenimiento,))
            await conn.commit()
            return {"mensaje": "Mantenimiento eliminado exitosamente"}
    except Exception as e:
        print(f"Error al eliminar mantenimiento: {e}")
        raise HTTPException(status_code=400, detail="Error al eliminar mantenimiento")