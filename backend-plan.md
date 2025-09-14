# Backend Development Plan: MusicCompass

This document outlines the plan for developing the backend of the MusicCompass application.

## 1. Core Technologies

*   **Framework:** Node.js with Express.js
*   **Database:** Neo4j
*   **API Design:** RESTful with OpenAPI (Swagger) documentation
*   **Authentication (Post-MVP):** JWT (JSON Web Tokens)

## 2. Project Structure

```
/src
  /api
    /routes
      genres.js
      artists.js
      (users.js)
    /controllers
      genreController.js
      artistController.js
      (userController.js)
    /middlewares
      (auth.js)
      errorHandler.js
  /config
    db.js
    (jwt.js)
  /services
    geminiService.js
  /models (re-thinking this for Neo4j, will be queries)
  app.js
  server.js
```

## 3. MVP Features

The MVP will focus on providing the data for the frontend.

### 3.1. RESTful API

*   **Endpoints:**
    *   `GET /api/genres`: Get all genres.
    *   `GET /api/genres/:id`: Get a specific genre by ID.
    *   `GET /api/artists`: Get all artists.
    *   `GET /api/artists/:id`: Get a specific artist by ID.
*   **Controllers:**
    *   `genreController.js`: Handle the logic for genre-related requests.
    *   `artistController.js`: Handle the logic for artist-related requests.
*   **Database Integration:**
    *   The controllers will query the Neo4j database to get the data.
    *   We will use the official Neo4j driver for Node.js.

### 3.2. Gemini Integration (Internal)

*   **Service:** `geminiService.js`
*   **Functionality:**
    *   Create a service to interact with the Gemini CLI.
    *   This service will be used internally by the development team to populate the database with initial descriptions for artists and genres.
    *   It will not be exposed as a public API endpoint in the MVP.

## 4. Post-MVP Features

*   **Community Features:**
    *   `POST /api/artists`: Propose a new artist.
    *   `POST /api/genres`: Propose a new genre.
    *   `POST /api/artists/:id/vote`: Vote on an artist's genre.
*   **Authentication:**
    *   Implement user registration and login.
    *   Protect the community feature endpoints with JWT authentication.
*   **AI Features:**
    *   `GET /api/recommendations`: Get personalized recommendations.
    *   Expose the Gemini-powered relationship analysis through the API.

## 5. Development Steps

1.  **Setup:** Initialize the Node.js project and install `express`, `neo4j-driver`, and other dependencies.
2.  **Database Connection:** Configure the connection to the Neo4j database.
3.  **API Routes:** Define the API routes for genres and artists.
4.  **Controllers:** Implement the controllers with the logic to query the database.
5.  **Gemini Service:** Develop the `geminiService.js` for internal use.
6.  **API Documentation:** Create an OpenAPI (Swagger) specification for the API.
7.  **Testing:** Implement unit and integration tests for the API endpoints.
