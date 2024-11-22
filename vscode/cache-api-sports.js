const apiKey = "ad2320260537af9711eb02336ea41b99";

// Función para almacenar datos en sessionStorage
function setSessionStorage(key, data) {
    sessionStorage.setItem(key, JSON.stringify(data));
}

// Función para obtener datos de sessionStorage
function getSessionStorage(key) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

async function fetchDriverRankings() {
    // Verificar si los datos ya están en sessionStorage
    const cachedData = getSessionStorage('driverRankings');
    if (cachedData) {
        displayRankings(cachedData, 'drivers');
        return;
    }

    const anyoActual = new Date().getFullYear();
    const response = await fetch(`https://v1.formula-1.api-sports.io/rankings/drivers?season=${anyoActual}`, {
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
    setSessionStorage('driverRankings', data.response); // Almacenar en sessionStorage
    displayRankings(data.response, 'drivers');
}

async function fetchTeamRankings() {
    const cachedData = getSessionStorage('teamRankings');
    if (cachedData) {
        displayRankings(cachedData, 'teams');
        return;
    }

    const anyoActual = new Date().getFullYear();
    const response = await fetch(`https://v1.formula-1.api-sports.io/rankings/teams?season=${anyoActual}`, {
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
    setSessionStorage('teamRankings', data.response); // Almacenar en sessionStorage
    displayRankings(data.response, 'teams');
}

async function fetchCircuits() {
    const cachedData = getSessionStorage('circuits');
    if (cachedData) {
        displayRaces(cachedData);
        return;
    }

    const anyoActual = new Date().getFullYear();
    const response = await fetch(`https://v1.formula-1.api-sports.io/races?type=Race&season=${anyoActual}`, {
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
    setSessionStorage('circuits', data.response); // Almacenar en sessionStorage
    displayRaces(data.response);
}

function displayRankings(rankings, type) {
    const rankingsDiv = document.getElementById("rankings");
    rankingsDiv.innerHTML = "";

    rankings.forEach(item => {
        const element = document.createElement("div");
        element.classList.add(type === 'drivers' ? 'driver' : 'team');

        let teamName = type === 'drivers' ? item.team.name : item.team.name;

        if (teamName === "Visa Cash App RB Formula One Team") {
            teamName = "VCA RB";
        } else if (teamName === "Stake F1 Team Kick Sauber") {
            teamName = "Kick Sauber";
        }

        if (type === 'drivers') {
            // Asignar la imagen del piloto según su nombre
            let driverImage = item.driver.image; // Imagen por defecto

            if (item.driver.name === "Franco Colapinto") {
                driverImage = "https://soymotor.com/sites/default/files/2024-09/franco-colapinto-soymotor.png";
            } else if (item.driver.name === "Oliver Bearman") {
                driverImage = "https://soymotor.com/sites/default/files/2024-09/oliver-bearman-soymotor.png";
            }

            element.innerHTML = `
                <img src="${driverImage}" alt="${item.driver.name}">
                <div class="driver-info">
                    <span class="position">#${item.position}</span> - ${item.driver.name} (${teamName})<br>
                    ‎ ‎ ‎ ‎ ‎ ‎ ‎
                    Puntos: ${item.points !== null ? item.points : 0} - Victorias: ${item.wins !== null ? item.wins : 0}
                </div>
            `;
        } else {
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
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function displayRaces(races) {
    const rankingsDiv = document.getElementById("rankings");
    rankingsDiv.innerHTML = "";

    for (const race of races) {
        const element = document.createElement("div");
        element.classList.add('race');


        element.innerHTML = `
            <img src="${race.circuit.image}" alt="${race.circuit.name}">
            <div class="race-info">
                
                <br><br>
                <strong>${race.competition.name}</strong>
                <br><br>
                - Ubicación: ${race.competition.location.city}, ${race.competition.location.country}<br>
                - Fecha: ${formatDate(race.date)}<br>
                - Laps: ${race.laps.total}<br>
                - Vuelta rápida 2024: ${race.fastest_lap.time ? `${race.fastest_lap.time}` : 'N/A'}<br>
            </div>
        `;

        rankingsDiv.appendChild(element);
    }
}

function clearData() {
    const rankingsDiv = document.getElementById("rankings");
    rankingsDiv.innerHTML = "";
}

function clearCache() {
    // Limpiar div
    const rankingsDiv = document.getElementById("rankings");
    rankingsDiv.innerHTML = "";
    // Limpiar el sessionStorage
    sessionStorage.removeItem('driverRankings');
    sessionStorage.removeItem('teamRankings');
    sessionStorage.removeItem('circuits');
    console.log("Caché borrado."); // Mensaje en la consola para confirmar la acción
    alert("Caché borrado."); // Mensaje para el usuario
}

// Eventos de los botones
document.getElementById("showDrivers").addEventListener("click", fetchDriverRankings);
document.getElementById("showTeams").addEventListener("click", fetchTeamRankings);
document.getElementById("clearData").addEventListener("click", clearData);
document.getElementById("showCircuits").addEventListener("click", fetchCircuits);
document.getElementById("clearCache").addEventListener("click", clearCache);