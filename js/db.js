const DB = {
    KEY: 'fleetmaster_data',
    SESSION_KEY: 'fleet_session',

    get() {
        const data = localStorage.getItem(this.KEY);
        if (!data) {
            const inicial = {
                vehiculos: [],
                movimientos: [],
                consolidadosMensuales: [] // Almacena registros consolidados manuales por mes
            };
            this.save(inicial);
            return inicial;
        }
        return JSON.parse(data);
    },

    save(data) {
        localStorage.setItem(this.KEY, JSON.stringify(data));
    },

    verificarSesion(rolRequerido) {
        const sesion = JSON.parse(localStorage.getItem(this.SESSION_KEY));
        if (!sesion) {
            window.location.href = 'login.html';
            return;
        }
        if (rolRequerido && sesion.rol !== rolRequerido) {
            alert('No tienes permisos para acceder a esta sección.');
            window.location.href = sesion.rol === 'ADMIN' ? 'index.html' : 'portal-chofer.html';
        }
    },

    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        window.location.href = 'login.html';
    }
};