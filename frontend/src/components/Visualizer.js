import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as d3 from 'd3';
import { selectNode } from '../features/ui/uiSlice'; 
import { fetchCharacters } from '../features/characters/characterSlice';

const Visualizer = () => {
    console.log('Visualizer is loading');
    const svgRef = useRef(null);
    const dispatch = useDispatch();

    // Fetch character data when component mounts
    useEffect(() => {
        dispatch(fetchCharacters());
    }, [dispatch]);
    
    // Pulling nodes and edges from Redux state
    const nodes = useSelector(state => state.characters.nodes);  // Adjust according to your state structure
    const edges = useSelector(state => state.characters.edges);  // Adjust according to your state structure
    const currentZoomLevel = useSelector(state => state.ui.currentZoomHLevel);

    useEffect(() => {
        if (!nodes || !edges) return;

        // Create mutable copies of nodes and edges
        const mutableNodes = nodes.map(node => ({ ...node }));
        const mutableEdges = edges.map(link => ({ ...link }));

        

        // Select the SVG element
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear SVG to prevent duplicates

        const { width, height } = svgRef.current.getBoundingClientRect();
        // Initally calculate the coordinates of the nodes from the backend position
        mutableNodes.forEach(node => {
                    node.x = node.position[0] * width;
                    node.y = node.position[1] * height;
                });

        // Append a group to hold all content
        const contentGroup = svg.append("g");

        // Set up zoom functionality
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                contentGroup.attr("transform", event.transform);
            });
        
        svg.call(zoom);

        // Initialize nodes and edges
        const edgeElements = contentGroup.selectAll("line")
            .data(mutableEdges)
            .enter().append("line")
            .attr("stroke", "#ddd");

        const nodeElements = contentGroup.selectAll("circle")
            .data(mutableNodes)
            .enter().append("circle")
            .attr("r", 10)
            .attr("fill", "blue")
            .call(d3.drag() 
                .on("start", dragStart)
                .on("drag", dragging)
                .on("end", dragEnd))
            .on("click", (event, d) => {
                dispatch(selectNode(d.id));
            });

        function dragStart(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragging(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragEnd(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        // Define simulation
        const simulation = d3.forceSimulation(mutableNodes)
            .force("link", d3.forceLink(mutableEdges).id(d => d.id))
            .force("charge", d3.forceManyBody().strength(-500))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .on("tick", () => {
                edgeElements
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                nodeElements
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
            });

        return () => {
            simulation.stop(); // Cleanup on component unmount
            svg.on('.zoom', null); // Remove zoom listener
        };

    }, [nodes, edges, currentZoomLevel, dispatch]);

    return (
        <div id="visualizer-container">
            <svg id='network' ref={svgRef} style={{ width: '100%', height: '600px' }}></svg>
        </div>
    );
};

export default Visualizer;
