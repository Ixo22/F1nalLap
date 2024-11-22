const mostrarBtn = document.getElementById('mostrarBtn');
const reestablecerBtn = document.getElementById('reestablecerBtn');
const contenedor = document.getElementById('contenedor');
const sessionSelector = document.getElementById('sessionSelector'); // Obtener el seleccionador

mostrarBtn.addEventListener('click', async () => {
    //const countryName = 'Abu Dhabi'; // Nombre del país
    const sessionName = sessionSelector.value; // Obtener el nombre de la sesión seleccionada
    const year = yearSelector.value; // Año
    const countryInput = document.getElementById('countrySelector');
    const countryValue = countryInput.value;
    const circuitInput = document.getElementById('circuitSelector');
    const circuitValue = circuitInput.value;

    // Construir la URL de la API
    //let apiUrl = `https://api.openf1.org/v1/sessions?country_name=${countryName}&year=${year}`;
    let apiUrl = `https://api.openf1.org/v1/sessions?year=${year}`;

    // Si hay un nombre de sesión seleccionado, añadirlo a la URL
    if (sessionName) {
        apiUrl += `&session_name=${sessionName}`;
    }

    if (countryValue) {
        apiUrl += `&country_name=${countryValue}`;
    }

    if (circuitValue) {
        apiUrl += `&circuit_short_name=${circuitValue}`;
    }

    try {
        const respuesta = await fetch(apiUrl);
        if (!respuesta.ok) {
            throw new Error('Error en la red');
        }
        const datos = await respuesta.json();
        mostrarDatos(datos);
    } catch (error) {
        console.error('Hubo un problema con la solicitud Fetch:', error);
        contenedor.innerHTML = '<p class="error-message">Error al obtener los datos. Intenta de nuevo.</p>';
    }
});

function mostrarDatos(datos) {
    contenedor.innerHTML = ''; // Limpiar el contenedor

    // Verificar si hay datos
    if (!datos || datos.length === 0) {
        contenedor.innerHTML = '<p class="error-message">No se encontraron resultados.</p>';
        return;
    }

    // Crear la tabla
    const tabla = document.createElement('table');
    tabla.className = 'openf1-tabla';

    // Crear el encabezado de la tabla
    const encabezado = document.createElement('thead');
    encabezado.innerHTML = `
        <tr>
            <th>País</th>
            <th>Circuito</th>
            <th>Nombre de la Sesión</th>
            <th>Fecha</th>
        </tr>
    `;
    tabla.appendChild(encabezado);

    // Crear el cuerpo de la tabla
    const cuerpo = document.createElement('tbody');

    // Iterar sobre los resultados de la sesión
    datos.forEach(result => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${result.country_name}</td>
            <td>${result.circuit_short_name}</td>
            <td>${result.session_name}</td>
            <td>${new Date(result.date_start).toLocaleString()}</td>
        `;
        cuerpo.appendChild(fila);
        
    });

    // Añadir el cuerpo de la tabla a la tabla
    tabla.appendChild(cuerpo);
    // Añadir la tabla al contenedor
    contenedor.appendChild(tabla);
}


reestablecerBtn.addEventListener('click', () => {
    contenedor.innerHTML = '';
    document.getElementById('yearSelector').value = '';
    document.getElementById('sessionSelector').value = '';
    document.getElementById('countrySelector').value = '';
    document.getElementById('circuitSelector').value = '';
});