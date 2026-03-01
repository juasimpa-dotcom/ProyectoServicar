from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion

router = APIRouter()

class Modelo(BaseModel):
    id_modelo: int
    id_marca:  int
    nombre:    str
    activo:    bool = True

class ModeloUpdate(BaseModel):
    id_marca: int
    nombre:   str
    activo:   bool

@router.get("/")
async def listar_modelos(conn=Depends(get_conexion)):
    consulta = "SELECT * FROM modelos"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta)
            return await cursor.fetchall()
    except Exception as e:
        print(f"Error al listar modelos: {e}")
        raise HTTPException(status_code=400, detail="Error al listar modelos")

@router.get("/{id_modelo}")
async def obtener_modelo(id_modelo: int, conn=Depends(get_conexion)):
    consulta = "SELECT * FROM modelos WHERE id_modelo = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_modelo,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Modelo no encontrado")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al obtener modelo: {e}")
        raise HTTPException(status_code=400, detail="Error al obtener modelo")

@router.get("/marca/{id_marca}")
async def modelos_por_marca(id_marca: int, conn=Depends(get_conexion)):
    consulta = "SELECT * FROM modelos WHERE id_marca = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_marca,))
            return await cursor.fetchall()
    except Exception as e:
        print(f"Error al filtrar modelos por marca: {e}")
        raise HTTPException(status_code=400, detail="Error al obtener modelos de la marca")

@router.post("/")
async def insertar_modelo(modelo: Modelo, conn=Depends(get_conexion)):
    consulta = "INSERT INTO modelos (id_modelo, id_marca, nombre, activo) VALUES (%s, %s, %s, %s)"
    parametros = (modelo.id_modelo, modelo.id_marca, modelo.nombre, modelo.activo)
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Modelo registrado exitosamente"}
    except Exception as e:
        print(f"Error al insertar modelo: {e}")
        raise HTTPException(status_code=400, detail="Error al registrar modelo")

@router.put("/{id_modelo}")
async def actualizar_modelo(id_modelo: int, modelo: ModeloUpdate, conn=Depends(get_conexion)):
    consulta = "UPDATE modelos SET id_marca = %s, nombre = %s, activo = %s WHERE id_modelo = %s"
    parametros = (modelo.id_marca, modelo.nombre, modelo.activo, id_modelo)
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Modelo actualizado exitosamente"}
    except Exception as e:
        print(f"Error al actualizar modelo: {e}")
        raise HTTPException(status_code=400, detail="Error al actualizar modelo")

@router.delete("/{id_modelo}")
async def eliminar_modelo(id_modelo: int, conn=Depends(get_conexion)):
    consulta = "DELETE FROM modelos WHERE id_modelo = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_modelo,))
            await conn.commit()
            return {"mensaje": "Modelo eliminado exitosamente"}
    except Exception as e:
        print(f"Error al eliminar modelo: {e}")
        raise HTTPException(status_code=400, detail="Error al eliminar modelo")