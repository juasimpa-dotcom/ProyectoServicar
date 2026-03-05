from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion
from typing import Optional

router = APIRouter()

class CategoriaMantenimiento(BaseModel):
    nombre:      str
    descripcion: Optional[str] = None
    activo:      bool = True

class CategoriaMantenimientoUpdate(BaseModel):
    nombre:      str
    descripcion: Optional[str] = None
    activo:      bool

@router.get("/")
async def listar_categorias(conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM categorias_mantenimiento")
            return await cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al listar categorías")

@router.get("/{id_categoria}")
async def obtener_categoria(id_categoria: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM categorias_mantenimiento WHERE id_categoria = %s", (id_categoria,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Categoría no encontrada")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al obtener categoría")

@router.post("/")
async def insertar_categoria(categoria: CategoriaMantenimiento, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO categorias_mantenimiento (nombre, descripcion, activo) VALUES (%s, %s, %s)",
                (categoria.nombre, categoria.descripcion, categoria.activo)
            )
            await conn.commit()
            return {"mensaje": "Categoría registrada exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al registrar categoría")

@router.put("/{id_categoria}")
async def actualizar_categoria(id_categoria: int, categoria: CategoriaMantenimientoUpdate, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "UPDATE categorias_mantenimiento SET nombre = %s, descripcion = %s, activo = %s WHERE id_categoria = %s",
                (categoria.nombre, categoria.descripcion, categoria.activo, id_categoria)
            )
            await conn.commit()
            return {"mensaje": "Categoría actualizada exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al actualizar categoría")

@router.delete("/{id_categoria}")
async def eliminar_categoria(id_categoria: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("DELETE FROM categorias_mantenimiento WHERE id_categoria = %s", (id_categoria,))
            await conn.commit()
            return {"mensaje": "Categoría eliminada exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al eliminar categoría")