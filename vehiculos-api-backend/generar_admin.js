const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function crearAdmin() {
    try {
        const usuario = 'admin';
        const clavePlana = 'admin'; // Esta será la contraseña para entrar
        
        console.log('Generando hash...');
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(clavePlana, salt);

        // 1. Borramos si ya existe para no duplicar
        await db.query('DELETE FROM usuarios WHERE username = $1', [usuario]);
        
        // 2. Insertamos el nuevo con el hash generado por tu propio sistema
        await db.query(
            'INSERT INTO usuarios (username, password, nombre) VALUES ($1, $2, $3)',
            [usuario, hash, 'Administrador del Sistema']
        );

        console.log('-------------------------------------------');
        console.log('✅ USUARIO CREADO CON ÉXITO');
        console.log(`Usuario: ${usuario}`);
        console.log(`Contraseña: ${clavePlana}`);
        console.log('-------------------------------------------');
        process.exit();
    } catch (error) {
        console.error('❌ ERROR AL CREAR USUARIO:', error);
        process.exit(1);
    }
}

crearAdmin();