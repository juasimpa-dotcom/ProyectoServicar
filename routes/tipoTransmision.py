from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion

router = APIRouter()

class TipoTransmision(BaseModel):
    id_transmision: int
    nombre:         str

class TipoTransmisionUpdate(BaseModel):
    nombre: str

@router.get("/")
async def listar_transmisiones(conn=Depends(get_conexion)):
    consulta = "SELECT * FROM tipos_transmision"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta)
            return await cursor.fetchall()
    except Exception as e:
        print(f"Error al listar transmisiones: {e}")
        raise HTTPException(status_code=400, detail="Error al listar tipos de transmisión")

@router.get("/{id_transmision}")
async def obtener_transmision(id_transmision: int, conn=Depends(get_conexion)):
    consulta = "SELECT * FROM tipos_transmision WHERE id_transmision = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_transmision,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Tipo de transmisión no encontrado")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al obtener transmisión: {e}")
        raise HTTPException(status_code=400, detail="Error al obtener tipo de transmisión")

@router.post("/")
async def insertar_transmision(transmision: TipoTransmision, conn=Depends(get_conexion)):
    consulta = "INSERT INTO tipos_transmision (id_transmision, nombre) VALUES (%s, %s)"
    parametros = (transmision.id_transmision, transmision.nombre)
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Tipo de transmisión registrado exitosamente"}
    except Exception as e:
        print(f"Error al insertar transmisión: {e}")
        raise HTTPException(status_code=400, detail="Error al registrar tipo de transmisión")

@router.put("/{id_transmision}")
async def actualizar_transmision(id_transmision: int, transmision: TipoTransmisionUpdate, conn=Depends(get_conexion)):
    consulta = "UPDATE tipos_transmision SET nombre = %s WHERE id_transmision = %s"
    parametros = (transmision.nombre, id_transmision)
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Tipo de transmisión actualizado exitosamente"}
    except Exception as e:
        print(f"Error al actualizar transmisión: {e}")
        raise HTTPException(status_code=400, detail="Error al actualizar tipo de transmisión")

@router.delete("/{id_transmision}")
async def eliminar_transmision(id_transmision: int, conn=Depends(get_conexion)):
    consulta = "DELETE FROM tipos_transmision WHERE id_transmision = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_transmision,))
            await conn.commit()
            return {"mensaje": "Tipo de transmisión eliminado exitosamente"}
    except Exception as e:
        print(f"Error al eliminar transmisión: {e}")
        raise HTTPException(status_code=400, detail="Error al eliminar tipo de transmisión")