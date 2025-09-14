# Frontend Development Plan: MusicCompass

This document outlines the plan for developing the frontend of the MusicCompass application.

## 1. Core Technologies

*   **Framework:** React
*   **Bootstrapping:** Create React App
*   **Map Visualization:** D3.js
*   **UI Components:** Material-UI
*   **State Management:** React Context API (for MVP)
*   **API Communication:** axios

## 2. Project Structure

We will follow the standard Create React App folder structure:

```
/public
/src
  /assets
    /images
    /styles
  /components
    /map
      Map.js
      MapNode.js
      MapLink.js
    /ui
      ArtistInfoSheet.js
      GenreInfoSheet.js
      Header.js
      Loader.js
  /hooks
    useMapData.js
  /services
    api.js
  /views
    MapView.js
  App.js
  index.js
```

## 3. MVP Features

The MVP will focus on the core exploration experience.

### 3.1. Interactive Map

*   **Component:** `Map.js`
*   **Functionality:**
    *   Render the map using D3.js.
    *   Display genre territories as distinct areas.
    *   Display artists as nodes within their respective genres.
    *   Implement zoom and pan functionality.
    *   **Multi-level Zoom and Progressive Disclosure:**
        *   **Overview Level:** Display only major genres and their most prominent bands. Genre territories will be clearly defined.
        *   **Mid-Zoom Level:** As the user zooms into a major genre, its sub-genres become visible, along with a larger selection of bands within those sub-genres.
        *   **Detail Level:** At the deepest zoom, all available bands within a specific sub-genre are displayed, potentially with more detailed visual representations.
    *   Handle clicks on artists and genres.

### 3.2. Information Sheets

*   **Components:** `ArtistInfoSheet.js`, `GenreInfoSheet.js`
*   **Functionality:**
    *   Display information about the selected artist or genre.
    *   The sheet will be a modal or a side panel.
    *   It will show the description, key discography, and links.

### 3.3. Data Fetching

*   **Service:** `api.js`
*   **Functionality:**
    *   Create a service to fetch data from the backend API.
    *   Use `axios` to make GET requests to the `/genres` and `/artists` endpoints.
    *   Implement a custom hook `useMapData.js` to fetch and manage the map data.

## 4. Post-MVP Features

*   **Community Features:**
    *   Voting system for artist genre belonging.
    *   Forms for proposing new artists and genres.
*   **AI Features:**
    *   Displaying AI-suggested "rivers of influence".
    *   Personalized discovery routes.
*   **State Management:**
    *   Migrate to Redux or MobX for more complex state management.

## 5. Development Steps

1.  **Setup:** Initialize the React project using `create-react-app`.
2.  **Dependencies:** Install `d3`, `material-ui`, and `axios`.
3.  **Map Component:** Develop the core `Map.js` component with basic rendering and navigation.
4.  **API Integration:** Implement the `api.js` service and the `useMapData.js` hook.
5.  **Information Sheets:** Create the `ArtistInfoSheet.js` and `GenreInfoSheet.js` components.
6.  **Integration:** Connect the map clicks to display the information sheets.
7.  **Styling:** Apply the "fantasy" theme to the map and UI components.
