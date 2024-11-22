const mostrarBtn = document.getElementById('mostrarBtn');
const reestablecerBtn = document.getElementById('reestablecerBtn');
const contenedor = document.getElementById('contenedor');
const yearSelector = document.getElementById('yearSelector');

const sessionKeysByYear = {
    '2023': ['7953', '9070', '9094', '9118', '9149', '9173', '9181', '9189', '9197'], // Ejemplo de múltiples claves para 2023
    '2024': ['9472', '9480','9488', '9507','9531', '9550','9566', '9590', '9606', '9636']  // Ejemplo de múltiples claves para 2024
};


mostrarBtn.addEventListener('click', async () => {
    const year = yearSelector.value;

    const sessionKeys = sessionKeysByYear[year] || [];
    const resultadosMap = new Map();

    for (const session_key of sessionKeys) {
        let apiUrl = `https://api.openf1.org/v1/drivers?&session_key=${session_key}`;

        try {
            const respuesta = await fetch(apiUrl);
            if (!respuesta.ok) {
                throw new Error('Error en la red');
            }
            const datos = await respuesta.json();

            datos.forEach(driver => {
                const uniqueKey = `${driver.driver_number}-${driver.full_name}`;
                resultadosMap.set(uniqueKey, driver);
            });
        } catch (error) {
            console.error('Hubo un problema con la solicitud Fetch:', error);
            contenedor.innerHTML = '<p class="error-message">Error al obtener los datos. Intenta de nuevo.</p>';
            return;
        }
    }

    // Convertir el Map de resultados a un arreglo y ordenarlo
    const resultadosArray = Array.from(resultadosMap.values())
        .sort((a, b) => {
            // Convertir a número para asegurar una comparación numérica correcta
            const numA = parseInt(a.driver_number, 10);
            const numB = parseInt(b.driver_number, 10);
            return numA - numB;
        });

    mostrarDatos(resultadosArray);
});

function mostrarDatos(datos) {
    contenedor.innerHTML = '';

    if (!datos || datos.length === 0) {
        contenedor.innerHTML = '<p class="error-message">No se encontraron resultados.</p>';
        return;
    }

    const tabla = document.createElement('table');
    tabla.className = 'openf1-tabla';

    const encabezado = document.createElement('thead');
    encabezado.innerHTML = `
        <tr>
            <th>Numero</th>
            <th>Nombre</th>
            <th>Acronimo</th>
            <th>Pais</th>
            <th>Equipo</th>
        </tr>
    `;
    tabla.appendChild(encabezado);

    const cuerpo = document.createElement('tbody');

    datos.forEach(result => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${result.driver_number || 'N/A'}</td>
            <td>${result.full_name || 'N/A'}</td>
            <td>${result.name_acronym || 'N/A'}</td>
            <td>${result.country_code || 'N/A'}</td>
            <td>${result.team_name || 'N/A'}</td>
        `;
        cuerpo.appendChild(fila);
    });

    tabla.appendChild(cuerpo);
    contenedor.appendChild(tabla);
}

reestablecerBtn.addEventListener('click', () => {
    contenedor.innerHTML = '';
    yearSelector.value = '';
    sessionSelector.value = '';
});