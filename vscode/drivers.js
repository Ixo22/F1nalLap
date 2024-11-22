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
    

    const apiUrl = `https://ergast.com/api/f1/${temporada}/${ronda}/drivers.json`;

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
    if (datos.MRData.DriverTable.Drivers.length === 0) {
        contenedor.innerHTML = '<p>No se encontraron resultados.</p>';
        return;
    }

    // Iterar sobre los resultados de los conductores
    datos.MRData.DriverTable.Drivers.forEach(driver => {
        const divResult = document.createElement('div');
        divResult.className = 'result';
        divResult.innerHTML = `
            <h3>${driver.givenName} ${driver.familyName}</h3>
            <p>Numero: ${driver.permanentNumber ? driver.permanentNumber : 'No disponible'}</p>
            <p>DoB: ${driver.dateOfBirth}</p>
            <p>Nacionalidad: ${driver.nationality}</p>
        `;
        contenedor.appendChild(divResult);
    });
}

reestablecerBtn.addEventListener('click', () => {
    contenedor.innerHTML = '';
    document.getElementById('temporada').value = '';
    document.getElementById('ronda').value = '';
});