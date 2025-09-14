# Data & AI Plan: MusicCompass

This document outlines the plan for managing the data and integrating AI features in the MusicCompass application.

## 1. Data Model (Neo4j)

We will use a graph data model to represent the music universe.

### 1.1. Nodes

*   **`Genre`**: Represents a music genre.
    *   `name`: String (e.g., "Heavy Metal")
    *   `description`: String
    *   `style`: JSON (e.g., `{ "color": "#333", "texture": "metal.png" }`)
*   **`Artist`**: Represents a musical artist.
    *   `name`: String (e.g., "Iron Maiden")
    *   `description`: String
    *   `spotify_id`: String
    *   `musicbrainz_id`: String
*   **`Album`**: Represents an album.
    *   `title`: String
    *   `release_year`: Integer
*   **`User` (Post-MVP)**: Represents a user of the platform.
    *   `username`: String
    *   `email`: String
    *   `password_hash`: String

### 1.2. Relationships

*   **`:SUBGENRE_OF`**: Connects a sub-genre to its parent genre (e.g., `(Symphonic Metal)-[:SUBGENRE_OF]->(Heavy Metal)`).
*   **`:INFLUENCED_BY`**: Represents an influence relationship between genres or artists (e.g., `(Rock)-[:INFLUENCED_BY]->(Blues)`).
*   **`:ARTIST_IN_GENRE`**: Places an artist within a genre (e.g., `(Iron Maiden)-[:ARTIST_IN_GENRE]->(Heavy Metal)`).
*   **`:RELEASED_ALBUM`**: Connects an artist to their albums.
*   **`:VOTED_FOR` (Post-MVP)**: Represents a user's vote.
*   **`:PROPOSED_ARTIST` (Post-MVP)**: Represents a user's proposal for a new artist.

## 2. Data Scraping

*   **Technology:** Python with Scrapy and the `neo4j` Python driver.
*   **Sources:**
    *   Wikipedia
    *   MusicBrainz
    *   Discogs
*   **Process:**
    1.  Create a Scrapy project with spiders for each data source.
    2.  The spiders will crawl the websites and extract information about genres, artists, and their relationships.
    3.  The extracted data will be cleaned and formatted.
    4.  A script will then connect to the Neo4j database and populate it with the scraped data.
*   **MVP Goal:** Populate the database with 50-100 artists for a single genre and its sub-genres.

## 3. AI Integration (Gemini)

### 3.1. MVP: Internal Use

*   **Description Generation:**
    *   We will use the Gemini CLI to generate initial descriptions for artists and genres.
    *   The process will be:
        1.  Scrape basic information about an artist/genre.
        2.  Use a prompt to ask Gemini to write a description based on that information.
        3.  Store the generated description in the Neo4j database.

### 3.2. Post-MVP: Public Features

*   **Relationship Analysis:**
    *   Use Gemini to analyze biographies and music reviews to suggest new `:INFLUENCED_BY` relationships.
    *   These suggestions will be presented to the community for validation.
*   **Personalized Recommendations:**
    *   Create a feature where a user can input their favorite artists.
    *   The backend will send a prompt to Gemini with the user's preferences.
    *   Gemini will return a list of recommended artists and genres.
    *   The frontend will then highlight a "discovery route" on the map.

## 4. Development Steps

1.  **Schema Design:** Finalize the Neo4j graph schema.
2.  **Scraping Scripts:** Develop the Python scripts to scrape the initial data.
3.  **Database Population:** Run the scraping scripts to populate the MVP database.
4.  **Gemini Integration (Internal):** Develop the `geminiService.js` in the backend to generate descriptions.
5.  **Post-MVP:**
    *   Develop the community validation system for AI suggestions.
    *   Implement the personalized recommendation feature.
