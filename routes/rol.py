from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion
from typing import Optional

router = APIRouter()

class Rol(BaseModel):
    nombre:      str
    descripcion: Optional[str] = None
    activo:      bool = True

class RolUpdate(BaseModel):
    nombre:      str
    descripcion: Optional[str] = None
    activo:      bool

@router.get("/")
async def listar_roles(conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM roles")
            return await cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al listar roles")

@router.get("/{id_rol}")
async def obtener_rol(id_rol: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM roles WHERE id_rol = %s", (id_rol,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Rol no encontrado")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al obtener rol")

@router.post("/")
async def insertar_rol(rol: Rol, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO roles (nombre, descripcion, activo) VALUES (%s, %s, %s)",
                (rol.nombre, rol.descripcion, rol.activo)
            )
            await conn.commit()
            return {"mensaje": "Rol registrado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al registrar rol")

@router.put("/{id_rol}")
async def actualizar_rol(id_rol: int, rol: RolUpdate, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "UPDATE roles SET nombre = %s, descripcion = %s, activo = %s WHERE id_rol = %s",
                (rol.nombre, rol.descripcion, rol.activo, id_rol)
            )
            await conn.commit()
            return {"mensaje": "Rol actualizado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al actualizar rol")

@router.delete("/{id_rol}")
async def eliminar_rol(id_rol: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("DELETE FROM roles WHERE id_rol = %s", (id_rol,))
            await conn.commit()
            return {"mensaje": "Rol eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al eliminar rol")