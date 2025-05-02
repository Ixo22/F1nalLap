const mostrarBtn = document.getElementById('mostrarBtn');
const reestablecerBtn = document.getElementById('reestablecerBtn');
const contenedor = document.getElementById('contenedor');

mostrarBtn.addEventListener('click', async () => {
    const temporada = document.getElementById('temporada').value;
    const ronda = document.getElementById('ronda').value;

    if (!temporada && !ronda) {
        alert('Por favor, selecciona una temporada y una ronda.');
        return;
    }

    if (!temporada || !ronda) {
        alert(`Por favor, selecciona ${!temporada ? 'una temporada' : 'una ronda'}.`);
        return;
    }

    //const apiUrl = `https://ergast.com/api/f1/${temporada}/${ronda}/results.json`;
    const apiUrl = `https://api.jolpi.ca/ergast/f1/${temporada}/${ronda}/results.json`;

    try {
        const respuesta = await fetch(apiUrl);
        if (!respuesta.ok) {
            throw new Error('Error en la red');
        }
        const datos = await respuesta.json();
        mostrarDatos(datos);
    } catch (error) {
        console.error('Hubo un problema con la solicitud Fetch:', error);
        contenedor.innerHTML = '<p>Error al obtener los datos. Intenta de nuevo.</p>';
    }
});

function mostrarDatos(datos) {
    contenedor.innerHTML = ''; // Limpiar el contenedor

    // Verificar si hay datos
    if (datos.MRData.RaceTable.Races.length === 0) {
        contenedor.innerHTML = '<p>No se encontraron resultados.</p><p>O aún no hay datos</p>';
        return;
    }

    // Obtener el nombre de la carrera
    const nombreCarrera = datos.MRData.RaceTable.Races[0].raceName;
    const divNombreCarrera = document.createElement('h3');
    divNombreCarrera.innerText = nombreCarrera;
    divNombreCarrera.style.justifyContent = 'center'; // Centrar el texto directamente
    divNombreCarrera.style.textAlign = 'center'; // Centrar el texto directamente
    contenedor.appendChild(divNombreCarrera);

    // Crear la tabla
    const tabla = document.createElement('table');
    tabla.className = 'result-table';

    // Crear el encabezado de la tabla
    const encabezado = document.createElement('thead');
    encabezado.innerHTML = `
        <tr>
            <th>Posición</th>
            <th>Piloto</th>
            <th>Equipo</th>
            <th>Mejor Vuelta</th>
            <th>Puntos</th>
        </tr>
    `;
    tabla.appendChild(encabezado);

    // Crear el cuerpo de la tabla
    const cuerpo = document.createElement('tbody');

    // Iterar sobre los resultados de la carrera
    datos.MRData.RaceTable.Races[0].Results.forEach(result => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${result.position}</td>
            <td>${result.Driver.givenName} ${result.Driver.familyName}</td>
            <td>${result.Constructor.name}</td>
            <td>${result.FastestLap ? result.FastestLap.Time.time : 'No disponible'}</td>
            <td>${result.points}</td>
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
    document.getElementById('temporada').value = '';
    document.getElementById('ronda').value = '';
});
