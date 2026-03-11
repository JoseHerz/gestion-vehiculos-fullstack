import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import api from '../api/api';

const Usuarios = () => {
    // Estados principales
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    
    // Estados para Diálogos
    const [displayAddDialog, setDisplayAddDialog] = useState(false);
    const [displayEditDialog, setDisplayEditDialog] = useState(false);
    
    // Modelos de datos
    const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', username: '', password: '', rol: 'USER' });
    const [usuarioEditado, setUsuarioEditado] = useState({ id: null, nombre: '', username: '', rol: '' });

    const roles = [
        { label: 'Administrador', value: 'ADMIN' },
        { label: 'Usuario', value: 'USER' }
    ];

    // Control de sesión
    const usuarioSesion = JSON.parse(localStorage.getItem('usuario') || '{}');
    const esAdmin = (usuarioSesion.rol || '').toUpperCase() === 'ADMIN' || (usuarioSesion.username || '').toLowerCase() === 'admin';

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            const res = await api.get('/usuarios');
            setUsuarios(res.data);
        } catch (err) {
            console.error("Error al cargar lista de usuarios:", err);
        } finally {
            setLoading(false);
        }
    };

    const validarFormatoUsername = (username) => {
        // Validación: Solo letras minúsculas, sin espacios, y guion bajo para separar (ejemplo: jose_hernandez)
        const usernameRegex = /^[a-z]+(_[a-z]+)+$/;
        
        if (username.includes(' ')) {
            alert("Error: El nombre de usuario no puede contener espacios en blanco.");
            return false;
        }
        
        if (!usernameRegex.test(username)) {
            alert("Error: El usuario debe estar en minúsculas y usar guion bajo para separar, con el formato 'nombre_apellido' (ejemplo: jose_hernandez).");
            return false;
        }

        return true;
    };

    const guardarUsuario = async () => {
        if (!nuevoUsuario.nombre.trim() || !nuevoUsuario.username.trim() || !nuevoUsuario.password.trim()) {
            alert("Error: Todos los campos son obligatorios.");
            return;
        }

        if (!validarFormatoUsername(nuevoUsuario.username)) {
            return;
        }

        try {
            await api.post('/auth/register', nuevoUsuario);
            setDisplayAddDialog(false);
            setNuevoUsuario({ nombre: '', username: '', password: '', rol: 'USER' });
            cargarUsuarios();
        } catch (err) {
            console.error("Error al guardar:", err);
            const msg = err.response?.data?.message || "Error al conectar con el servidor";
            alert(msg);
        }
    };

    const actualizarUsuario = async () => {
        if (!usuarioEditado.nombre?.trim() || !usuarioEditado.username?.trim()) {
            alert("El nombre y el usuario no pueden estar vacíos.");
            return;
        }

        if (!validarFormatoUsername(usuarioEditado.username)) {
            return;
        }

        try {
            await api.put(`/usuarios/${usuarioEditado.id}`, {
                nombre: usuarioEditado.nombre,
                username: usuarioEditado.username,
                rol: usuarioEditado.rol
            });
            setDisplayEditDialog(false);
            cargarUsuarios();
        } catch (err) {
            console.error("Error al actualizar:", err);
            alert("No se pudo actualizar el usuario.");
        }
    };

    const eliminarUsuario = async (id) => {
        if (window.confirm("¿Confirmas la eliminación de este usuario?")) {
            try {
                await api.delete(`/usuarios/${id}`);
                cargarUsuarios();
            } catch (err) {
                console.error("Error al eliminar:", err);
            }
        }
    };

    const header = (
        <div className="flex justify-content-between align-items-center">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText 
                    type="search" 
                    onInput={(e) => setGlobalFilter(e.target.value)} 
                    placeholder="Buscar por nombre..." 
                />
            </span>
            {esAdmin && (
                <Button 
                    label="Nuevo Usuario" 
                    icon="pi pi-user-plus" 
                    className="p-button-success border-round-lg shadow-2" 
                    onClick={() => setDisplayAddDialog(true)} 
                />
            )}
        </div>
    );

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2">
                <Button 
                    icon="pi pi-pencil" 
                    className="p-button-rounded p-button-text p-button-info" 
                    onClick={() => {
                        setUsuarioEditado({ ...rowData });
                        setDisplayEditDialog(true);
                    }} 
                />
                <Button 
                    icon="pi pi-trash" 
                    className="p-button-rounded p-button-text p-button-danger" 
                    onClick={() => eliminarUsuario(rowData.id)} 
                    disabled={rowData.username === usuarioSesion.username}
                />
            </div>
        );
    };

    return (
        <div className="p-4">
            <div className="surface-card p-4 shadow-2 border-round">
                <h2 className="text-blue-700 mb-4">
                    <i className="pi pi-users mr-2" />Gestión de Usuarios
                </h2>

                <DataTable 
                    value={usuarios} 
                    paginator 
                    rows={10} 
                    header={header} 
                    loading={loading}
                    globalFilter={globalFilter}
                    emptyMessage="No hay usuarios registrados."
                    showGridlines
                    className="p-datatable-sm"
                >
                    <Column field="nombre" header="Nombre" sortable />
                    <Column field="username" header="Usuario" sortable />
                    <Column 
                        field="rol" 
                        header="Rol" 
                        body={(rowData) => (
                            <Tag 
                                value={rowData.rol?.toUpperCase()} 
                                severity={rowData.rol?.toUpperCase() === 'ADMIN' ? 'danger' : 'info'} 
                            />
                        )} 
                        sortable 
                    />
                    <Column 
                        field="creado_at" 
                        header="Fecha Registro" 
                        body={(rowData) => new Date(rowData.creado_at).toLocaleString()} 
                        sortable 
                    />
                    
                    {esAdmin && (
                        <Column header="Acciones" body={actionBodyTemplate} style={{ minWidth: '8rem', textAlign: 'center' }} />
                    )}
                </DataTable>

                {/* Modal Añadir */}
                <Dialog 
                    header="Registrar Usuario" 
                    visible={displayAddDialog} 
                    style={{ width: '30vw' }} 
                    breakpoints={{'960px': '75vw', '641px': '90vw'}}
                    modal 
                    onHide={() => setDisplayAddDialog(false)}
                    footer={
                        <div>
                            <Button label="Cancelar" onClick={() => setDisplayAddDialog(false)} className="p-button-text" />
                            <Button label="Guardar" icon="pi pi-save" onClick={guardarUsuario} className="p-button-success" />
                        </div>
                    }
                >
                    <div className="flex flex-column gap-3 mt-2">
                        <div className="field">
                            <label className="block mb-2">Nombre Completo</label>
                            <InputText className="w-full" value={nuevoUsuario.nombre} onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})} />
                        </div>
                        <div className="field">
                            <label className="block mb-2">Nombre de Usuario</label>
                            <InputText className="w-full" value={nuevoUsuario.username} onChange={(e) => setNuevoUsuario({...nuevoUsuario, username: e.target.value})} />
                        </div>
                        <div className="field">
                            <label className="block mb-2">Contraseña</label>
                            <InputText className="w-full" type="password" value={nuevoUsuario.password} onChange={(e) => setNuevoUsuario({...nuevoUsuario, password: e.target.value})} />
                        </div>
                        <div className="field">
                            <label className="block mb-2">Rol</label>
                            <Dropdown className="w-full" options={roles} value={nuevoUsuario.rol} onChange={(e) => setNuevoUsuario({...nuevoUsuario, rol: e.value})} />
                        </div>
                    </div>
                </Dialog>

                {/* Modal Editar */}
                <Dialog 
                    header="Actualizar Perfil" 
                    visible={displayEditDialog} 
                    style={{ width: '30vw' }} 
                    breakpoints={{'960px': '75vw', '641px': '90vw'}}
                    modal 
                    onHide={() => setDisplayEditDialog(false)}
                    footer={
                        <div>
                            <Button label="Cancelar" onClick={() => setDisplayEditDialog(false)} className="p-button-text" />
                            <Button label="Actualizar" icon="pi pi-refresh" onClick={actualizarUsuario} className="p-button-info" />
                        </div>
                    }
                >
                    <div className="flex flex-column gap-3 mt-2">
                        <div className="field">
                            <label className="block mb-2">Nombre</label>
                            <InputText className="w-full" value={usuarioEditado.nombre || ''} onChange={(e) => setUsuarioEditado({...usuarioEditado, nombre: e.target.value})} />
                        </div>
                        <div className="field">
                            <label className="block mb-2">Usuario</label>
                            <InputText className="w-full" value={usuarioEditado.username || ''} onChange={(e) => setUsuarioEditado({...usuarioEditado, username: e.target.value})} />
                        </div>
                        <div className="field">
                            <label className="block mb-2">Rol</label>
                            <Dropdown className="w-full" options={roles} value={usuarioEditado.rol || ''} onChange={(e) => setUsuarioEditado({...usuarioEditado, rol: e.value})} />
                        </div>
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default Usuarios;