import requests
import json
import time

BASE_URL = "https://musicbrainz.org/ws/2/"
ARTIST_ENDPOINT = "artist/"

def search_musicbrainz(query, limit=100, offset=0):
    params = {
        "query": query,
        "fmt": "json",
        "limit": limit,
        "offset": offset
    }
    headers = {
        "User-Agent": "MusicCompass/1.0 ( pypinho@example.com )" # Replace with a real email in production
    }

    # MusicBrainz API has a rate limit of 1 request per second for non-authenticated requests.
    # We'll add a delay to respect this.
    time.sleep(1)

    response = requests.get(f"{BASE_URL}{ARTIST_ENDPOINT}", params=params, headers=headers)
    response.raise_for_status() # Raise an exception for HTTP errors
    return response.json()

def process_artists_data(artists_data):
    processed_bands = []
    for artist in artists_data:
        name = artist.get("name")
        artist_type = artist.get("type")
        score = artist.get("score")
        tags = [tag.get("name") for tag in artist.get("tags", [])]

        # Filter for groups and check for relevant metal tags
        # We'll consider an artist "metal" if any of their tags contain "metal"
        # or if they have specific metal subgenre tags.
        is_metal = False
        metal_keywords = ["metal", "thrash", "death", "black", "doom", "power", "grind", "heavy"]
        for tag in tags:
            if any(keyword in tag.lower() for keyword in metal_keywords):
                is_metal = True
                break

        if artist_type == "Group" and is_metal:
            processed_bands.append({
                "name": name,
                "id": artist.get("id"),
                "country": artist.get("area", {}).get("name"), # Extract country if available
                "tags": tags,
                "score": score,
                "disambiguation": artist.get("disambiguation")
            })
    return processed_bands

def main():
    all_metal_bands = []
    limit = 100
    offset = 0
    total_artists = 1 # Initialize to enter the loop
    MAX_BANDS = 26000 # Set maximum number of bands to scrape

    # Initial broad search for "metal" tag
    # We will refine filtering in process_artists_data
    query = "tag:metal"

    while offset < total_artists and len(all_metal_bands) < MAX_BANDS:
        print(f"Fetching artists from offset {offset}...")
        data = search_musicbrainz(query=query, limit=limit, offset=offset)
        total_artists = data.get("count", 0)
        artists = data.get("artists", [])

        if not artists:
            break # No more artists

        processed_bands = process_artists_data(artists)
        all_metal_bands.extend(processed_bands)

        offset += limit
        print(f"Total metal bands found so far: {len(all_metal_bands)} (out of estimated {total_artists})")

    # Truncate to MAX_BANDS if more were collected
    all_metal_bands = all_metal_bands[:MAX_BANDS]

    output_file = "/home/pypinho/MusicCompass/data-scraping/musicbrainz_metal_bands_26000.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_metal_bands, f, ensure_ascii=False, indent=4)
    print(f"Successfully scraped {len(all_metal_bands)} metal bands from MusicBrainz and saved to {output_file}")

if __name__ == "__main__":
    main()
