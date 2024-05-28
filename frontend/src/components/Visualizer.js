import React, { useEffect, useRef , useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as d3 from 'd3';
import { selectNode , updateZoomCache, setTriggerZoomToFit} from '../features/ui/uiSlice'; 
import { fetchCharacters , updatePositions , setIsComponentChanged} from '../features/characters/characterSlice';


const Visualizer = () => {
    const svgRef = useRef(null);
    const dispatch = useDispatch();
    const forceStrength = useSelector(state => state.ui.forceStrength);
    const linkDistance = useSelector(state => state.ui.linkDistance);
    const currentCentrality = useSelector(state => state.ui.currentCentrality);
    const zoomRef = useRef(d3.zoomIdentity); // Ref to store zoom state
    const simulationRef = useRef(null); // Ref to store simulation
    const nodeElementsRef = useRef(null); // Ref to store node elements
    const labelsRef = useRef(null); // Ref to store labels
    const positionsRef = useRef(null); // Ref to store positions
    const radiusRange = useSelector(state => state.ui.radiusRange);
    const selectedComponent = useSelector(state => state.characters.selectedComponent);
    const zoomCache = useSelector(state => state.ui.zoomCache);
    const triggerZoomToFit = useSelector(state => state.ui.triggerZoomToFit);
    const isComponentChanged = useSelector(state => state.characters.isComponentChanged);
    console.log(zoomCache);
    // Fetch character data when component mounts
    useEffect(() => {
        dispatch(fetchCharacters(selectedComponent));
        dispatch(setIsComponentChanged(true));
    }, [dispatch, selectedComponent]);
    
    // Pulling nodes and edges from Redux state
    const nodes = useSelector(state => state.characters.nodes);
    const edges = useSelector(state => state.characters.edges);
    const positions = useSelector(state => state.characters.positions[selectedComponent]);
    positionsRef.current = positions;
    // mutableNodes.forEach(node => {
    //     node.x = positions[node.id].x;
    //     node.y = positions[node.id].y;
    //     console.log(positions[node.id].x);
    // });

    // Normalizes an array of scores to the range [0, 1]
    const normalizeScores = (scores) => {
        const min = Math.min(...scores);
        const max = Math.max(...scores);
        if (max === min) {
            return scores;
        }
        return scores.map(score => (score - min) / (max - min));
    };

    const mapScoresToRadii = (normalizedScores, minRadius, maxRadius) => {
        return normalizedScores.map(score => minRadius + score * (maxRadius - minRadius));
    };

    const calculateGraphBounds = (positions, width, height) => {
        console.log(positionsRef.current);
        const positionValues = Object.values(positionsRef.current);
        
        const minX = d3.min(positionValues, d => d.x);
        const maxX = d3.max(positionValues, d => d.x);
        const minY = d3.min(positionValues, d => d.y);
        const maxY = d3.max(positionValues, d => d.y);

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    };

    const adjustView = (positions, svg, zoom) => {
        if (!positions || Object.keys(positions).length === 0) return;

            // Extract node data from nodeElementsRef
        const nodeData = nodeElementsRef.current.data();
        console.log(nodeData);

            // Dispatch updatePositions action with the current positions of the nodes
        dispatch(updatePositions({
            component: selectedComponent,
            positions: nodeData.reduce((acc, node) => ({
                ...acc,
                [node.id]: { x: node.x, y: node.y }
            }), {})
        }));
        const bounds = calculateGraphBounds(positions, svgRef.current.clientWidth, svgRef.current.clientHeight);

        const scale = 0.95 / Math.max(bounds.width / svgRef.current.clientWidth, bounds.height / svgRef.current.clientHeight);

        const translate = [
            (svgRef.current.clientWidth / 2) - scale * (bounds.x + bounds.width / 2),
            (svgRef.current.clientHeight / 2) - scale * (bounds.y + bounds.height / 2)
        ];

        const transform = d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale);
        console.log(zoom);
        console.log(transform);
        svg.transition()
            .duration(500) // Smooth transition
            .call(zoom.transform, transform);
        zoomRef.current = transform;

        // Save the zoom level to zoomCache
        dispatch(updateZoomCache({ component: selectedComponent, zoom: { k: transform.k, x: transform.x, y: transform.y } }));
    };

    useEffect(() => {
        if (!nodes) return;

        const centralityScores = {
            degree: nodes.map(node => node.degree),
            betweenness: nodes.map(node => node.betweenness),
            eigenvector: nodes.map(node => node.eigenvector),
            closeness: nodes.map(node => node.closeness),
            none: nodes.map(() => 1) // Default size for 'none'
        };
        
        const normalizedScores = normalizeScores(centralityScores[currentCentrality]);
        const nodeRadii = mapScoresToRadii(normalizedScores, radiusRange.minRadius, radiusRange.maxRadius);

        if (nodeElementsRef.current) {
            nodeElementsRef.current
                .attr("r", (d, i) => nodeRadii[i]);
            labelsRef.current
                .style("font-size", (d, i) => `${Math.max(30, nodeRadii[i])}px`);
        }
        dispatch(setIsComponentChanged(false));
    }, [nodes, currentCentrality, radiusRange, selectedComponent, isComponentChanged, dispatch]);

    useEffect(() => {
        if (!nodes || !edges) return;
        const mutableNodes = nodes.map(node => ({
            ...node,
            x: positions[node.id]?.x || node.x,
            y: positions[node.id]?.y || node.y
        }));

        const mutableEdges = edges.map(link => ({ ...link }));
        // // Create mutable copies of nodes and edges
        
        // const mutableEdges = edges.map(link => ({ ...link }));
        
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
            .scaleExtent([0.01, 4])
            .on("zoom", (event) => {
                contentGroup.attr("transform", event.transform);
                zoomRef.current = event.transform;
            });
        
        svg.call(zoom);
        
        if (zoomCache[selectedComponent]) {
            const { k, x, y } = zoomCache[selectedComponent];
            const transform = d3.zoomIdentity.translate(x, y).scale(k);
            svg.call(zoom.transform, transform); // Use cached zoom level if available
            zoomRef.current = transform;
        } else {
            adjustView(positions, svg, zoom); // Adjust view on initial load if no cache
        }
        // Apply the stored zoom transform if it exists
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

        nodeElementsRef.current = nodeElements;
        dispatch(setIsComponentChanged(true));

        const labels = contentGroup.selectAll(".node-label")
            .data(mutableNodes)
            .enter().append("text")
            .attr("class", "node-label")
            .attr("x", d => d.position[0] * width)
            .attr("y", d => (d.position[1] * height) - 15)
            .text(d => d.name)
            .style("display", "block")
            .style("font-size", (d, i) => `30px`)
            .attr("opacity", 1); 
        
        labelsRef.current = labels;

        nodeElements.append("title").text(d => d.name);
        
        function dragStart(event, d) {
            if (!event.active) simulationRef.current.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragging(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragEnd(event, d) {
            if (!event.active) simulationRef.current.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        let tickCounter = 0;
        const tickUpdateFrequency = 50;

        // Define simulation
        simulationRef.current = d3.forceSimulation(mutableNodes)
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
                
                labels
                    .attr("x", d => d.x)
                    .attr("y", d => d.y - 25);

                tickCounter += 1;
                if (tickCounter % tickUpdateFrequency === 0) {
                    const nodeData = nodeElements.data();
                    dispatch(updatePositions({
                        component: selectedComponent,
                        positions: nodeData.reduce((acc, node) => ({
                            ...acc,
                            [node.id]: { x: node.x, y: node.y }
                        }), {})
                    }));
                }
            });

        if (triggerZoomToFit) {
            adjustView(positions, svg, zoom);
            dispatch(setTriggerZoomToFit(false));
        }

        return () => {
            dispatch(updatePositions({ component: selectedComponent, positions: mutableNodes.reduce((acc, node) => ({ ...acc, [node.id]: { x: node.x, y: node.y } }), {}) }));
            dispatch(updateZoomCache({ component: selectedComponent, zoom: { k: zoomRef.current.k, x: zoomRef.current.x, y: zoomRef.current.y } }));
            simulationRef.current.stop(); // Cleanup on component unmount
            svg.on('.zoom', null); // Remove zoom listener
            dispatch(setIsComponentChanged(true));
        };

    }, [nodes, edges, triggerZoomToFit, dispatch]);

    // Separate useEffect for updating force strength
    useEffect(() => {
        if (simulationRef.current) {
            simulationRef.current.force("charge").strength(-forceStrength);
            simulationRef.current.alpha(1).restart(); // Restart the simulation with new force strength
        }
    }, [forceStrength]);


    // Separate useEffect for updating link distance
    useEffect(() => {
        if (simulationRef.current) {
            simulationRef.current.force("link").distance(linkDistance);
            simulationRef.current.alpha(1).restart(); // Restart the simulation with new link distance
        }
    }, [linkDistance]);

    return (
        <div id="visualizer-container">
            <svg id='network' ref={svgRef} width='1000px' height='1000px'>
            </svg>
        </div>
    );
};

export default Visualizer;