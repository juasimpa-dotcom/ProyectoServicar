from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.conexionBD import get_conexion
from typing import Optional

router = APIRouter()

class Usuario(BaseModel):
    id_rol:    int
    nombres:   str
    apellidos: str
    email:     str
    telefono:  Optional[str] = None
    activo:    bool = True

class UsuarioUpdate(BaseModel):
    id_rol:    int
    nombres:   str
    apellidos: str
    email:     str
    telefono:  Optional[str] = None
    activo:    bool

@router.get("/")
async def listar_usuarios(conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM usuarios")
            return await cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al listar usuarios")

@router.get("/{id_usuario}")
async def obtener_usuario(id_usuario: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM usuarios WHERE id_usuario = %s", (id_usuario,))
            resultado = await cursor.fetchone()
            if resultado is None:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al obtener usuario")

@router.post("/")
async def insertar_usuario(usuario: Usuario, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO usuarios (id_rol, nombres, apellidos, email, telefono, activo) VALUES (%s, %s, %s, %s, %s, %s)",
                (usuario.id_rol, usuario.nombres, usuario.apellidos, usuario.email, usuario.telefono, usuario.activo)
            )
            await conn.commit()
            return {"mensaje": "Usuario registrado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al registrar usuario")

@router.put("/{id_usuario}")
async def actualizar_usuario(id_usuario: int, usuario: UsuarioUpdate, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "UPDATE usuarios SET id_rol=%s, nombres=%s, apellidos=%s, email=%s, telefono=%s, activo=%s WHERE id_usuario=%s",
                (usuario.id_rol, usuario.nombres, usuario.apellidos, usuario.email, usuario.telefono, usuario.activo, id_usuario)
            )
            await conn.commit()
            return {"mensaje": "Usuario actualizado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error al actualizar usuario")

@router.delete("/{id_usuario}")
async def eliminar_usuario(id_usuario: int, conn=Depends(get_conexion)):
    try:
        async with conn.cursor() as cursor:
            await cursor.execute("DELETE FROM usuarios WHERE id_usuario = %s", (id_usuario,))
            await conn.commit()
            return {"mensaje": "Usuario eliminado exitosamente"}
    except Exception as e:
        print (e)
        raise HTTPException(status_code=400, detail="Error al eliminar usuario")