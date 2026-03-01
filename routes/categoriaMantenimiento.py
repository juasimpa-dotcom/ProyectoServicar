from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion
from typing import Optional

router = APIRouter()

class CategoriaMantenimiento(BaseModel):
    id_categoria: int
    nombre:       str
    descripcion:  Optional[str] = None
    activo:       bool = True

class CategoriaMantenimientoUpdate(BaseModel):
    nombre:      str
    descripcion: Optional[str] = None
    activo:      bool

@router.get("/")
async def listar_categorias(conn=Depends(get_conexion)):
    consulta = "SELECT * FROM categorias_mantenimiento"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta)
            return await cursor.fetchall()
    except Exception as e:
        print(f"Error al listar categorías: {e}")
        raise HTTPException(status_code=400, detail="Error al listar categorías de mantenimiento")

@router.get("/{id_categoria}")
async def obtener_categoria(id_categoria: int, conn=Depends(get_conexion)):
    consulta = "SELECT * FROM categorias_mantenimiento WHERE id_categoria = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_categoria,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Categoría no encontrada")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al obtener categoría: {e}")
        raise HTTPException(status_code=400, detail="Error al obtener categoría")

@router.post("/")
async def insertar_categoria(categoria: CategoriaMantenimiento, conn=Depends(get_conexion)):
    consulta = "INSERT INTO categorias_mantenimiento (id_categoria, nombre, descripcion, activo) VALUES (%s, %s, %s, %s)"
    parametros = (categoria.id_categoria, categoria.nombre, categoria.descripcion, categoria.activo)
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Categoría registrada exitosamente"}
    except Exception as e:
        print(f"Error al insertar categoría: {e}")
        raise HTTPException(status_code=400, detail="Error al registrar categoría")

@router.put("/{id_categoria}")
async def actualizar_categoria(id_categoria: int, categoria: CategoriaMantenimientoUpdate, conn=Depends(get_conexion)):
    consulta = "UPDATE categorias_mantenimiento SET nombre = %s, descripcion = %s, activo = %s WHERE id_categoria = %s"
    parametros = (categoria.nombre, categoria.descripcion, categoria.activo, id_categoria)
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Categoría actualizada exitosamente"}
    except Exception as e:
        print(f"Error al actualizar categoría: {e}")
        raise HTTPException(status_code=400, detail="Error al actualizar categoría")

@router.delete("/{id_categoria}")
async def eliminar_categoria(id_categoria: int, conn=Depends(get_conexion)):
    consulta = "DELETE FROM categorias_mantenimiento WHERE id_categoria = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_categoria,))
            await conn.commit()
            return {"mensaje": "Categoría eliminada exitosamente"}
    except Exception as e:
        print(f"Error al eliminar categoría: {e}")
        raise HTTPException(status_code=400, detail="Error al eliminar categoría")