<h1 align="center"> 🏁 F1nalLap 🏎️ </h1>

<p align="center">
  <a href="https://github.com/Ixo22/F1nalLap/actions/workflows/ci.yml"><img src="https://github.com/Ixo22/F1nalLap/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
</p>

> Documentación técnica (arquitectura, cómo levantar el entorno, tests, CI): [`F1nalLap/README.md`](./F1nalLap/README.md)

## Descripción
¡Bienvenidos a F1nalLap, una app web dedicada a Fórmula 1!

Este proyecto es el resultado de un apasionado por este deporte para su trabajo de fin de grado. Esta plataforma se ha diseñado para ofrecer a todo aficionado de la F1 una experiencia informativa con capacidad de analizar y predecir datos en tiempo real.

En esta página entcontrarás una amplia gama de información sobre este mundo, asi como la clasificación de pilotos y constructores de la temporada actual, calendario de carreras y sus resultados, detalles de la temporada actual y hasta resúmenes de temporadas pasadas.


## Backend (Spring Boot)
API REST propia en [`backend/`](./backend): Java 21, Spring Boot 4.1, PostgreSQL y Flyway.

Requisitos: JDK 21 y Docker Desktop.

```bash
cd backend
docker compose up --build        # API + Postgres -> http://localhost:8080/actuator/health
./mvnw spring-boot:run           # desde el IDE/terminal: arranca solo Postgres con Docker Compose
./mvnw verify                    # tests (Testcontainers levanta un Postgres real)
```

## Contacto
Puede ponerse en contacto conmigo para cualquier consulta sobre la aplicación F1nalLap por correo electrónico: ```aga1036@alu.ubu.es```

---

## Description
Welcome to F1nalLap, a web app dedicated to Formula 1!

This project is the result of a passionate fan of this sport for his thesis. This platform has been designed to offer every F1 fan an informative experience with the ability to analyze and predict data in real time.

On this page you will find a wide range of information about this world, as well as the drivers and constructors classification of the current season, race calendar and results, details of the current season and even summaries of past seasons.

## Contact
You can contact me for any questions about the F1nalLap application by email: ```aga1036@alu.ubu.es```
