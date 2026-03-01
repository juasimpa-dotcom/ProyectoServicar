from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion

router = APIRouter()

class TipoCombustible(BaseModel):
    id_combustible: int
    nombre:         str

class TipoCombustibleUpdate(BaseModel):
    nombre: str

@router.get("/")
async def listar_combustibles(conn=Depends(get_conexion)):
    consulta = "SELECT * FROM tipos_combustible"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta)
            return await cursor.fetchall()
    except Exception as e:
        print(f"Error al listar combustibles: {e}")
        raise HTTPException(status_code=400, detail="Error al listar tipos de combustible")

@router.get("/{id_combustible}")
async def obtener_combustible(id_combustible: int, conn=Depends(get_conexion)):
    consulta = "SELECT * FROM tipos_combustible WHERE id_combustible = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_combustible,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Tipo de combustible no encontrado")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al obtener combustible: {e}")
        raise HTTPException(status_code=400, detail="Error al obtener tipo de combustible")

@router.post("/")
async def insertar_combustible(combustible: TipoCombustible, conn=Depends(get_conexion)):
    consulta = "INSERT INTO tipos_combustible (id_combustible, nombre) VALUES (%s, %s)"
    parametros = (combustible.id_combustible, combustible.nombre)
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Tipo de combustible registrado exitosamente"}
    except Exception as e:
        print(f"Error al insertar combustible: {e}")
        raise HTTPException(status_code=400, detail="Error al registrar tipo de combustible")

@router.put("/{id_combustible}")
async def actualizar_combustible(id_combustible: int, combustible: TipoCombustibleUpdate, conn=Depends(get_conexion)):
    consulta = "UPDATE tipos_combustible SET nombre = %s WHERE id_combustible = %s"
    parametros = (combustible.nombre, id_combustible)
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Tipo de combustible actualizado exitosamente"}
    except Exception as e:
        print(f"Error al actualizar combustible: {e}")
        raise HTTPException(status_code=400, detail="Error al actualizar tipo de combustible")

@router.delete("/{id_combustible}")
async def eliminar_combustible(id_combustible: int, conn=Depends(get_conexion)):
    consulta = "DELETE FROM tipos_combustible WHERE id_combustible = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_combustible,))
            await conn.commit()
            return {"mensaje": "Tipo de combustible eliminado exitosamente"}
    except Exception as e:
        print(f"Error al eliminar combustible: {e}")
        raise HTTPException(status_code=400, detail="Error al eliminar tipo de combustible")