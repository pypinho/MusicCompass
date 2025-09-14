
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

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const g = svg.append("g");

    const genreNodes = [];
    const subGenreNodes = [];
    const artistNodes = [];
    const genreLinks = [];

    for (const genreName in data.genres) {
        genreNodes.push({ name: genreName, type: 'genre', genreType: 'main' });
        for (const subGenreName of data.genres[genreName].subgenres) {
            subGenreNodes.push({ name: subGenreName, type: 'genre', genreType: 'sub' });
            genreLinks.push({ source: subGenreName, target: genreName, type: 'subgenre-link' });
        }
    }

    data.artists.forEach(artist => {
        artistNodes.push({ ...artist, type: 'artist' });
        artist.subgenres.forEach(subGenreName => {
            // Check if the subgenre exists before creating a link
            if (subGenreNodes.find(sg => sg.name === subGenreName)) {
                genreLinks.push({ source: artist.name, target: subGenreName, type: 'artist-link' });
            }
        });
    });

    const allNodes = [...genreNodes, ...subGenreNodes, ...artistNodes];

    const simulation = d3.forceSimulation(allNodes)
        .force("link", d3.forceLink(genreLinks).id(d => d.name)
            .distance(d => d.type === 'artist-link' ? 40 : 80)
            .strength(d => d.type === 'artist-link' ? 0.3 : 0.8))
        .force("charge", d3.forceManyBody().strength(-800))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(d => (d.type === 'genre' ? (d.genreType === 'main' ? 50 : 25) : 10) + 4));

    for (let i = 0; i < 300; ++i) { simulation.tick(); }
    simulation.stop();

    const link = g.append("g").attr("stroke", "#999").attr("stroke-opacity", 0.6).selectAll("line").data(genreLinks).join("line").attr("stroke-width", d => d.type === 'maingenre-link' ? 2.5 : 1).attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
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
