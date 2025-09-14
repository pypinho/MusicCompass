import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import useMapData from '../../hooks/useMapData';

const MusicMap = () => {
  const svgRef = useRef();
  const { data, loading, error } = useMapData();

  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  });

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleResize = useCallback(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    if (loading || error || !data.artists.length) return;

    const { width, height } = dimensions;

    // Helper to normalize genre names (e.g., "death metal" -> "Death Metal")
    const normalizeGenre = (name) => {
        if (typeof name !== 'string' || !name) return 'Uncategorized';
        return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const g = svg.append("g");

    const genreParentMap = Object.fromEntries(
        Object.entries({
            "Death Metal": "Metal",
            "Black Metal": "Metal",
            "Thrash Metal": "Metal",
            "Heavy Metal": "Metal",
            "Power Metal": "Metal",
            "Doom Metal": "Metal",
            "Gothic Metal": "Metal",
            "Symphonic Metal": "Metal",
            "Progressive Metal": "Metal",
            "Folk Metal": "Metal",
            "Industrial Metal": "Metal",
            "Nu Metal": "Metal",
            "Glam Metal": "Metal",
            "Speed Metal": "Metal",
            "Groove Metal": "Metal",
            "Melodic Death Metal": "Death Metal",
            "Technical Death Metal": "Death Metal",
            "Brutal Death Metal": "Death Metal",
            "Viking Metal": "Folk Metal",
            "Pagan Metal": "Folk Metal",
            "Stoner Metal": "Doom Metal",
            "Sludge Metal": "Doom Metal",
            "Grindcore": "Hardcore",
            "Metalcore": "Hardcore",
            "Deathcore": "Hardcore",
            "Hardcore": "Metal",
            "Punk Rock": "Punk",
            // ... etc
        }).map(([key, value]) => [normalizeGenre(key), normalizeGenre(value)])
    );

    const genreToGenreLinks = [
        { source: "Metal", target: "Rock" },
        { source: "Rock", target: "Pop" },
        { source: "Punk", target: "Rock" },
    ].map(link => ({ source: normalizeGenre(link.source), target: normalizeGenre(link.target) }));

    const genreDataMap = new Map();

    // Function to ensure a genre exists in the map
    const ensureGenre = (genreName) => {
        const normalizedName = normalizeGenre(genreName);
        if (!genreDataMap.has(normalizedName)) {
            genreDataMap.set(normalizedName, { name: normalizedName, type: 'genre', artists: [] });
        }
        return genreDataMap.get(normalizedName);
    };

    // Pre-populate map with all known genres
    data.genres.forEach(g => ensureGenre(g.name));
    Object.keys(genreParentMap).forEach(ensureGenre);
    Object.values(genreParentMap).forEach(ensureGenre);
    genreToGenreLinks.forEach(link => {
        ensureGenre(link.source);
        ensureGenre(link.target);
    });

    // Assign genre types (main vs sub)
    const mainGenres = new Set(Object.values(genreParentMap));
    genreDataMap.forEach((genre, name) => {
        genre.genreType = mainGenres.has(name) ? 'main' : 'sub';
    });

    // Process artists and attach them to the CORRECT, NORMALIZED genre
    data.artists.forEach(artist => {
        const rawGenre = artist.genres.length > 0 ? artist.genres[0] : 'Uncategorized';
        const normalizedRawGenre = normalizeGenre(rawGenre);
        const parentGenreName = genreParentMap[normalizedRawGenre] || normalizedRawGenre;
        const targetGenre = ensureGenre(parentGenreName);
        targetGenre.artists.push({ ...artist, type: 'artist', primaryGenre: targetGenre.name });
    });

    const allGenreNodes = Array.from(genreDataMap.values());
    const allArtistNodes = allGenreNodes.flatMap(g => g.artists);
    const allNodes = [...allGenreNodes, ...allArtistNodes];

    allNodes.sort((a, b) => {
        if (a.type === 'artist' && b.type === 'genre') return 1;
        if (a.type === 'genre' && b.type === 'artist') return -1;
        return 0;
    });

    const allLinks = [];
    allGenreNodes.forEach(genre => {
        if (genre.genreType === 'sub') {
            const parent = genreParentMap[genre.name];
            if (parent) {
                allLinks.push({ source: genre.name, target: parent, type: 'subgenre-link' });
            }
        }
    });
    allArtistNodes.forEach(artist => {
        allLinks.push({ source: artist.name, target: artist.primaryGenre, type: 'artist-link' });
    });
    allLinks.push(...genreToGenreLinks.map(l => ({...l, type: 'maingenre-link'})));

    const simulation = d3.forceSimulation(allNodes)
        .force("link", d3.forceLink(allLinks).id(d => d.name)
            .distance(d => d.type === 'artist-link' ? 40 : (d.type === 'subgenre-link' ? 80 : 200))
            .strength(d => d.type === 'artist-link' ? 0.3 : 0.8))
        .force("charge", d3.forceManyBody().strength(-800))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(d => (d.type === 'genre' ? (d.genreType === 'main' ? 50 : 25) : 10) + 4));

    for (let i = 0; i < 300; ++i) { simulation.tick(); }
    simulation.stop();

    const link = g.append("g").attr("stroke", "#999").attr("stroke-opacity", 0.6).selectAll("line").data(allLinks).join("line").attr("stroke-width", d => d.type === 'maingenre-link' ? 2.5 : 1).attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    const node = g.append("g").selectAll("circle").data(allNodes).join("circle").attr("r", d => d.type === 'genre' ? (d.genreType === 'main' ? 50 : 25) : 10).attr("fill", d => d.type === 'artist' ? 'IndianRed' : (d.genreType === 'main' ? 'SteelBlue' : 'LightSkyBlue')).attr("stroke", '#fff').attr("stroke-width", 1.5).attr('cx', d => d.x).attr('cy', d => d.y).call(drag(simulation)).on("mouseover", (event, d) => setTooltip({ visible: true, x: event.pageX + 10, y: event.pageY + 10, content: d.name })).on("mousemove", (event) => { if (tooltip.visible) { setTooltip(prev => ({ ...prev, x: event.pageX + 10, y: event.pageY + 10 })); } }).on("mouseout", () => setTooltip(prev => ({ ...prev, visible: false })));
    const label = g.append("g").selectAll("text").data(allNodes).join("text").text(d => d.name).attr("class", "label").style("pointer-events", "none").style("font-size", d => d.type === 'genre' ? (d.genreType === 'main' ? '20px' : '12px') : '10px').style("font-weight", d => d.type === 'genre' && d.genreType === 'main' ? 'bold' : 'normal').attr('x', d => d.x + (d.type === 'genre' ? (d.genreType === 'main' ? 55 : 30) : 15)).attr('y', d => d.y + 5);

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("cx", d => d.x).attr("cy", d => d.y);
        label.attr("x", d => d.x + (d.type === 'genre' ? (d.genreType === 'main' ? 55 : 30) : 15)).attr("y", d => d.y + 5);
    });

    function drag(simulation) {
        function dragstarted(event, d) { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }
        function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
        function dragended(event, d) { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }
        return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
    }

    const zoom = d3.zoom().scaleExtent([0.05, 10]).on("zoom", (event) => {
        g.attr("transform", event.transform);
        const { k } = event.transform;
        const subGenreThreshold = 0.4;
        const artistThreshold = 1.0;

        node.style("display", d => {
            if (d.type === 'artist') return k > artistThreshold ? 'inline' : 'none';
            if (d.type === 'genre' && d.genreType === 'sub') return k > subGenreThreshold ? 'inline' : 'none';
            return 'inline';
        });
        label.style("display", d => {
            if (d.type === 'artist') return k > artistThreshold + 0.2 ? 'inline' : 'none';
            if (d.type === 'genre' && d.genreType === 'sub') return k > subGenreThreshold + 0.1 ? 'inline' : 'none';
            if (d.type === 'genre' && d.genreType === 'main') return k > 0.1 ? 'inline' : 'none';
            return 'none';
        });
        link.filter(d => d.type !== 'maingenre-link').style("display", d => k > subGenreThreshold ? 'inline' : 'none');
    });

    svg.call(zoom);

    const rockNode = allNodes.find(n => n.name === 'Rock');
    if (rockNode) {
        const initialScale = 0.3;
        const initialTransform = d3.zoomIdentity.translate(width / 2, height / 2).scale(initialScale).translate(-rockNode.x, -rockNode.y);
        svg.call(zoom.transform, initialTransform);
    } else {
        svg.call(zoom.transform, d3.zoomIdentity);
    }

  }, [data, loading, error, dimensions]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data</p>;

  return (
    <>
      <svg ref={svgRef}></svg>
      {tooltip.visible && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            background: 'white',
            border: '1px solid black',
            padding: '5px',
            pointerEvents: 'none', // Important to allow mouse events on elements below
          }}
        >
          {tooltip.content}
        </div>
      )}
    </>
  );
};

export default MusicMap;