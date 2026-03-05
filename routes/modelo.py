from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion

router = APIRouter()

class Modelo(BaseModel):
    id_marca: int
    nombre:   str
    activo:   bool = True

class ModeloUpdate(BaseModel):
    id_marca: int
    nombre:   str
    activo:   bool

@router.get("/")
async def listar_modelos(conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM modelos")
            return await cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al listar modelos")

@router.get("/{id_modelo}")
async def obtener_modelo(id_modelo: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM modelos WHERE id_modelo = %s", (id_modelo,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Modelo no encontrado")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al obtener modelo")

@router.get("/marca/{id_marca}")
async def modelos_por_marca(id_marca: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM modelos WHERE id_marca = %s", (id_marca,))
            return await cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al obtener modelos de la marca")

@router.post("/")
async def insertar_modelo(modelo: Modelo, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO modelos (id_marca, nombre, activo) VALUES (%s, %s, %s)",
                (modelo.id_marca, modelo.nombre, modelo.activo)
            )
            await conn.commit()
            return {"mensaje": "Modelo registrado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al registrar modelo")

@router.put("/{id_modelo}")
async def actualizar_modelo(id_modelo: int, modelo: ModeloUpdate, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "UPDATE modelos SET id_marca = %s, nombre = %s, activo = %s WHERE id_modelo = %s",
                (modelo.id_marca, modelo.nombre, modelo.activo, id_modelo)
            )
            await conn.commit()
            return {"mensaje": "Modelo actualizado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al actualizar modelo")

@router.delete("/{id_modelo}")
async def eliminar_modelo(id_modelo: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("DELETE FROM modelos WHERE id_modelo = %s", (id_modelo,))
            await conn.commit()
            return {"mensaje": "Modelo eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al eliminar modelo")