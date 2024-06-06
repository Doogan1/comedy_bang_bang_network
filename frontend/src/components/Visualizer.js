import React, { useEffect, useRef , useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as d3 from 'd3';
import { selectNode , updateZoomCache, setTriggerZoomToFit , setTriggerZoomToSelection , setWindow , setHighlights} from '../features/ui/uiSlice'; 
import { fetchCharacters , updatePositions , setIsComponentChanged} from '../features/characters/characterSlice';
import { fetchGuests , updateGuestPositions } from '../features/guests/guestSlice';

const Visualizer = () => {
    const svgRef = useRef(null);
    const dispatch = useDispatch();
    const forceStrength = useSelector(state => state.ui.forceStrength);
    const linkDistance = useSelector(state => state.ui.linkDistance);
    const currentCentrality = useSelector(state => state.ui.currentCentrality);
    const windowState = useSelector(state => state.ui.window);

    const windowWidth = windowState.width;
    const windowHeight = windowState.height;
    const zoomRef = useRef(d3.zoomIdentity); // Ref to store zoom state
    const simulationRef = useRef(null); // Ref to store simulation
    const nodeElementsRef = useRef(null); // Ref to store node elements
    const edgeElementsRef = useRef(null); // Ref to store edge elements
    const labelsRef = useRef(null); // Ref to store labels

    const radiusRange = useSelector(state => state.ui.radiusRange);

    const zoomCache = useSelector(state => state.ui.zoomCache);
    const triggerZoomToFit = useSelector(state => state.ui.triggerZoomToFit);
    const triggerZoomToSelection = useSelector(state => state.ui.triggerZoomToSelection);

    const isComponentChanged = useSelector(state => state.characters.isComponentChanged);

    const selectedNodeId = useSelector(state => state.ui.selectedNodeId);
    const selectedEpisode = useSelector(state => state.ui.selectedEpisode);
    const currentNetwork = useSelector(state => state.ui.currentNetwork);

    const currentComponent = useSelector(state => state.ui.currentComponent);

    const characterNodes = useSelector(state => state.characters.nodes);
    const characterEdges = useSelector(state => state.characters.edges);
    const characterPositions = useSelector(state => state.characters.positions[currentComponent]);
    
    const guestNodes = useSelector(state => state.guests.nodes);
    const guestEdges = useSelector(state => state.guests.edges);
    const guestPositions = useSelector(state => state.guests.positions[currentComponent]);
    
    const episodes = useSelector(state => state.episodes.episodes);

    const highlights = useSelector(state => state.ui.highlights);

    const nodesRef = useRef([]);
    const edgesRef = useRef([]);
    const positionsRef = useRef({});


    // Function to get the current positions
    const getCurrentPositions = () => {
        const nodeData = nodeElementsRef.current.data();
        return nodeData.reduce((acc, node) => ({
            ...acc,
            [node.id]: { x: node.x, y: node.y }
        }), {});
    };

    const updateNetworkPositions = (dispatch, currentNetwork, currentComponent, positions) => {
        if (currentNetwork === 'characters') {
            dispatch(updatePositions({ component: currentComponent, positions }));
        } else if (currentNetwork === 'guests') {
            dispatch(updateGuestPositions({ component: currentComponent, positions }));
        }
    };

    // Reset dimensions on window resize
    useEffect(() => {
        const handleResize = () => {
            dispatch(setWindow({ width: window.innerWidth, height: window.innerHeight }));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }, [dispatch]);
    
    // highlight nodes and edges in the current component and network's list of highlights
    useEffect(() => {
        console.log(`About to define highlightData using ${JSON.stringify(highlights)}`);
        const highlightData = highlights[currentNetwork][currentComponent] || { nodes: [], edges: [] };
        const { nodes: nodesToHighlight = [], edges: edgesToHighlight = []} = highlightData;
        console.log(JSON.stringify(highlightData));
        if (nodeElementsRef.current) {
            if (nodesToHighlight.length > 0) {
                nodeElementsRef.current
                    .style("fill", d => d.id === selectedNodeId ? "red" : "rgb(0, 183, 255)")
                    .style("opacity", d => nodesToHighlight.includes(d.id) ? 1 : 0.2);
    
                edgeElementsRef.current
                    .style("opacity", d => {
                        const edge = [d.source.id, d.target.id];
                        return edgesToHighlight.some(highlightedEdge => (highlightedEdge[0] === edge[0] && highlightedEdge[1] === edge[1])) ? 1 : 0.2;
                    });
    
                labelsRef.current
                    .style("opacity", d => nodesToHighlight.includes(d.id) ? 1 : 0.2);
            } else {
                nodeElementsRef.current
                    .style("opacity", 1)
                    .style("fill", "rgb(0, 183, 255)");
    
                edgeElementsRef.current
                    .style("opacity", 1);
    
                labelsRef.current
                    .style("opacity", 1);
            }
        }
    }, [highlights, currentComponent, currentNetwork]);
    

    // Fetch character data when component mounts
    useEffect(() => {
        console.log(`current component is ${currentComponent}`);
        if (currentNetwork === 'characters') {
            dispatch(fetchCharacters(currentComponent)).then(response => {

            });
        } else if (currentNetwork === 'guests') {
            dispatch(fetchGuests(currentComponent)).then(response => {

            });
        }

    }, [dispatch, currentNetwork, currentComponent]);
    
    // Pulling nodes and edges from Redux state
    useEffect(() => {
        console.log();
        if (currentNetwork === 'characters') {
            nodesRef.current = characterNodes;
            edgesRef.current = characterEdges;
            positionsRef.current = characterPositions;

        } else if (currentNetwork === 'guests') {
            nodesRef.current = guestNodes;
            edgesRef.current = guestEdges;
            positionsRef.current = guestPositions;

        }
    }, [currentNetwork, characterNodes, characterEdges, characterPositions, guestNodes, guestEdges, guestPositions]);


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

    const highlightNodeAndNeighbors = (nodeId) => {
        const highlightedNodes = [nodeId];
        const highlightedEdges = [];

        edgesRef.current.forEach(edge => {
            if (edge.source === nodeId || edge.target === nodeId) {
                highlightedEdges.push([edge.source, edge.target]);
                highlightedNodes.push(edge.source === nodeId ? edge.target : edge.source);
            }
        });

        const payload = {
            nodes: highlightedNodes,
            edges: highlightedEdges
        }
        console.log(`About to set highlights fromf highlightNodeAndNeighbors with ${JSON.stringify(payload)}`);
        dispatch(setHighlights(payload));
    };

    const highlightEpisode = (episodeId) => {
        const episodeObjects = Object.values(episodes).filter(d => d.episode_number === episodeId);

        const nodeIdsToHighlight = [];

        if (currentNetwork === 'characters') {
            episodeObjects.forEach(episode => {
                episode.characters.forEach(character => nodeIdsToHighlight.push(character.id));
            });
        }

        if (currentNetwork === 'guests') {
    
            episodeObjects.forEach(episode => {
                episode.guests.forEach(guest => nodeIdsToHighlight.push(guest.id));
            });
        }

        const nodesToHighlight = nodesRef.current.filter(d => nodeIdsToHighlight.includes(d.id));
        const edgesToHighlight = [];
        edgesRef.current.forEach((d) => {
            if (nodeIdsToHighlight.includes(d.source) && nodeIdsToHighlight.includes(d.target)) {
                edgesToHighlight.push([d.source, d.target]);
            }
        });
        console.log(`About to set highlights fromf highlightEpisode with ${JSON.stringify(payload)}`);
        const payload = {
            nodes: nodeIdsToHighlight,
            edges: edgesToHighlight
        }

        dispatch(setHighlights(payload));
        
    };

    const calculateGraphBounds = (vertexSelection) => {

        const positionValues = Object.values(vertexSelection);
        

        const minX = d3.min(positionValues, d => d.x);
        const maxX = d3.max(positionValues, d => d.x);
        const minY = d3.min(positionValues, d => d.y);
        const maxY = d3.max(positionValues, d => d.y);


        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            centerX: (minX + maxX) / 2,
            centerY: (minY + maxY) / 2
        };
    };

    const adjustView = (positions, zoom) => {
        if (!positions || Object.keys(positions).length === 0) return;
        
            // Extract node data from nodeElementsRef
        const nodeData = nodeElementsRef.current.data();

            // Dispatch updatePositions action with the current positions of the nodes
        updateNetworkPositions(dispatch, currentNetwork, currentComponent, nodeData.reduce((acc, node) => ({
            ...acc,
            [node.id]: { x: node.x, y: node.y }
        }), {}));

        const bounds = calculateGraphBounds(positions);

        let scale = 0.80 / Math.max(bounds.width / svgRef.current.clientWidth, bounds.height / svgRef.current.clientHeight);

        // Handle the case where bounds.width and bounds.height are zero
        if (bounds.width === 0 && bounds.height === 0) {
            scale = 1; // Default scale for a single vertex
        }

        const translate = [
            (svgRef.current.clientWidth / 2) - scale * (bounds.centerX),
            (svgRef.current.clientHeight / 2) - scale * (bounds.centerY)
        ];

        const transform = d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale);

        const svgSelection = d3.select(svgRef.current);

        svgSelection.transition()
            .duration(500) // Smooth transition
            .call(zoom.transform, transform);

        zoomRef.current = transform;

            // Reapply node sizes after the zoom transform
        nodeElementsRef.current.each(function(d, i) {
            const node = d3.select(this);
            const currentRadius = d.currentRadius || node.attr('r'); // Use stored radius or current attribute value
            node.attr('r', currentRadius);

        });

        labelsRef.current.each(function(d, i) {
            const label = d3.select(this);
            const currentRadius = nodeElementsRef.current.data()[i].r;
            label.style('font-size', `${Math.max(30, currentRadius)}px`);
        });
        // Save the zoom level to zoomCache
        dispatch(updateZoomCache({ 
            network: currentNetwork,
            component: currentComponent,
            zoom: { k: transform.k, x: transform.x, y: transform.y } 
        }));
    };


    useEffect(() => {
        const nodes = nodesRef.current;
        const edges = edgesRef.current;
        const positions = positionsRef.current;
        console.log(`Current positions ref is ${positionsRef.current}`);

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
        const svg = d3.select(svgRef.current)
            .attr('width', 0.85 * windowWidth)
            .attr('height', 0.9 * windowHeight);

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
        const componentKey = `${currentNetwork}-${currentComponent}`;
        if (zoomCache[componentKey]) {
            const { k, x, y } = zoomCache[componentKey];

            const transform = d3.zoomIdentity.translate(x, y).scale(k);
            svg.call(zoom.transform, transform);
            zoomRef.current = transform;
        } else {
            setTriggerZoomToFit(true);
        }

        const highlightData = highlights[currentNetwork][currentComponent] || { nodes: [], edges: [] };
        const { nodes: highlightNodes = [], edges: highlightEdges = [] } = highlightData;
        console.log(`Zoom to fit was triggered and we're about to style, the current highlight nodes are ${highlightNodes}`);
        // Apply the stored zoom transform if it exists
        // if (zoomRef.current) {
        //     svg.call(zoom.transform, d3.zoomIdentity.translate(zoomRef.current.x, zoomRef.current.y).scale(zoomRef.current.k));
        // }

        // Initialize nodes and edges
        const edgeElements = contentGroup.selectAll("line")
            .data(mutableEdges)
            .enter().append("line")
            .attr("stroke", "#ddd");

        edgeElementsRef.current = edgeElements;
        const nodeElements = contentGroup.selectAll("circle")
            .data(mutableNodes)
            .enter().append("circle")
            .attr("r", d => d.currentRadius || 30)
            .attr("fill", d => highlightNodes.includes(d.id) ? "red" : "rgb(0, 183, 255)")
            .style("opacity", d => highlightNodes.includes(d.id) ? 1 : 0.2)
            .call(d3.drag() 
                .on("start", dragStart)
                .on("drag", dragging)
                .on("end", dragEnd))
            .on("click", (event, d) => {
                event.stopPropagation();
                dispatch(selectNode(d.id));
                highlightNodeAndNeighbors(d.id);
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
            .force("collide", d3.forceCollide().radius(d => d.currentRadius || 30))
            .alphaDecay(currentComponent === 0 ? 0.005 : 0.0228) // Adjust alpha decay for giant components
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
                    updateNetworkPositions(dispatch, currentNetwork, currentComponent, nodeData.reduce((acc, node) => ({
                        ...acc,
                        [node.id]: { x: node.x, y: node.y }
                    }), {}));
                }
            });

        if (triggerZoomToFit) {
            adjustView(positions, zoom);
            dispatch(setTriggerZoomToFit(false));
        }

        if (triggerZoomToSelection && highlights[currentNetwork][currentComponent]) {


            const positionRefValues = Object.values(nodeElementsRef.current.data());

            const highlightVerticesIds = highlights[currentNetwork][currentComponent].nodes || [];
            console.log(`Retrieving highlighted vertices via triggerZommToSelection ${highlightVerticesIds}`);
            const highlightVertices = positionRefValues.filter(d => highlightVerticesIds.includes(d.id));
            console.log(highlightVertices);

            adjustView(highlightVertices, zoom);
            dispatch(setTriggerZoomToSelection(false));
        }

        return () => {
            const currentPositions = getCurrentPositions();
            const componentKey = `${currentNetwork}-${currentComponent}`;
            updateNetworkPositions(currentPositions);
            dispatch(updateZoomCache({
                network: currentNetwork,
                component: currentComponent,
                zoom: { k: zoomRef.current.k, x: zoomRef.current.x, y: zoomRef.current.y }
            }));
            simulationRef.current.stop(); // Cleanup on component unmount
            svg.on('.zoom', null); // Remove zoom listener
            dispatch(setIsComponentChanged(true));
        };

    }, [ currentNetwork, characterNodes, characterEdges, guestNodes, guestEdges, triggerZoomToFit, triggerZoomToSelection, dispatch]);

    useEffect(() => {
        if (!nodesRef.current) return;

        const centralityScores = {
            degree: nodesRef.current.map(node => node.degree),
            betweenness: nodesRef.current.map(node => node.betweenness),
            eigenvector: nodesRef.current.map(node => node.eigenvector),
            closeness: nodesRef.current.map(node => node.closeness),
            none: nodesRef.current.map(() => 1) // Default size for 'none'
        };
        
        const normalizedScores = normalizeScores(centralityScores[currentCentrality]);
        const nodeRadii = mapScoresToRadii(normalizedScores, radiusRange.minRadius, radiusRange.maxRadius);

        if (nodeElementsRef.current) {
            nodeElementsRef.current
                .attr("r", (d, i) => {
                    d.currentRadius = nodeRadii[i];

                    return nodeRadii[i]});
            labelsRef.current
                .style("font-size", (d, i) => `${Math.max(30, nodeRadii[i])}px`);

            // Update collision force with new radii
            if (simulationRef.current) {
                simulationRef.current.force("collide", d3.forceCollide().radius(d => d.currentRadius || 30));
                simulationRef.current.alpha(1).restart(); // Restart the simulation with new radii
            }
        }

        dispatch(setIsComponentChanged(false));
    }, [ nodesRef.current, currentCentrality, radiusRange, currentComponent, isComponentChanged, triggerZoomToFit, dispatch]);
    
    // Separate useEffect for updating force strength
    useEffect(() => {
        if (simulationRef.current) {
            simulationRef.current.force("charge").strength(-forceStrength);
            simulationRef.current.alpha(1).restart(); // Restart the simulation with new force strength
        }
    }, [forceStrength , currentNetwork , isComponentChanged, triggerZoomToFit]);


    // Separate useEffect for updating link distance
    useEffect(() => {
        if (simulationRef.current) {
            simulationRef.current.force("link").distance(linkDistance);
            simulationRef.current.alpha(1).restart(); // Restart the simulation with new link distance
        }
        
    }, [linkDistance , currentNetwork , selectedNodeId , isComponentChanged , triggerZoomToFit]);

    useEffect(() => {
        const highlightData = highlights[currentNetwork][currentComponent] || { nodes: [], edges: [] };
        const { nodes: highlightNodes = [], edges: highlightEdges = [] } = highlightData;

        if (highlightNodes.length > 0) {
            nodeElementsRef.current
            .style("fill", d => d.id === selectedNodeId ? "red" : "rgb(0, 183, 255)")
            .style("opacity", d => highlightNodes.includes(d.id) ? 1 : 0.2);


            edgeElementsRef.current
            .style("opacity", d => {
                const edge = [d.source.id, d.target.id];
                return highlightEdges.some(highlightedEdge => (highlightedEdge[0] === edge[0] && highlightedEdge[1] === edge[1])) ? 1 : 0.2
            });

            labelsRef.current
            .style("opacity", d => highlightNodes.includes(d.id) ? 1 : 0.2);
        } else {
            nodeElementsRef.current
            .style("opacity", 1)
            .style("fill", "rgb(0, 183, 255)");

            edgeElementsRef.current
            .style("opacity", 1);

            labelsRef.current
            .style("opacity", 1);
        }
    }, [isComponentChanged, currentNetwork])

    useEffect(() => {
        if (selectedNodeId === null && selectedEpisode === null) {
            dispatch(setHighlights([]));
            dispatch(setHighlights([]));
        } else {
            console.log(`Highlighting node and neighbors because selectedNodeId changed to ${selectedNodeId}`);
            highlightNodeAndNeighbors(selectedNodeId);
        }
    }, [selectedNodeId, dispatch]);


    useEffect(() => {
        highlightEpisode(selectedEpisode);
    }, [selectedEpisode])

    const scaledWidth = 0.75 * windowWidth;
    const scaledHeight = 0.25 * windowHeight;
    return (
        <div id="visualizer-container" style={{width: '100%', height: '100%'}}>
            <svg id='network' ref={svgRef} style={{width: {scaledWidth}, height: {scaledHeight}}}>
            </svg>
        </div>
    );
};

export default Visualizer;