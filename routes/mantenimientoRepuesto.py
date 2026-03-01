from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion

router = APIRouter()

class MantenimientoRepuesto(BaseModel):
    id:               int
    id_mantenimiento: int
    id_repuesto:      int
    cantidad:         float
    precio_unitario:  float

class MantenimientoRepuestoUpdate(BaseModel):
    cantidad:        float
    precio_unitario: float

@router.get("/")
async def listar(conn=Depends(get_conexion)):
    consulta = "SELECT * FROM mantenimiento_repuestos"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta)
            return await cursor.fetchall()
    except Exception as e:
        print(f"Error al listar: {e}")
        raise HTTPException(status_code=400, detail="Error al listar mantenimiento_repuestos")

@router.get("/{id}")
async def obtener(id: int, conn=Depends(get_conexion)):
    consulta = "SELECT * FROM mantenimiento_repuestos WHERE id = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Registro no encontrado")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al obtener: {e}")
        raise HTTPException(status_code=400, detail="Error al obtener registro")

@router.get("/mantenimiento/{id_mantenimiento}")
async def repuestos_por_mantenimiento(id_mantenimiento: int, conn=Depends(get_conexion)):
    consulta = "SELECT * FROM mantenimiento_repuestos WHERE id_mantenimiento = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_mantenimiento,))
            return await cursor.fetchall()
    except Exception as e:
        print(f"Error al filtrar por mantenimiento: {e}")
        raise HTTPException(status_code=400, detail="Error al obtener repuestos del mantenimiento")

@router.post("/")
async def insertar(mr: MantenimientoRepuesto, conn=Depends(get_conexion)):
    consulta = """
        INSERT INTO mantenimiento_repuestos (id, id_mantenimiento, id_repuesto, cantidad, precio_unitario)
        VALUES (%s, %s, %s, %s, %s)
    """
    parametros = (mr.id, mr.id_mantenimiento, mr.id_repuesto, mr.cantidad, mr.precio_unitario)
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Repuesto agregado al mantenimiento exitosamente"}
    except Exception as e:
        print(f"Error al insertar: {e}")
        raise HTTPException(status_code=400, detail="Error al agregar repuesto al mantenimiento")

@router.put("/{id}")
async def actualizar(id: int, mr: MantenimientoRepuestoUpdate, conn=Depends(get_conexion)):
    consulta = """
        UPDATE mantenimiento_repuestos
        SET cantidad = %s, precio_unitario = %s
        WHERE id = %s
    """
    parametros = (mr.cantidad, mr.precio_unitario, id)
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Registro actualizado exitosamente"}
    except Exception as e:
        print(f"Error al actualizar: {e}")
        raise HTTPException(status_code=400, detail="Error al actualizar registro")

@router.delete("/{id}")
async def eliminar(id: int, conn=Depends(get_conexion)):
    consulta = "DELETE FROM mantenimiento_repuestos WHERE id = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id,))
            await conn.commit()
            return {"mensaje": "Registro eliminado exitosamente"}
    except Exception as e:
        print(f"Error al eliminar: {e}")
        raise HTTPException(status_code=400, detail="Error al eliminar registro")