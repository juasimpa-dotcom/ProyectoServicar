from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion
from typing import Optional

router = APIRouter()

class TipoServicio(BaseModel):
    id_categoria:   int
    nombre:         str
    descripcion:    Optional[str] = None
    intervalo_km:   Optional[int] = None
    intervalo_dias: Optional[int] = None
    activo:         bool = True

class TipoServicioUpdate(BaseModel):
    id_categoria:   int
    nombre:         str
    descripcion:    Optional[str] = None
    intervalo_km:   Optional[int] = None
    intervalo_dias: Optional[int] = None
    activo:         bool

@router.get("/")
async def listar_tipos_servicio(conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM tipos_servicio")
            return await cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al listar tipos de servicio")

@router.get("/{id_tipo_servicio}")
async def obtener_tipo_servicio(id_tipo_servicio: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM tipos_servicio WHERE id_tipo_servicio = %s", (id_tipo_servicio,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Tipo de servicio no encontrado")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al obtener tipo de servicio")

@router.get("/categoria/{id_categoria}")
async def tipos_por_categoria(id_categoria: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM tipos_servicio WHERE id_categoria = %s", (id_categoria,))
            return await cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al filtrar tipos de servicio")

@router.post("/")
async def insertar_tipo_servicio(ts: TipoServicio, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO tipos_servicio (id_categoria, nombre, descripcion, intervalo_km, intervalo_dias, activo) VALUES (%s, %s, %s, %s, %s, %s)",
                (ts.id_categoria, ts.nombre, ts.descripcion, ts.intervalo_km, ts.intervalo_dias, ts.activo)
            )
            await conn.commit()
            return {"mensaje": "Tipo de servicio registrado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al registrar tipo de servicio")

@router.put("/{id_tipo_servicio}")
async def actualizar_tipo_servicio(id_tipo_servicio: int, ts: TipoServicioUpdate, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "UPDATE tipos_servicio SET id_categoria=%s, nombre=%s, descripcion=%s, intervalo_km=%s, intervalo_dias=%s, activo=%s WHERE id_tipo_servicio=%s",
                (ts.id_categoria, ts.nombre, ts.descripcion, ts.intervalo_km, ts.intervalo_dias, ts.activo, id_tipo_servicio)
            )
            await conn.commit()
            return {"mensaje": "Tipo de servicio actualizado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al actualizar tipo de servicio")

@router.delete("/{id_tipo_servicio}")
async def eliminar_tipo_servicio(id_tipo_servicio: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("DELETE FROM tipos_servicio WHERE id_tipo_servicio = %s", (id_tipo_servicio,))
            await conn.commit()
            return {"mensaje": "Tipo de servicio eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al eliminar tipo de servicio")