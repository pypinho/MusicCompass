# MusicCompass - Phase 2: Metal Music Universe

This document outlines the action plan for the second phase of the MusicCompass project, focusing on the Metal genre.

## 1. Data Scraping (Metal Genre)

The goal is to populate the database with a rich dataset of around 100 metal bands and their relationships.

*   [x] **Enhance Scraper:** Updated `data-scraping/musicbrainz_scraper.py` to target MusicBrainz for metal bands.
*   [x] **Band Extraction:** Implemented logic to scrape approximately 1000 bands from the Metal genre and its various subgenres, saved to `musicbrainz_metal_bands_1000.json`.
*   [ ] **Relationship Extraction:** Implement logic to identify and extract relationships between bands, such as influences and subgenre connections.
*   [x] **Data Population Script:** Created a new Python script, `populate_metal.py`, to process the scraped data and load it into the Neo4j database.
*   [x] **Execute Scraping and Population:** Ran the scraper and the population script to fill the database with the new data.

## 2. Frontend Enhancements

The goal is to create a compelling graphical visualization of the metal music universe.

*   [x] **Handle More Data:** Updated `frontend/src/components/map/Map.js` to efficiently handle a larger number of data points.
*   [x] **Force-Directed Layout:** Implemented a D3.js force-directed layout to automatically position the band and genre nodes based on their relationships.
    *   [x] Fixed "node not found" error by ensuring all genre nodes are properly initialized.
    *   [x] Improved stability of the force-directed layout by increasing `alphaDecay`.
*   [x] **Add Labels:** Added text labels to the nodes to display the names of the bands and genres.
*   [x] **Visualize Relationships:** Draw lines (links) between the nodes to represent the influence and subgenre relationships.
*   [x] **Interactive Info:** Implement click events on the nodes to display detailed information about the selected band or genre in the info sheets.
    *   [x] Fixed React `useEffect` dependency warning for tooltip visibility.
*   [ ] **Styling:** Enhance the visual styling of the nodes and links to make the graph clear, informative, and visually appealing.

## 3. User Experience Enhancement

This phase focuses on resolving critical UX issues with the map visualization and improving the overall user journey.

### Étape 1 : Résoudre l'urgence (La "pelote" et le bug de zoom) 🎯

*   **Objectif:** Ces actions vont directement s'attaquer au rendu confus et aux mouvements non souhaités.
*   **Actions:**
    *   **1.1. Maîtriser la Surcharge Visuelle : Moins, c'est Plus**
        *   [x] **Clustering des Genres :** Au lieu d'afficher 1000 artistes, commencer par afficher uniquement les genres et sous-genres principaux. Chaque genre est un "méta-nœud".
        *   [x] **Affichage au Zoom (Level of Detail) :**
            *   Niveau 1 (dézoomé) : Affiche uniquement les clusters de genres principaux.
            *   Niveau 2 (intermédiaire) : En zoomant sur un cluster, les sous-genres apparaissent.
            *   Niveau 3 (zoomé) : En zoomant encore, les artistes apparaissent autour de leur sous-genre.
        *   [x] Les labels (noms) ne doivent apparaître qu'à un niveau de zoom où ils sont lisibles.
    *   **1.2. Corriger le Comportement du Zoom et du Drag**
        *   [x] **Séparer le zoom de la simulation :**
            *   Créer un élément `<g>` à l'intérieur du SVG.
            *   Ajouter tous les nœuds et liens à l'intérieur de ce groupe `<g>`.
            *   Appliquer `d3.zoom()` uniquement sur l'élément SVG principal.
            *   Appliquer la transformation de zoom uniquement à l'attribut `transform` du groupe `<g>`.
*   **Résultats et ajustements :**
    *   La simulation est maintenant stable et ne se met plus à jour en continu, ce qui permet une navigation fluide.
    *   Les forces ont été ajustées pour un rendu plus compact.
    *   La vue initiale est maintenant centrée automatiquement sur le genre "Rock" avec un niveau de zoom lisible.

### Étape 2 : Améliorer l'Exploration et l'Interaction 🧭

*   **Objectif:** Rendre la carte plus engageante et informative.
*   **Actions:**
    *   (À définir)

### Étape 3 : Transition vers la "Carte Fantasy" 🗺️

*   **Objectif:** Faire évoluer le style visuel de la carte pour correspondre au thème "fantasy".
*   **Actions:**
    *   (À définir)