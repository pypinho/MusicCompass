
import json
import subprocess

def extract_unique_genres(file_path):
    """
    Extracts unique genres from the musicbrainz json file.
    """
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    all_genres = set()
    for artist in data:
        for genre in artist.get('tags', []):
            all_genres.add(genre)
            
    return list(all_genres)

def main():
    genres = extract_unique_genres('/home/pypinho/MusicCompass/data-scraping/musicbrainz_metal_bands_1000.json')
    
    # Call the Node.js script to get the genre hierarchy
    result = subprocess.run(
        ['node', '/home/pypinho/MusicCompass/backend/src/services/get_hierarchy_cli.js'] + genres,
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        genre_hierarchy = json.loads(result.stdout)
        # Save the hierarchy to a file
        with open('/home/pypinho/MusicCompass/data-scraping/genre_hierarchy.json', 'w') as f:
            json.dump(genre_hierarchy, f, indent=4)
    else:
        print("Error getting genre hierarchy:", result.stderr)

if __name__ == "__main__":
    main()
