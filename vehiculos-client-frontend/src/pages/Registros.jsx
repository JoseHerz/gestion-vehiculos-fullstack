import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { OverlayPanel } from 'primereact/overlaypanel';
import { FilterMatchMode, FilterService } from 'primereact/api';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Password } from 'primereact/password';

FilterService.register('dateIs', (value, filter) => {
    if (filter === undefined || filter === null || (Array.isArray(filter) && !filter[0] && !filter[1])) return true;
    if (value === undefined || value === null) return false;
    const rowDate = new Date(value).setHours(0, 0, 0, 0);
    if (Array.isArray(filter) && filter[0] && filter[1]) {
        return rowDate >= filter[0].setHours(0, 0, 0, 0) && rowDate <= filter[1].setHours(0, 0, 0, 0);
    }
    return rowDate === new Date(filter).setHours(0, 0, 0, 0);
});

const Registros = () => {
    // Verificación de Rol desde el localStorage para mostrar funcionalidades según el rol del usuario
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuario')) || {};
    const isAdmin = usuarioLogueado.rol?.toUpperCase() === 'ADMIN';

    const [registros, setRegistros] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [displayDialog, setDisplayDialog] = useState(false);
    const [displayUserDialog, setDisplayUserDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const toast = useRef(null);
    const op = useRef(null);

    const [nuevoUser, setNuevoUser] = useState({ username: '', password: '', rol: 'USER' });

    const emptyRegistro = {
        id: null,
        vehiculo_id: '',
        motorista: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('en-GB', { hour12: false }),
        kilometraje: '',
        tipo: 'Salida'
    };

    const [registro, setRegistro] = useState(emptyRegistro);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        fecha: { value: null, matchMode: 'dateIs' }
    });
    const [filterValues, setFilterValues] = useState({ fecha: null });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [resReg, resVeh] = await Promise.all([
                api.get('/registros'),
                api.get('/vehiculos')
            ]);
            const listaVehiculos = resVeh.data;
            const dataProcesada = resReg.data.map(r => {
                const v = listaVehiculos.find(veh => veh.id === r.vehiculo_id) || {};
                return {
                    ...r,
                    fecha: new Date(r.fecha), 
                    marca: v.marca || r.marca || 'N/A',
                    modelo: v.modelo || r.modelo || '',
                    placa: v.placa || r.placa || 'S/P',
                    busqueda_full: `${v.marca || ''} ${v.modelo || ''} ${v.placa || ''} ${r.motorista || ''}`
                };
            });
            setRegistros(dataProcesada);
            setVehiculos(listaVehiculos);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al cargar datos' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const saveRegistro = async () => {
        if (!registro.vehiculo_id || !registro.motorista || !registro.kilometraje) {
            toast.current.show({ severity: 'warn', summary: 'Atención', detail: 'Campos incompletos' });
            return;
        }
        try {
            if (isEdit) {
                await api.put(`/registros/${registro.id}`, registro);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Registro actualizado' });
            } else {
                await api.post('/registros', registro);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Registro guardado' });
            }
            setDisplayDialog(false);
            fetchData();
        } catch {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error en la operación' });
        }
    };

    const saveNuevoUsuario = async () => {
        if (!nuevoUser.username || !nuevoUser.password) {
            toast.current.show({ severity: 'warn', summary: 'Atención', detail: 'Datos incompletos' });
            return;
        }
        try {
            await api.post('/auth/register', nuevoUser);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado' });
            setDisplayUserDialog(false);
            setNuevoUser({ username: '', password: '', rol: 'USER' });
        } catch {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el usuario' });
        }
    };

    const actionsTemplate = (rowData) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" className="p-button-text p-button-info" onClick={() => { setRegistro({...rowData}); setIsEdit(true); setDisplayDialog(true); }} />
            {isAdmin && (
                <Button icon="pi pi-trash" className="p-button-text p-button-danger" onClick={() => confirmDialog({
                    message: '¿Eliminar registro?',
                    header: 'Confirmar',
                    icon: 'pi pi-trash',
                    accept: () => api.delete(`/registros/${rowData.id}`).then(fetchData)
                })} />
            )}
        </div>
    );

    const header = (
        <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-3">
            <span className="p-input-icon-left w-full md:w-auto">
                <i className="pi pi-search" style={{ left: '1rem' }} />
                <InputText 
                    value={filters.global.value || ''} 
                    onChange={(e) => setFilters({...filters, global: {value: e.target.value, matchMode: FilterMatchMode.CONTAINS}})} 
                    placeholder="Filtrar por vehículo o motorista..." 
                    className="w-full md:w-25rem border-round-3xl pl-5"
                />
            </span>
            <div className="flex gap-2 w-full md:w-auto">
                {isAdmin && (
                    <Button label="Usuarios" icon="pi pi-user-plus" className="p-button-outlined p-button-info border-round-lg" onClick={() => setDisplayUserDialog(true)} />
                )}
                <Button icon="pi pi-filter" className="p-button-outlined p-button-secondary border-round-lg" onClick={(e) => op.current.toggle(e)} />
                <Button label="Nuevo Registro" icon="pi pi-plus" className="p-button-success p-button-raised flex-1 md:flex-none" onClick={() => { setRegistro(emptyRegistro); setIsEdit(false); setDisplayDialog(true); }} />
            </div>
        </div>
    );

    return (
        <div className="p-2 md:p-4">
            <Toast ref={toast} />
            <ConfirmDialog />
            
            <div className="surface-card p-2 md:p-4 shadow-2 border-round">
                <DataTable 
                    value={registros} paginator rows={10} header={header} 
                    filters={filters} loading={loading} responsiveLayout="stack"
                    globalFilterFields={['busqueda_full']} className="p-datatable-sm"
                >
                    <Column field="fecha" header="Fecha" body={(r) => r.fecha.toLocaleDateString()} sortable />
                    <Column field="motorista" header="Motorista" sortable />
                    <Column header="Vehículo" body={(r) => (
                        <div className="flex flex-column">
                            <span className="font-bold text-blue-900">{r.marca} {r.modelo}</span>
                            <small className="text-600 font-bold">{r.placa}</small>
                        </div>
                    )} sortable sortField="marca" />
                    <Column field="tipo" header="Evento" body={(r) => (
                        <span className={`p-badge p-badge-${r.tipo === 'Salida' ? 'warning' : 'success'}`}>{r.tipo}</span>
                    )} />
                    <Column field="kilometraje" header="KM" sortable />
                    <Column body={actionsTemplate} header="Acciones" />
                </DataTable>
            </div>

            <Dialog 
                header="Nuevo Usuario de Sistema" 
                visible={displayUserDialog} 
                style={{ width: '90vw', maxWidth: '400px' }} 
                modal 
                onHide={() => setDisplayUserDialog(false)}
                footer={<Button label="Guardar Usuario" icon="pi pi-check" onClick={saveNuevoUsuario} className="p-button-info w-full" />}
            >
                <div className="p-fluid flex flex-column gap-3 mt-3">
                    <div className="field">
                        <label className="font-bold text-blue-800">Nombre de Usuario</label>
                        <InputText value={nuevoUser.username} onChange={(e) => setNuevoUser({...nuevoUser, username: e.target.value})} />
                    </div>
                    <div className="field">
                        <label className="font-bold text-blue-800">Contraseña</label>
                        <Password value={nuevoUser.password} onChange={(e) => setNuevoUser({...nuevoUser, password: e.target.value})} feedback={false} toggleMask />
                    </div>
                    <div className="field">
                        <label className="font-bold text-blue-800">Rol</label>
                        <Dropdown value={nuevoUser.rol} options={[{label: 'Administrador', value: 'ADMIN'}, {label: 'Operador', value: 'USER'}]} onChange={(e) => setNuevoUser({...nuevoUser, rol: e.value})} />
                    </div>
                </div>
            </Dialog>

            <OverlayPanel ref={op} style={{ width: '300px' }}>
                <div className="p-fluid flex flex-column gap-3">
                    <Calendar value={filterValues.fecha} onChange={(e) => {
                            let _f = { ...filters };
                            _f['fecha'].value = e.value;
                            setFilters(_f);
                            setFilterValues({fecha: e.value});
                        }} selectionMode="range" readOnlyInput placeholder="Rango de fechas" showIcon appendTo={document.body} />
                    <Button label="Limpiar" className="p-button-outlined p-button-secondary" onClick={() => { 
                        setFilters({global: { value: null, matchMode: FilterMatchMode.CONTAINS }, fecha: { value: null, matchMode: 'dateIs' }});
                        setFilterValues({fecha: null}); 
                    }} />
                </div>
            </OverlayPanel>

            <Dialog 
                header={isEdit ? "Editar Registro" : "Nuevo Registro"} 
                visible={displayDialog} style={{ width: '95vw', maxWidth: '450px' }} 
                modal onHide={() => setDisplayDialog(false)}
                footer={<Button label="Guardar" icon="pi pi-check" onClick={saveRegistro} className="w-full" />}
            >
                <div className="p-fluid flex flex-column gap-3 mt-3">
                    <div className="field">
                        <label className="font-bold text-blue-800">Unidad</label>
                        <Dropdown value={registro.vehiculo_id} options={vehiculos} onChange={(e) => setRegistro({...registro, vehiculo_id: e.value})} 
                            optionLabel={(v) => `${v.marca} ${v.modelo} (${v.placa})`} optionValue="id" filter appendTo={document.body} />
                    </div>
                    <div className="field">
                        <label className="font-bold text-blue-800">Motorista</label>
                        <InputText value={registro.motorista} onChange={(e) => setRegistro({...registro, motorista: e.target.value})} />
                    </div>
                    <div className="field">
                        <label className="font-bold text-blue-800">Kilometraje</label>
                        <InputText keyfilter="num" value={registro.kilometraje} onChange={(e) => setRegistro({...registro, kilometraje: e.target.value})} />
                    </div>
                    <div className="field">
                        <label className="font-bold text-blue-800">Evento</label>
                        <Dropdown value={registro.tipo} options={['Entrada', 'Salida']} onChange={(e) => setRegistro({...registro, tipo: e.value})} appendTo={document.body} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default Registros;