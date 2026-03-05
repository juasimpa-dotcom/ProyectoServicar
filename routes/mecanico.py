from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion
from typing import Optional

router = APIRouter()

class Mecanico(BaseModel):
    id_usuario:   Optional[int] = None
    nombres:      str
    apellidos:    str
    especialidad: Optional[str] = None
    telefono:     Optional[str] = None
    activo:       bool = True

class MecanicoUpdate(BaseModel):
    id_usuario:   Optional[int] = None
    nombres:      str
    apellidos:    str
    especialidad: Optional[str] = None
    telefono:     Optional[str] = None
    activo:       bool

@router.get("/")
async def listar_mecanicos(conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM mecanicos")
            return await cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al listar mecánicos")

@router.get("/{id_mecanico}")
async def obtener_mecanico(id_mecanico: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM mecanicos WHERE id_mecanico = %s", (id_mecanico,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Mecánico no encontrado")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al obtener mecánico")

@router.post("/")
async def insertar_mecanico(mecanico: Mecanico, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO mecanicos (id_usuario, nombres, apellidos, especialidad, telefono, activo) VALUES (%s, %s, %s, %s, %s, %s)",
                (mecanico.id_usuario, mecanico.nombres, mecanico.apellidos, mecanico.especialidad, mecanico.telefono, mecanico.activo)
            )
            await conn.commit()
            return {"mensaje": "Mecánico registrado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al registrar mecánico")

@router.put("/{id_mecanico}")
async def actualizar_mecanico(id_mecanico: int, mecanico: MecanicoUpdate, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "UPDATE mecanicos SET id_usuario=%s, nombres=%s, apellidos=%s, especialidad=%s, telefono=%s, activo=%s WHERE id_mecanico=%s",
                (mecanico.id_usuario, mecanico.nombres, mecanico.apellidos, mecanico.especialidad, mecanico.telefono, mecanico.activo, id_mecanico)
            )
            await conn.commit()
            return {"mensaje": "Mecánico actualizado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al actualizar mecánico")

@router.delete("/{id_mecanico}")
async def eliminar_mecanico(id_mecanico: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("DELETE FROM mecanicos WHERE id_mecanico = %s", (id_mecanico,))
            await conn.commit()
            return {"mensaje": "Mecánico eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al eliminar mecánico")