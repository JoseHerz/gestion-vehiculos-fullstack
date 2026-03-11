import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { FilterMatchMode } from 'primereact/api';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

const Vehiculos = () => {
    const [vehiculos, setVehiculos] = useState([]);
    const [displayDialog, setDisplayDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const toast = useRef(null);

    const emptyVehiculo = {
        id: null,
        placa: '',
        marca: '',
        modelo: ''
    };

    const [vehiculo, setVehiculo] = useState(emptyVehiculo);

    // Filtros simplificados y funcionales para búsqueda global
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/vehiculos');
            // Añadimos campo de búsqueda combinada para mayor eficiencia
            const dataProcesada = res.data.map(v => ({
                ...v,
                busqueda_full: `${v.placa} ${v.marca} ${v.modelo}`.toLowerCase()
            }));
            setVehiculos(dataProcesada);
        } catch (ex) {
            console.error("Error cargando vehículos:", ex);
            toast.current?.show({ 
                severity: 'error', 
                summary: 'Error de Conexión', 
                detail: 'No se pudieron obtener los datos de la flota' 
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openNew = () => {
        setVehiculo(emptyVehiculo);
        setIsEdit(false);
        setDisplayDialog(true);
    };

    const editVehiculo = (rowData) => {
        setVehiculo({ ...rowData });
        setIsEdit(true);
        setDisplayDialog(true);
    };

    const saveVehiculo = async () => {
        // Validación básica obligatoria
        if (!vehiculo.placa || !vehiculo.marca || !vehiculo.modelo) {
            toast.current.show({ 
                severity: 'warn', 
                summary: 'Atención', 
                detail: 'Todos los campos son obligatorios para el registro' 
            });
            return;
        }

        try {
            if (isEdit) {
                await api.put(`/vehiculos/${vehiculo.id}`, vehiculo);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Unidad actualizada correctamente' });
            } else {
                await api.post('/vehiculos', vehiculo);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Nueva unidad añadida a la flota' });
            }
            setDisplayDialog(false);
            fetchData();
        } catch (ex) {
            console.error("Error al guardar:", ex);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'La operación no pudo completarse en el servidor' });
        }
    };

    const accionesBodyTemplate = (rowData) => (
        <div className="flex gap-2">
            <Button 
                icon="pi pi-pencil" 
                className="p-button-text p-button-info" 
                onClick={() => editVehiculo(rowData)} 
            />
            <Button 
                icon="pi pi-trash" 
                className="p-button-text p-button-danger" 
                onClick={() => confirmDialog({
                    message: `¿Desea eliminar el vehículo ${rowData.placa}?`,
                    header: 'Confirmar Eliminación',
                    icon: 'pi pi-exclamation-triangle',
                    acceptClassName: 'p-button-danger',
                    accept: () => api.delete(`/vehiculos/${rowData.id}`).then(fetchData)
                })} 
            />
        </div>
    );

    const header = (
        <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-3">
            <span className="p-input-icon-left w-full md:w-auto">
                <i className="pi pi-search" style={{ left: '1rem' }} />
                <InputText 
                    value={filters.global.value || ''} 
                    onChange={(e) => setFilters({...filters, global: {value: e.target.value, matchMode: FilterMatchMode.CONTAINS}})} 
                    placeholder="Buscar por placa, marca o modelo..." 
                    className="w-full md:w-25rem border-round-3xl pl-5"
                />
            </span>
            <Button 
                label="Nuevo Vehículo" 
                icon="pi pi-plus" 
                className="p-button-success p-button-raised w-full md:w-auto" 
                onClick={openNew} 
            />
        </div>
    );

    return (
        <div className="p-2 md:p-4">
            <Toast ref={toast} />
            <ConfirmDialog />
            
            <div className="surface-card p-2 md:p-4 shadow-2 border-round">
                <h2 className="text-blue-800 mb-4 ml-2">Gestión de Flota</h2>
                <DataTable 
                    value={vehiculos} paginator rows={10} header={header} 
                    filters={filters} loading={loading} responsiveLayout="stack"
                    globalFilterFields={['busqueda_full']} className="p-datatable-sm"
                    emptyMessage="No se encontraron vehículos registrados."
                >
                    <Column field="placa" header="Placa" sortable className="font-bold text-blue-700" />
                    <Column field="marca" header="Marca" sortable />
                    <Column field="modelo" header="Modelo" sortable />
                    <Column body={accionesBodyTemplate} header="Acciones" style={{ minWidth: '100px' }} />
                </DataTable>
            </div>

            <Dialog 
                header={isEdit ? "Modificar Vehículo" : "Registrar Nueva Unidad"} 
                visible={displayDialog} 
                style={{ width: '95vw', maxWidth: '400px' }} 
                modal 
                onHide={() => setDisplayDialog(false)} 
                footer={<Button label="Guardar Cambios" icon="pi pi-check" onClick={saveVehiculo} className="w-full" />}
            >
                <div className="p-fluid flex flex-column gap-3 mt-3">
                    <div className="field">
                        <label className="font-bold">Número de Placa</label>
                        <InputText 
                            value={vehiculo.placa} 
                            onChange={(e) => setVehiculo({...vehiculo, placa: e.target.value.toUpperCase()})} 
                            placeholder="Ej: P-123ABC"
                        />
                    </div>
                    <div className="field">
                        <label className="font-bold">Marca</label>
                        <InputText 
                            value={vehiculo.marca} 
                            onChange={(e) => setVehiculo({...vehiculo, marca: e.target.value})} 
                        />
                    </div>
                    <div className="field">
                        <label className="font-bold">Modelo</label>
                        <InputText 
                            value={vehiculo.modelo} 
                            onChange={(e) => setVehiculo({...vehiculo, modelo: e.target.value})} 
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default Vehiculos;