// Código de api completo
// Problema: Crea demasiadas requests cuando el límite por día es 100 (con este código se crea más de 1 request cada que se ejecuta)
// Por lo que he decidido separar el código por partes y que cada que se necesite una parte se llame solo a esa parte

const apiKey = "ad2320260537af9711eb02336ea41b99";

async function fetchDriverRankings() {
    const anyoActual = new Date().getFullYear(); // Obtener el año actual
    const response = await fetch(`https://v1.formula-1.api-sports.io/rankings/drivers?season=2023`, {
        method: "GET",
        headers: {
            "x-rapidapi-key": apiKey,
            "x-rapidapi-host": "v1.formula-1.api-sports.io"
        }
    });

    if (!response.ok) {
        console.error("Error en la llamada a la API:", response.statusText);
        return;
    }

    const data = await response.json();
    displayRankings(data.response, 'drivers');
}

async function fetchTeamRankings() {
    const anyoActual = new Date().getFullYear(); // Obtener el año actual
    const response = await fetch(`https://v1.formula-1.api-sports.io/rankings/teams?season=2023`, {
        method: "GET",
        headers: {
            "x-rapidapi-host": "v1.formula-1.api-sports.io",
            "x-rapidapi-key": apiKey
        }
    });

    if (!response.ok) {
        console.error("Error en la llamada a la API:", response.statusText);
        return;
    }

    const data = await response.json();
    displayRankings(data.response, 'teams');
}

async function fetchCircuits() {
    const anyoActual = new Date().getFullYear(); // Obtener el año siguiente
    const response = await fetch(`https://v1.formula-1.api-sports.io/races?type=Race&season=2023`, {
        method: "GET",
        headers: {
            "x-rapidapi-key": apiKey,
            "x-rapidapi-host": "v1.formula-1.api-sports.io"
        }
    });

    if (!response.ok) {
        console.error("Error en la llamada a la API:", response.statusText);
        return;
    }

    const data = await response.json();
    displayRaces(data.response);
}

// POSIBLE PROBLEMA
// Diría que el problema está aquí. Al llamar al circuito me llama por cada circuito a este url de la api
// Al llamar por cada circuito me hace tantas llamadas como circuitos hay (24 en 2024)
// Conectar circuitos actuales con circuitos historicos y solo mostrar los que coincidan en ambos? (2 llamadas = 1 para circuitos actuales + 1 para todos los circuitos)
// De este modo hago solo dos llamadas y me quedo con los resultados del join?
async function fetchDriverName(idDriver) {
    const response = await fetch(`https://v1.formula-1.api-sports.io/drivers?id=${idDriver}`, {
        method: "GET",
        headers: {
            "x-rapidapi-key": apiKey,
            "x-rapidapi-host": "v1.formula-1.api-sports.io"
        }
    });

    if (!response.ok) {
        console.error("Error en la llamada a la API de pilotos:", response.statusText);
        return null; // Devuelve null si hay un error
    }

    const data = await response.json();
    return data.response.length > 0 ? data.response[0].name : 'Desconocido'; // Devuelve el nombre del piloto o 'Desconocido'
}




function displayRankings(rankings, type) {
    const rankingsDiv = document.getElementById("rankings");
    rankingsDiv.innerHTML = ""; // Limpiar contenido previo

    rankings.forEach(item => {
        const element = document.createElement("div");
        element.classList.add(type === 'drivers' ? 'driver' : 'team');

        let teamName = type === 'drivers' ? item.team.name : item.team.name; // Obtener el nombre del equipo

        // Reemplazar nombres de equipos según lo solicitado
        if (teamName === "Visa Cash App RB Formula One Team") {
            teamName = "VCA RB";
        } else if (teamName === "Stake F1 Team Kick Sauber") {
            teamName = "Kick Sauber";
        }

        if (type === 'drivers') {
            element.innerHTML = `
                <img src="${item.driver.image}" alt="${item.driver.name}">
                <div class="driver-info">
                    <span class="position">#${item.position}</span> - ${item.driver.name} (${teamName})<br>
                    ‎ ‎ ‎ ‎ ‎ ‎ ‎
                    Puntos: ${item.points !== null ? item.points : 0} - Victorias: ${item.wins !== null ? item.wins : 0}
                </div>
            `;
        } else {
            // Mostrar información del equipo en el formato solicitado
            element.innerHTML = `
                <div class="team-info">
                    <img src="${item.team.logo}" alt="${item.team.name}" style="width: 60px; height: auto; margin-right: 10px;">
                    <br>
                    <span class="position">#${item.position}</span> - ${teamName}
                    <br> 
                    ‎ ‎ Puntos: ${item.points}
                </div>
            `;
        }

        rankingsDiv.appendChild(element);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); // Asegura que el día tenga dos dígitos
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Asegura que el mes tenga dos dígitos (los meses son 0-indexados)
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; // Retorna la fecha en formato dd/mm/yyyy
}

async function displayRaces(races) {
    const rankingsDiv = document.getElementById("rankings");
    rankingsDiv.innerHTML = ""; // Limpiar contenido previo

    for (const race of races) {
        const element = document.createElement("div");
        element.classList.add('race');

        // Obtener el nombre del piloto que estableció el récord de vuelta
        const driverName = await fetchDriverName(race.fastest_lap.driver.id);

        element.innerHTML = `
            <div class="race-info">
                <img src="${race.circuit.image}" alt="${race.circuit.name}" style="width: 200px; height: auto;">
                <br><br>
                <strong>${race.competition.name}</strong>
                <br><br>
                - Ubicación: ${race.competition.location.city}, ${race.competition.location.country}<br>
                - Fecha: ${formatDate(race.date)}<br> <!-- Usar la función formatDate -->
                - Laps: ${race.laps.total}<br>
                - Distancia: ${race.distance}<br>
                - Vuelta rápida 2024: ${race.fastest_lap.time ? `${race.fastest_lap.time} por ${driverName}` : 'N/A'}<br>
            </div>
        `;

        rankingsDiv.appendChild(element);
    }
}

function clearData() {
    const rankingsDiv = document.getElementById("rankings");
    rankingsDiv.innerHTML = ""; // Limpiar solo el contenido de rankings
}

// Eventos de los botones
document.getElementById("showDrivers").addEventListener("click", fetchDriverRankings);
document.getElementById("showTeams").addEventListener("click", fetchTeamRankings);
document.getElementById("clearData").addEventListener("click", clearData);
document.getElementById("showCircuits").addEventListener("click", fetchCircuits); // Evento para el botón de carreras ```javascript
// Evento para el botón de carreras