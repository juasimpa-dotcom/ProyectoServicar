from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion

router = APIRouter()

class Marca(BaseModel):
    nombre: str
    activo: bool = True

class MarcaUpdate(BaseModel):
    nombre: str
    activo: bool

@router.get("/")
async def listar_marcas(conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM marcas")
            return await cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al listar marcas")

@router.get("/{id_marca}")
async def obtener_marca(id_marca: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM marcas WHERE id_marca = %s", (id_marca,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Marca no encontrada")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al obtener marca")

@router.post("/")
async def insertar_marca(marca: Marca, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO marcas (nombre, activo) VALUES (%s, %s)",
                (marca.nombre, marca.activo)
            )
            await conn.commit()
            return {"mensaje": "Marca registrada exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al registrar marca")

@router.put("/{id_marca}")
async def actualizar_marca(id_marca: int, marca: MarcaUpdate, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "UPDATE marcas SET nombre = %s, activo = %s WHERE id_marca = %s",
                (marca.nombre, marca.activo, id_marca)
            )
            await conn.commit()
            return {"mensaje": "Marca actualizada exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al actualizar marca")

@router.delete("/{id_marca}")
async def eliminar_marca(id_marca: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("DELETE FROM marcas WHERE id_marca = %s", (id_marca,))
            await conn.commit()
            return {"mensaje": "Marca eliminada exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al eliminar marca")