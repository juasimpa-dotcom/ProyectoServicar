from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion
from typing import Optional

router = APIRouter()

class Repuesto(BaseModel):
    id_repuesto:     int
    codigo:          Optional[str] = None
    nombre:          str
    marca_repuesto:  Optional[str] = None
    unidad_medida:   str = "unidad"
    precio_unitario: Optional[float] = None
    activo:          bool = True

class RepuestoUpdate(BaseModel):
    codigo:          Optional[str] = None
    nombre:          str
    marca_repuesto:  Optional[str] = None
    unidad_medida:   str
    precio_unitario: Optional[float] = None
    activo:          bool

@router.get("/")
async def listar_repuestos(conn=Depends(get_conexion)):
    consulta = "SELECT * FROM repuestos"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta)
            return await cursor.fetchall()
    except Exception as e:
        print(f"Error al listar repuestos: {e}")
        raise HTTPException(status_code=400, detail="Error al listar repuestos")

@router.get("/{id_repuesto}")
async def obtener_repuesto(id_repuesto: int, conn=Depends(get_conexion)):
    consulta = "SELECT * FROM repuestos WHERE id_repuesto = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_repuesto,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Repuesto no encontrado")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al obtener repuesto: {e}")
        raise HTTPException(status_code=400, detail="Error al obtener repuesto")

@router.post("/")
async def insertar_repuesto(repuesto: Repuesto, conn=Depends(get_conexion)):
    consulta = """
        INSERT INTO repuestos (id_repuesto, codigo, nombre, marca_repuesto, unidad_medida, precio_unitario, activo)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    parametros = (
        repuesto.id_repuesto, repuesto.codigo, repuesto.nombre,
        repuesto.marca_repuesto, repuesto.unidad_medida,
        repuesto.precio_unitario, repuesto.activo
    )
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Repuesto registrado exitosamente"}
    except Exception as e:
        print(f"Error al insertar repuesto: {e}")
        raise HTTPException(status_code=400, detail="Error al registrar repuesto")

@router.put("/{id_repuesto}")
async def actualizar_repuesto(id_repuesto: int, repuesto: RepuestoUpdate, conn=Depends(get_conexion)):
    consulta = """
        UPDATE repuestos
        SET codigo = %s, nombre = %s, marca_repuesto = %s,
            unidad_medida = %s, precio_unitario = %s, activo = %s
        WHERE id_repuesto = %s
    """
    parametros = (
        repuesto.codigo, repuesto.nombre, repuesto.marca_repuesto,
        repuesto.unidad_medida, repuesto.precio_unitario,
        repuesto.activo, id_repuesto
    )
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, parametros)
            await conn.commit()
            return {"mensaje": "Repuesto actualizado exitosamente"}
    except Exception as e:
        print(f"Error al actualizar repuesto: {e}")
        raise HTTPException(status_code=400, detail="Error al actualizar repuesto")

@router.delete("/{id_repuesto}")
async def eliminar_repuesto(id_repuesto: int, conn=Depends(get_conexion)):
    consulta = "DELETE FROM repuestos WHERE id_repuesto = %s"
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(consulta, (id_repuesto,))
            await conn.commit()
            return {"mensaje": "Repuesto eliminado exitosamente"}
    except Exception as e:
        print(f"Error al eliminar repuesto: {e}")
        raise HTTPException(status_code=400, detail="Error al eliminar repuesto")