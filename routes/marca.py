from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion

router = APIRouter()

class Marca(BaseModel):
    id_marca: int
    nombre:   str
    activo:   bool = True

class MarcaUpdate(BaseModel):
    nombre: str
    activo: bool

@router.get("/")
async def listar_marcas(conn=Depends(get_conexion)):
    consulta = "SELECT * FROM marcas"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta)
            return await cursor.fetchall()
    except Exception as e:
        print(f"Error al listar marcas: {e}")
        raise HTTPException(status_code=400, detail="Error al listar marcas")

@router.get("/{id_marca}")
async def obtener_marca(id_marca: int, conn=Depends(get_conexion)):
    consulta = "SELECT * FROM marcas WHERE id_marca = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_marca,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Marca no encontrada")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al obtener marca: {e}")
        raise HTTPException(status_code=400, detail="Error al obtener marca")

@router.post("/")
async def insertar_marca(marca: Marca, conn=Depends(get_conexion)):
    consulta = "INSERT INTO marcas (id_marca, nombre, activo) VALUES (%s, %s, %s)"
    parametros = (marca.id_marca, marca.nombre, marca.activo)
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Marca registrada exitosamente"}
    except Exception as e:
        print(f"Error al insertar marca: {e}")
        raise HTTPException(status_code=400, detail="Error al registrar marca")

@router.put("/{id_marca}")
async def actualizar_marca(id_marca: int, marca: MarcaUpdate, conn=Depends(get_conexion)):
    consulta = "UPDATE marcas SET nombre = %s, activo = %s WHERE id_marca = %s"
    parametros = (marca.nombre, marca.activo, id_marca)
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Marca actualizada exitosamente"}
    except Exception as e:
        print(f"Error al actualizar marca: {e}")
        raise HTTPException(status_code=400, detail="Error al actualizar marca")

@router.delete("/{id_marca}")
async def eliminar_marca(id_marca: int, conn=Depends(get_conexion)):
    consulta = "DELETE FROM marcas WHERE id_marca = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_marca,))
            await conn.commit()
            return {"mensaje": "Marca eliminada exitosamente"}
    except Exception as e:
        print(f"Error al eliminar marca: {e}")
        raise HTTPException(status_code=400, detail="Error al eliminar marca")