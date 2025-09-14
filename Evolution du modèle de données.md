## Phase 1 : La Fondation des Données (Détaillée) 🏛️
Objectif : Créer une base de données Neo4j propre et structurée à partir de ton fichier JSON de 26 000 artistes.

Étape 1.1 : Préparation de la Base de Données

Ouvre Neo4j Desktop.
Dans ton projet, arrête ta base de données actuelle si elle est en cours d'exécution.
Clique sur "Add Database" -> "Create a new database".
Nomme-la MusicMapTagsDB, donne-lui un mot de passe, et démarre-la. C'est sur cette base propre que nous allons travailler.

Étape 1.2 : Script de Transformation (Python/Pandas)
Crée un fichier nommé transformer_donnees.py et colle-y le code suivant. Il est conçu pour lire ton JSON et générer les 3 CSV nécessaires.

Python

import json
import pandas as pd

# Charger le fichier JSON source
with open('musicbrainz_metal_bands_26000.json', 'r', encoding='utf-8') as f:
    data = json.load()

artistes_data = []
relations_data = []
all_tags = set()

print(f"Début du traitement de {len(data)} artistes...")

# Parcourir chaque artiste dans le JSON
for artist in data:
    # 1. Extraire les informations de l'artiste
    artist_info = {
        'artistId': artist.get('id'),
        'name': artist.get('name'),
        'country': artist.get('country'),
        # Gérer les cas où 'life-span' ou 'begin' n'existent pas
        'beginDate': artist.get('life-span', {}).get('begin'),
        'endDate': artist.get('life-span', {}).get('end')
    }
    artistes_data.append(artist_info)

    # 2. Parcourir les tags de cet artiste pour créer les relations
    if 'tags' in artist and artist['tags'] is not None:
        for tag in artist['tags']:
            relation_info = {
                'artistId': artist.get('id'),
                'tagName': tag.get('name'),
                'count': tag.get('count')
            }
            relations_data.append(relation_info)
            all_tags.add(tag.get('name'))

print("Traitement terminé. Création des fichiers CSV...")

# Créer les DataFrames avec Pandas
df_artistes = pd.DataFrame(artistes_data)
df_relations = pd.DataFrame(relations_data)
df_tags = pd.DataFrame(list(all_tags), columns=['tagName'])

# Exporter en CSV
df_artistes.to_csv('artistes.csv', index=False)
df_relations.to_csv('relations.csv', index=False)
df_tags.to_csv('tags.csv', index=False)

print("Fichiers artistes.csv, tags.csv, et relations.csv créés avec succès !")

Étape 1.3 : Importation en Masse (Neo4j)

Localiser le dossier d'import : Dans Neo4j Desktop, pour ta nouvelle base MusicMapTagsDB, clique sur les trois points (...) -> "Open folder" -> "Import". C'est ici que tu dois copier/coller tes 3 fichiers CSV fraîchement créés.

Exécuter les requêtes Cypher : Ouvre le Neo4j Browser. Copie et exécute chaque bloc de code ci-dessous, l'un après l'autre.

Bloc 1 : Contraintes (essentiel pour la performance)

Cypher

CREATE CONSTRAINT IF NOT EXISTS FOR (a:Artiste) REQUIRE a.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (t:Tag) REQUIRE t.nom IS UNIQUE;
Bloc 2 : Importer les artistes

Cypher

LOAD CSV WITH HEADERS FROM 'file:///artistes.csv' AS row
CREATE (a:Artiste {id: row.artistId, nom: row.name, pays: row.country, annee_debut: toInteger(row.beginDate)});
Bloc 3 : Importer les tags uniques

Cypher

LOAD CSV WITH HEADERS FROM 'file:///tags.csv' AS row
CREATE (t:Tag {nom: row.tagName});
Bloc 4 : Créer les relations pondérées

Cypher

LOAD CSV WITH HEADERS FROM 'file:///relations.csv' AS row
MATCH (a:Artiste {id: row.artistId})
MATCH (t:Tag {nom: row.tagName})
CREATE (a)-[:POSSÈDE_LE_TAG {count: toInteger(row.count)}]->(t);
## Phase 2 : Le Cerveau du Projet - L'API Backend (Détaillée) 🧠
Objectif : Construire un serveur Node.js/Express qui expose des routes pour que ton frontend puisse consommer les données du graphe.

Étape 2.1 : Initialisation du Projet API

Dans ton terminal (via WSL), crée un dossier pour ton API : mkdir musicmap-api && cd musicmap-api

Initialise un projet Node.js : npm init -y

Installe les dépendances : npm install express neo4j-driver

Crée un fichier server.js et colle-y ce code de démarrage :

JavaScript

const express = require('express');
const neo4j = require('neo4j-driver');

const app = express();
const port = 5000; // Port pour l'API

// Remplace avec tes identifiants Neo4j
const driver = neo4j.driver(
    'bolt://localhost:7687',
    neo4j.auth.basic('neo4j', 'ton-mot-de-passe')
);

app.get('/', (req, res) => {
    res.send('API MusicMap est en ligne !');
});

// Nos futures routes iront ici...

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
Étape 2.2 : Implémentation des Endpoints

Ajoute ce code dans ton server.js (à la place du commentaire // Nos futures routes...).

JavaScript

// Endpoint 1 : Vue d'ensemble (les "capitales")
app.get('/api/graph/overview', async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (t:Tag)<-[r:POSSÈDE_LE_TAG]-()
            RETURN t.nom AS name, count(r) AS connections
            ORDER BY connections DESC
            LIMIT 15
        `);
        const tags = result.records.map(record => ({
            name: record.get('name'),
            connections: record.get('connections').low // .low pour obtenir le nombre
        }));
        res.json(tags);
    } catch (error) {
        res.status(500).send(error.message);
    } finally {
        await session.close();
    }
});

// Endpoint 2 : Vue régionale (les sous-régions)
app.get('/api/graph/region/:tagName', async (req, res) => {
    const { tagName } = req.params;
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (tag:Tag {nom: $tagName})<-[:POSSÈDE_LE_TAG]-(artiste:Artiste)-[:POSSÈDE_LE_TAG]->(autre_tag:Tag)
            WHERE autre_tag.nom <> $tagName
            RETURN autre_tag.nom AS name, count(*) AS frequency
            ORDER BY frequency DESC
            LIMIT 10
        `, { tagName });
        const relatedTags = result.records.map(record => ({
            name: record.get('name'),
            frequency: record.get('frequency').low
        }));
        res.json(relatedTags);
    } catch (error) {
        res.status(500).send(error.message);
    } finally {
        await session.close();
    }
});

// Tu ajouteras l'Endpoint 3 (Vue locale) en suivant le même modèle.
Démarre ton serveur : node server.js. Tu peux maintenant tester tes routes dans ton navigateur (ex: http://localhost:5000/api/graph/overview).

## Phase 3 : L'Expérience Visuelle - Le Frontend (Détaillée) ✨
Objectif : Adapter ton application React/D3 pour qu'elle consomme cette nouvelle API et affiche les données par niveaux de zoom.

Étape 3.1 : Création d'un Hook de Récupération de Données

Dans ton projet React, crée un fichier hooks/useApi.js. Ce hook réutilisable simplifiera tes appels API.

JavaScript

import { useState, useEffect } from 'react';

export function useApi(url) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!url) return;
        setLoading(true);
        fetch(url)
            .then(response => response.json())
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false));
    }, [url]); // Se redéclenche si l'URL change

    return { data, loading, error };
}
Étape 3.2 : Implémentation du Zoom Intelligent (Logique)

Dans ton composant Map.js, tu vas gérer l'URL de l'API à appeler dans un état, et la mettre à jour en fonction du zoom.

JavaScript

// Dans ton composant Map.js
import { useApi } from '../hooks/useApi';

// ...
const [apiUrl, setApiUrl] = useState('/api/graph/overview');
const { data, loading } = useApi(apiUrl);

useEffect(() => {
    // C'est ici que tu initialises D3 et que tu mets en place le gestionnaire de zoom.
    const zoomHandler = (event) => {
        const zoomLevel = event.transform.k;

        // Logique de pseudo-code pour changer l'API appelée
        if (zoomLevel < 1.5) {
            setApiUrl('/api/graph/overview');
        } else if (zoomLevel < 3.0) {
            // Ici, il te faudrait identifier le tag le plus proche du centre...
            // Pour commencer, on peut le faire au clic.
            // setApiUrl(`/api/graph/region/death%20metal`); // Exemple
        }
        // etc...
    };

    // ... attacher zoomHandler à ton d3.zoom
}, []); // Lance une seule fois

useEffect(() => {
    if (data && !loading) {
        // Ici, mets à jour ta visualisation D3 avec les nouvelles données (data)
        drawGraph(data);
    }
}, [data, loading]); // Se redéclenche quand les données arrivent

// ...
Étape 3.3 : Ajout de l'Interactivité (Exemple mouseover)

Dans ta fonction qui dessine les nœuds D3 (drawGraph), ajoute la logique de survol.

JavaScript

// Extrait de ta logique D3
nodes.on('mouseover', function(event, d) {
    // Récupère les voisins de 'd' à partir de tes données de liens
    const neighborIds = links
        .filter(link => link.source.id === d.id || link.target.id === d.id)
        .map(link => (link.source.id === d.id ? link.target.id : link.source.id));

    // Estompe tout
    d3.selectAll('.node').style('opacity', 0.2);
    d3.selectAll('.link').style('opacity', 0.1);

    // Rallume le nœud survolé et ses voisins
    d3.selectAll('.node')
        .filter(node => node.id === d.id || neighborIds.includes(node.id))
        .style('opacity', 1);

    // Rallume les liens connectés
    d3.selectAll('.link')
        .filter(link => link.source.id === d.id || link.target.id === d.id)
        .style('opacity', 1);
})
.on('mouseout', function() {
    // Réinitialise l'opacité de tout le graphe
    d3.selectAll('.node, .link').style('opacity', 1);
});
