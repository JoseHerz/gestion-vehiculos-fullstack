import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import api from '../api/api'; 
import 'primeicons/primeicons.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { username, password });
            
            localStorage.setItem('token', res.data.token);
            
            // NORMALIZAR ROL PARA EL FRONTEND
            const usuarioFormateado = { ...res.data.usuario, rol: res.data.usuario.rol?.toUpperCase() };
            localStorage.setItem('usuario', JSON.stringify(usuarioFormateado));
            
            window.location.href = '/'; 
        } catch (err) { 
            const mensaje = err.response?.data?.message || 'Credenciales inválidas';
            alert(mensaje);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            backgroundColor: '#f4f6f9',
            backgroundImage: 'radial-gradient(ellipse at 50% 150%, #2563eb 50%, transparent 50.1%)',
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
            boxSizing: 'border-box'
        }}>
            
            <div style={{ 
                position: 'relative',
                backgroundColor: '#eef2f6', 
                padding: '60px clamp(20px, 5vw, 40px) 40px clamp(20px, 5vw, 40px)', 
                borderRadius: '8px', 
                boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px',
                boxSizing: 'border-box',
                marginTop: '40px'
            }}>
                
                <div style={{
                    position: 'absolute',
                    top: '-45px',
                    left: 'calc(50% - 45px)',
                    width: '90px',
                    height: '90px',
                    backgroundColor: '#3b82f6', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                }}>
                    <i className="pi pi-user" style={{ fontSize: '2.5rem', color: '#ffffff' }}></i>
                </div>

                <form onSubmit={handleLogin} className="p-fluid" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                    
                    <div style={{ position: 'relative', width: '100%' }}>
                        <span className="p-input-icon-left" style={{ width: '100%', display: 'block' }}>
                            <i className="pi pi-user" style={{ color: '#9ca3af', left: '1rem' }} />
                            <InputText 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                style={{ 
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    padding: '14px 14px 14px 45px', 
                                    border: 'none', 
                                    borderRadius: '4px',
                                    backgroundColor: '#ffffff',
                                    fontSize: '14px',
                                    color: '#4b5563'
                                }}
                                placeholder="Usuario"
                                required 
                            />
                        </span>
                    </div>

                    <div style={{ position: 'relative', width: '100%' }}>
                        <span className="p-input-icon-left" style={{ width: '100%', display: 'block' }}>
                            <i className="pi pi-lock" style={{ color: '#9ca3af', left: '1rem', zIndex: 1 }} />
                            <Password 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                feedback={false} 
                                style={{ width: '100%' }}
                                inputStyle={{ 
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    padding: '14px 14px 14px 45px', 
                                    border: 'none', 
                                    borderRadius: '4px',
                                    backgroundColor: '#ffffff',
                                    fontSize: '14px',
                                    color: '#4b5563'
                                }}
                                placeholder="Contraseña"
                                required 
                            />
                        </span>
                    </div>

                    <Button 
                        label="INICIAR SESIÓN" 
                        loading={loading} 
                        style={{ 
                            width: '100%',
                            boxSizing: 'border-box',
                            backgroundColor: '#3b82f6', 
                            border: 'none', 
                            padding: '14px', 
                            fontWeight: 'bold',
                            fontSize: '14px',
                            letterSpacing: '1px',
                            color: '#ffffff',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            marginTop: '10px'
                        }} 
                    />
                </form>
            </div>
        </div>
    );
};

export default Login;