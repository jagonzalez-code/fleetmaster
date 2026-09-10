// js/db.js
const DB = {
    KEY: 'fleetmaster_db',
    SESSION_KEY: 'fleetmaster_session',

    // Función auxiliar para encriptar contraseñas antes de guardarlas o compararlas
    async hashPassword(password) {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    init() {
        if (!localStorage.getItem(this.KEY)) {
            // Usuario administrador por defecto inicializado sin exponer texto plano
            const defaultData = {
                usuarios: [
                    {
                        id: 'usr_admin',
                        usuario: 'admin',
                        // Hash SHA-256 de "admin123"
                        passHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
                        rol: 'ADMIN',
                        nombre: 'Administrador Principal'
                    }
                ],
                vehiculos: [],
                movimientos: [],
                consolidadosMensuales: []
            };
            localStorage.setItem(this.KEY, JSON.stringify(defaultData));
        }
    },

    get() {
        this.init();
        return JSON.parse(localStorage.getItem(this.KEY));
    },

    save(data) {
        localStorage.setItem(this.KEY, JSON.stringify(data));
    },

    async registrarUsuario({ usuario, password, rol, nombre }) {
        const data = this.get();
        const existe = data.usuarios.some(u => u.usuario.toLowerCase() === usuario.toLowerCase());
        
        if (existe) {
            throw new Error('El nombre de usuario ya está registrado.');
        }

        const passHash = await this.hashPassword(password);
        const nuevoUsuario = {
            id: 'usr_' + Date.now(),
            usuario: usuario.trim(),
            passHash: passHash,
            rol: rol, // 'ADMIN' o 'CHOFER'
            nombre: nombre.trim()
        };

        data.usuarios.push(nuevoUsuario);
        this.save(data);
        return nuevoUsuario;
    },

    async login(usuario, password) {
        const data = this.get();
        const passHash = await this.hashPassword(password);
        
        const user = data.usuarios.find(u => 
            u.usuario.toLowerCase() === usuario.toLowerCase() && u.passHash === passHash
        );

        if (!user) {
            return false;
        }

        const sesion = {
            id: user.id,
            usuario: user.usuario,
            nombre: user.nombre,
            rol: user.rol,
            fechaLogin: new Date().toISOString()
        };

        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sesion));
        return sesion;
    },

    getSesion() {
        const sesion = localStorage.getItem(this.SESSION_KEY);
        return sesion ? JSON.parse(sesion) : null;
    },

    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        window.location.href = 'login.html';
    },

    verificarSesion(rolRequerido = null) {
        const sesion = this.getSesion();
        if (!sesion) {
            window.location.href = 'login.html';
            return;
        }

        if (rolRequerido && sesion.rol !== rolRequerido) {
            if (sesion.rol === 'CHOFER') {
                window.location.href = 'portal-chofer.html';
            } else {
                window.location.href = 'index.html';
            }
        }
    }
};

DB.init();