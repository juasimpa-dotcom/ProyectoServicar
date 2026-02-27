from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion
from typing import Optional

router = APIRouter()

# ── Modelo Pydantic ────────────────────────────────────────────
class TipoServicio(BaseModel):
    id_tipo_servicio: int
    id_categoria:     int
    nombre:           str
    descripcion:      Optional[str] = None
    intervalo_km:     Optional[int] = None
    intervalo_dias:   Optional[int] = None
    activo:           bool = True

class TipoServicioUpdate(BaseModel):
    id_categoria:   int
    nombre:         str
    descripcion:    Optional[str] = None
    intervalo_km:   Optional[int] = None
    intervalo_dias: Optional[int] = None
    activo:         bool

# ── GET / ─────────────────────────────────────────────────────
@router.get("/")
async def listar_tipos_servicio(conn=Depends(get_conexion)):
    consulta = """
        SELECT ts.id_tipo_servicio, ts.nombre, ts.descripcion,
               ts.intervalo_km, ts.intervalo_dias, ts.activo,
               cm.nombre AS categoria
        FROM tipos_servicio ts
        JOIN categorias_mantenimiento cm ON ts.id_categoria = cm.id_categoria
        ORDER BY cm.nombre, ts.nombre
    """
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta)
            return await cursor.fetchall()
    except Exception as e:
        print(f"Error al listar tipos de servicio: {e}")
        raise HTTPException(status_code=400, detail="Error al listar tipos de servicio")

# ── GET /{id} ─────────────────────────────────────────────────
@router.get("/{id_tipo_servicio}")
async def obtener_tipo_servicio(id_tipo_servicio: int, conn=Depends(get_conexion)):
    consulta = """
        SELECT ts.id_tipo_servicio, ts.id_categoria, ts.nombre, ts.descripcion,
               ts.intervalo_km, ts.intervalo_dias, ts.activo,
               cm.nombre AS categoria
        FROM tipos_servicio ts
        JOIN categorias_mantenimiento cm ON ts.id_categoria = cm.id_categoria
        WHERE ts.id_tipo_servicio = %s
    """
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_tipo_servicio,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Tipo de servicio no encontrado")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al obtener tipo de servicio: {e}")
        raise HTTPException(status_code=400, detail="Error al obtener tipo de servicio")

# ── GET por categoria ─────────────────────────────────────────
@router.get("/categoria/{id_categoria}")
async def tipos_por_categoria(id_categoria: int, conn=Depends(get_conexion)):
    consulta = """
        SELECT id_tipo_servicio, nombre, descripcion, intervalo_km, intervalo_dias
        FROM tipos_servicio
        WHERE id_categoria = %s AND activo = TRUE
        ORDER BY nombre
    """
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_categoria,))
            return await cursor.fetchall()
    except Exception as e:
        print(f"Error al filtrar por categoría: {e}")
        raise HTTPException(status_code=400, detail="Error al filtrar tipos de servicio")

# ── POST / ────────────────────────────────────────────────────
@router.post("/")
async def insertar_tipo_servicio(tipo: TipoServicio, conn=Depends(get_conexion)):
    consulta = """
        INSERT INTO tipos_servicio (id_tipo_servicio, id_categoria, nombre, descripcion,
                                    intervalo_km, intervalo_dias, activo)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    parametros = (
        tipo.id_tipo_servicio, tipo.id_categoria, tipo.nombre,
        tipo.descripcion, tipo.intervalo_km, tipo.intervalo_dias, tipo.activo
    )
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Tipo de servicio registrado exitosamente"}
    except Exception as e:
        print(f"Error al insertar tipo de servicio: {e}")
        raise HTTPException(status_code=400, detail="Error al registrar tipo de servicio")

# ── PUT /{id} ─────────────────────────────────────────────────
@router.put("/{id_tipo_servicio}")
async def actualizar_tipo_servicio(id_tipo_servicio: int, tipo: TipoServicioUpdate, conn=Depends(get_conexion)):
    consulta = """
        UPDATE tipos_servicio
        SET id_categoria = %s, nombre = %s, descripcion = %s,
            intervalo_km = %s, intervalo_dias = %s, activo = %s
        WHERE id_tipo_servicio = %s
    """
    parametros = (
        tipo.id_categoria, tipo.nombre, tipo.descripcion,
        tipo.intervalo_km, tipo.intervalo_dias, tipo.activo,
        id_tipo_servicio
    )
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Tipo de servicio actualizado exitosamente"}
    except Exception as e:
        print(f"Error al actualizar tipo de servicio: {e}")
        raise HTTPException(status_code=400, detail="Error al actualizar tipo de servicio")

# ── DELETE /{id} ──────────────────────────────────────────────
@router.delete("/{id_tipo_servicio}")
async def eliminar_tipo_servicio(id_tipo_servicio: int, conn=Depends(get_conexion)):
    consulta = "DELETE FROM tipos_servicio WHERE id_tipo_servicio = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_tipo_servicio,))
            await conn.commit()
            return {"mensaje": "Tipo de servicio eliminado exitosamente"}
    except Exception as e:
        print(f"Error al eliminar tipo de servicio: {e}")
        raise HTTPException(status_code=400, detail="Error al eliminar tipo de servicio")