import React from 'react';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    // Si no encuentra el rol, ponemos 'USER' por defecto
    const rolActual = (usuario.rol || 'USER').toUpperCase();

    const items = [
        { label: 'Registros', icon: 'pi pi-list', command: () => navigate('/') },
        { label: 'Flota de Vehículos', icon: 'pi pi-car', command: () => navigate('/vehiculos') }
    ];

    // Muestra el menú de Usuarios solo a los administradores
    if (rolActual === 'ADMIN' || usuario.username?.toLowerCase() === 'admin') {
        items.push({
            label: 'Usuarios',
            icon: 'pi pi-users',
            command: () => navigate('/usuarios')
        });
    }

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const start = <h3 className="m-0 mr-4 text-primary font-bold">Control Vehicular</h3>;
    
    const end = (
        <div className="flex align-items-center gap-3">
            <div className="flex flex-column align-items-end mr-2">
                <span className="font-bold text-700">{usuario.username}</span>
                <small className="text-blue-500 font-bold" style={{ fontSize: '0.7rem' }}>
                    {rolActual === 'ADMIN' || usuario.username?.toLowerCase() === 'admin' ? 'ADMIN' : 'USER'}
                </small>
            </div>
            <Button 
                label="Salir" 
                icon="pi pi-sign-out" 
                className="p-button-danger p-button-text border-round-lg" 
                onClick={logout} 
            />
        </div>
    );

    return (
        <div className="card mb-4 shadow-1 border-none">
            <Menubar model={items} start={start} end={end} className="border-none px-4 py-2 surface-card" />
        </div>
    );
};

export default Navbar;