# Project Specifications

## Functional Specifications: Interactive Map of Music Genres (Version 1.0)

### 1. Project Overview 🗺️
The project aims to create a web platform for visualizing music data in the form of an interactive map with a specific style for each genre (e.g., “fantasy” for metal, “baroque” for classical music). Each music genre is represented as a “territory” or ‘region’ with its own visual identity. Artists are “points of interest” on this map. The goal is to allow users to explore the complex relationships between genres, discover new artists, and participate in the evolution of the map as a community.

### 2. Key Features ✨

#### 2.1. Visualization and Exploration
*   [x] **Interactive Map:** The main interface is a navigable 2D map (zoom, pan).
    *   *Update:* Implemented a stable D3.js force-directed layout. The simulation computes node positions and then stops, allowing for smooth, user-controlled navigation without constant node movement. The view automatically centers on a key genre on startup.
*   [x] **Level of Detail (LOD):** The map uses a multi-level zoom to manage visual complexity.
    *   Zoom out: Only major genres are visible.
    *   Mid-zoom: Sub-genres appear.
    *   Zoom in: Artists appear around their respective genres.
*   [ ] **Genre Territories:** Each major musical genre (e.g., “The Kingdom of Heavy Metal,” “The Forests of Folk”) is a distinct region with a unique graphic style (colors, textures, icons).
*   [ ] **Transitions and Influences:** The boundaries between genres are not clear-cut. They are represented by gradient zones or “transition lands” (e.g., a swampy area between Blues and Rock). “Rivers of influence” could visually connect distant but related genres (e.g., the river of “African Rhythm” irrigating Blues, Jazz, and Rock).
*   [x] **Points of Interest (Artists):** When zooming in on a territory, the names of artists appear. Hovering over an artist opens a tooltip with their name.
*   [ ] **Information Sheet:** Clicking on an artist or genre opens a detailed information sheet (description, key discography, listening links, and, most importantly, connections to other genres/artists).

#### 2.2. Community Interaction and Contribution
*   [ ] **Belonging Voting System:**
    *   On each artist's page, users can vote to confirm their belonging to the region's main genre.
    *   Idea: Offer several “shades” of voting. Instead of a simple “yes/no,” users could vote on sliders: [Purely Rock] <--- --> [On the border of Blues]. The average position of all votes would define the artist's exact location on the map.
*   [ ] **Proposing New Artists:**
    *   Users can submit a new artist via a simple form (artist name, Spotify/MusicBrainz link, and suggested genre/territory to place them in).
    *   The proposal appears on the map as a “seed” or “pending suggestion” visible to others.
    *   A number of positive votes from the community (threshold to be defined, e.g., 10 votes) validates the addition of the artist.
*   [ ] **Proposing New Genres:**
    *   More advanced feature for experienced users.
    *   A user can propose a new subgenre (e.g., “Symphonic Metal”) by “claiming” a small area at the border of existing genres (e.g., between Heavy Metal and Classical Music).
    *   This proposal is also submitted to a community vote.

#### 2.3. AI Features (with Gemini)
*   [ ] **Description Generation:** Gemini can be used to automatically generate an initial description for artist or genre pages based on scraped data, which the community can then refine.
*   [ ] **Relationship Analysis:** AI can help suggest “links of influence” between artists or genres by analyzing textual data (biographies, music reviews), thus proposing new “rivers of influence” to trace on the map.
*   [ ] **Personalized Recommendations:** Idea: A user could say, “I'm a fan of Pink Floyd and Tame Impala,” and the AI would plot a “discovery route” on the map, highlighting other artists and genres they might like.

## Technical Specifications 💻
*   [x] **Frontend:** React with D3.js for force-directed graph visualization.
*   [ ] **Backend:** RESTful API developed with Node.js and the Express.js framework.
*   [ ] **Database:** Neo4j (graph-oriented database) to natively model the relationships between Artists, Genres, Albums, and Influences.
*   [x] **Data collection:** Scraping scripts (Python with BeautifulSoup/Scrapy) to collect initial data from sources such as Wikipedia, MusicBrainz, or Discogs.
    *   *Update:* Implemented Python scraping scripts for MusicBrainz.
*   [x] **AI & Automation:** Gemini CLI (via the gcloud SDK) integrated into backend scripts for data cleaning, content generation, and analysis.

## MVP (Minimum Viable Product) 🚀
For the first version, let's focus on the essentials to get the project off the ground quickly:
1.  [ ] A single main genre and its most direct sub-genres (e.g. "Rock" territory with "Progressive Rock", "Hard Rock" and "Psychedelic Rock" regions).
2.  [x] Pre-populated database with around 50-100 emblematic artists for this region.
    *   *Update:* Database now pre-populated with approximately 1000 metal bands.
3.  [x] Map display with navigation (zoom/move) and clickable information sheets.
4.  [ ] No community contribution at launch. The aim is first to validate the exploration experience. The voting and proposal system will be the first major post-MVP update.
5.  [x] Internal use of Gemini only, to help you build the initial database.