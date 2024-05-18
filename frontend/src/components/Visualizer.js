import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as d3 from 'd3';
import { selectNode } from '../features/ui/uiSlice'; 
import { fetchCharacters } from '../features/characters/characterSlice';


const Visualizer = () => {
    const svgRef = useRef(null);
    const dispatch = useDispatch();
    const forceStrength = useSelector(state => state.ui.forceStrength);
    const zoomRef = useRef(d3.zoomIdentity); // Ref to store zoom state

    // Fetch character data when component mounts
    useEffect(() => {
        dispatch(fetchCharacters());
    }, [dispatch]);
    
    // Pulling nodes and edges from Redux state
    const nodes = useSelector(state => state.characters.nodes);
    const edges = useSelector(state => state.characters.edges);

    useEffect(() => {
        if (!nodes || !edges) return;

        // Create mutable copies of nodes and edges
        const mutableNodes = nodes.map(node => ({ ...node }));
        const mutableEdges = edges.map(link => ({ ...link }));

        // Select the SVG element
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear SVG to prevent duplicates

        const { width, height } = svgRef.current.getBoundingClientRect();
        // // Initally calculate the coordinates of the nodes from the backend position
        // mutableNodes.forEach(node => {
        //             node.x = node.position[0] * width;
        //             node.y = node.position[1] * height;
        //         });

        // Append a group to hold all content
        const contentGroup = svg.append("g");

        // Set up zoom functionality
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                contentGroup.attr("transform", event.transform);
                zoomRef.current = event.transform;
            });
        
        svg.call(zoom);
        

        // // Apply the stored zoom transform if it exists
        // if (zoomRef.current) {
        //     svg.call(zoom.transform, d3.zoomIdentity.translate(zoomRef.current.x, zoomRef.current.y).scale(zoomRef.current.k));
        // }

        // Initialize nodes and edges
        const edgeElements = contentGroup.selectAll("line")
            .data(mutableEdges)
            .enter().append("line")
            .attr("stroke", "#ddd");

        const nodeElements = contentGroup.selectAll("circle")
            .data(mutableNodes)
            .enter().append("circle")
            .attr("r", 30)
            .attr("fill", "blue")
            .call(d3.drag() 
                .on("start", dragStart)
                .on("drag", dragging)
                .on("end", dragEnd))
            .on("click", (event, d) => {
                event.stopPropagation();
                dispatch(selectNode(d.id));
            });
        
        nodeElements.append("title").text(d => d.name);
        
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
            .force("charge", d3.forceManyBody().strength(-forceStrength))
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
        
        // Function to update the force strength in the simulation
        const updateForceStrength = () => {
            simulation.force('charge').strength(-forceStrength);
            simulation.alpha(1).restart(); // Restart the simulation with new force strength
        };

        updateForceStrength();

        return () => {
            simulation.stop(); // Cleanup on component unmount
            svg.on('.zoom', null); // Remove zoom listener
        };

    }, [nodes, edges, forceStrength, dispatch]);

    return (
        <div id="visualizer-container">
            <svg id='network' ref={svgRef} style={{ width: '100%', height: '600px' }}></svg>
        </div>
    );
};

export default Visualizer;