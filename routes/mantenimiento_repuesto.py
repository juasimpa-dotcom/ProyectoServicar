from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion

router = APIRouter()

class MantenimientoRepuesto(BaseModel):
    id_mantenimiento: int
    id_repuesto:      int
    cantidad:         float
    precio_unitario:  float

class MantenimientoRepuestoUpdate(BaseModel):
    cantidad:        float
    precio_unitario: float

@router.get("/")
async def listar(conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM mantenimiento_repuestos")
            return await cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al listar mantenimiento_repuestos")

@router.get("/{id}")
async def obtener(id: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM mantenimiento_repuestos WHERE id = %s", (id,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Registro no encontrado")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al obtener registro")

@router.get("/mantenimiento/{id_mantenimiento}")
async def repuestos_por_mantenimiento(id_mantenimiento: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM mantenimiento_repuestos WHERE id_mantenimiento = %s", (id_mantenimiento,))
            return await cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al obtener repuestos del mantenimiento")

@router.post("/")
async def insertar(mr: MantenimientoRepuesto, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO mantenimiento_repuestos (id_mantenimiento, id_repuesto, cantidad, precio_unitario) VALUES (%s, %s, %s, %s)",
                (mr.id_mantenimiento, mr.id_repuesto, mr.cantidad, mr.precio_unitario)
            )
            await conn.commit()
            return {"mensaje": "Repuesto agregado al mantenimiento exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al agregar repuesto al mantenimiento")

@router.put("/{id}")
async def actualizar(id: int, mr: MantenimientoRepuestoUpdate, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "UPDATE mantenimiento_repuestos SET cantidad = %s, precio_unitario = %s WHERE id = %s",
                (mr.cantidad, mr.precio_unitario, id)
            )
            await conn.commit()
            return {"mensaje": "Registro actualizado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al actualizar registro")

@router.delete("/{id}")
async def eliminar(id: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("DELETE FROM mantenimiento_repuestos WHERE id = %s", (id,))
            await conn.commit()
            return {"mensaje": "Registro eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al eliminar registro")