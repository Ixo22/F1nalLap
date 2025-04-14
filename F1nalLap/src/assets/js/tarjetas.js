// tarjetas.js

function initTarjetas() {
 
  const contenedor = document.getElementById("tarjetas");
  if (!contenedor) {
    console.warn("Esperando a que aparezca el contenedor...");
    setTimeout(initTarjetas, 250); // Reintenta en 50ms
    return;
  }
  console.log("Cargando tarjetas.js...");
  fetch("./assets/json/circuitos2025.json")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((circuito) => {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("tarjeta");
        tarjeta.innerHTML = `
          <div class="tarjeta-imagen">
            <img src="${circuito.image}" alt="${circuito.name}" />
          </div>
          <div class="tarjeta-contenido">
            <h3>${circuito.name_GP}</h3>
            <p>Circuito: ${circuito.name}</p>
            <p>Vueltas: ${circuito.laps} | Longitud: ${circuito.length}</p>
            <p>Récord: ${circuito.lap_record}</p>
            <a href="#" class="boton">Proximamente...</a>
          </div>
        `;
        contenedor.appendChild(tarjeta);
      });
    })
    .catch((error) => {
      console.error("Error cargando el JSON:", error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  initTarjetas(); // Lanza el intento
});
