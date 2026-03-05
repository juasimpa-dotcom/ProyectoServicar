from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion

router = APIRouter()

class TipoCombustible(BaseModel):
    nombre: str

class TipoCombustibleUpdate(BaseModel):
    nombre: str

@router.get("/")
async def listar_combustibles(conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM tipos_combustible")
            return await cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al listar tipos de combustible")

@router.get("/{id_combustible}")
async def obtener_combustible(id_combustible: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM tipos_combustible WHERE id_combustible = %s", (id_combustible,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Tipo de combustible no encontrado")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al obtener tipo de combustible")

@router.post("/")
async def insertar_combustible(combustible: TipoCombustible, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("INSERT INTO tipos_combustible (nombre) VALUES (%s)", (combustible.nombre,))
            await conn.commit()
            return {"mensaje": "Tipo de combustible registrado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al registrar tipo de combustible")

@router.put("/{id_combustible}")
async def actualizar_combustible(id_combustible: int, combustible: TipoCombustibleUpdate, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "UPDATE tipos_combustible SET nombre = %s WHERE id_combustible = %s",
                (combustible.nombre, id_combustible)
            )
            await conn.commit()
            return {"mensaje": "Tipo de combustible actualizado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al actualizar tipo de combustible")

@router.delete("/{id_combustible}")
async def eliminar_combustible(id_combustible: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("DELETE FROM tipos_combustible WHERE id_combustible = %s", (id_combustible,))
            await conn.commit()
            return {"mensaje": "Tipo de combustible eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al eliminar tipo de combustible")