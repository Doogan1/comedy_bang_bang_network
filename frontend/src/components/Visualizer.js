import React, { useEffect, useRef , useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as d3 from 'd3';
import {
  selectNode, updateZoomCache, setTriggerZoomToFit, setTriggerZoomToSelection,
  setWindow, setHighlights, saveHighlights, retrieveHighlightsSave
} from '../features/ui/uiSlice';
import { fetchCharacters, updatePositions, setIsComponentChanged } from '../features/characters/characterSlice';
import { fetchGuests, updateGuestPositions } from '../features/guests/guestSlice';

const Visualizer = () => {
  const svgRef = useRef(null);
  const dispatch = useDispatch();
  const forceStrength = useSelector(state => state.ui.forceStrength);
  const linkDistance = useSelector(state => state.ui.linkDistance);
  const currentCentrality = useSelector(state => state.ui.currentCentrality);
  const windowState = useSelector(state => state.ui.window);

  const windowWidth = windowState.width;
  const windowHeight = windowState.height;
  const zoomRef = useRef(d3.zoomIdentity);
  const simulationRef = useRef(null);
  const nodeElementsRef = useRef(null);
  const edgeElementsRef = useRef(null);
  const labelsRef = useRef(null);

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
  const hoverTimeoutRef = useRef(null);

  const getCurrentPositions = () => {
    console.log(`Getting current positions.`);
    const nodeData = nodeElementsRef.current.data();
    return nodeData.reduce((acc, node) => ({
      ...acc,
      [node.id]: { x: node.x, y: node.y }
    }), {});
  };

  const updateNetworkPositions = (dispatch, currentNetwork, currentComponent, positions) => {
    console.log(`Updating network positions.`);
    if (currentNetwork === 'characters') {
      dispatch(updatePositions({ component: currentComponent, positions }));
    } else if (currentNetwork === 'guests') {
      dispatch(updateGuestPositions({ component: currentComponent, positions }));
    }
  };

  useEffect(() => {
    console.log("UseEffect visualizer 1");
    const handleResize = () => {
      dispatch(setWindow({ width: window.innerWidth, height: window.innerHeight }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  useEffect(() => {
    console.log("UseEffect visualizer 2");
    if (currentNetwork === 'characters') {
      dispatch(fetchCharacters(currentComponent));
    } else if (currentNetwork === 'guests') {
      dispatch(fetchGuests(currentComponent));
    }
  }, [dispatch, currentNetwork, currentComponent]);

  useEffect(() => {
    console.log("UseEffect visualizer 3");
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


  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  const applyHighlights = debounce((nodesToHighlight, edgesToHighlight) => {
    if (nodeElementsRef.current && edgeElementsRef.current && labelsRef.current) {
      if (nodesToHighlight.length > 0) {
        nodeElementsRef.current
          .classed("highlighted", d => nodesToHighlight.includes(d.id))
          .classed("selected", d => d.id === selectedNodeId)
          .classed("dimmed", d => !nodesToHighlight.includes(d.id));

        edgeElementsRef.current
          .classed("dimmed", d => {
            const edge = [d.source.id, d.target.id];
            return !edgesToHighlight.some(highlightedEdge => (highlightedEdge[0] === edge[0] && highlightedEdge[1] === edge[1]));
          });

        labelsRef.current
          .classed("dimmed", d => !nodesToHighlight.includes(d.id));
      } else {
        nodeElementsRef.current
          .classed("highlighted", false)
          .classed("dimmed", false)
          .classed("selected", false);

        edgeElementsRef.current
          .classed("dimmed", false);

        labelsRef.current
          .classed("dimmed", false);
      }
    }
  }, 10);

  useEffect(() => {
    const highlightData = highlights[currentNetwork]?.[currentComponent] || { nodes: [], edges: [] };
    const { nodes: nodesToHighlight = [], edges: edgesToHighlight = [] } = highlightData;
    applyHighlights(nodesToHighlight, edgesToHighlight);
  }, [highlights, currentComponent, currentNetwork, selectedNodeId]);
  
  

  useEffect(() => {
    console.log("UseEffect visualizer 5");
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    const positions = positionsRef.current || {};

    if (!nodes || !edges) return;

    const mutableNodes = nodes.map(node => ({
      ...node,
      x: positions[node.id]?.x || node.x,
      y: positions[node.id]?.y || node.y
    }));

    const mutableEdges = edges.map(link => ({ ...link }));

    const svg = d3.select(svgRef.current)
      .attr('width', 0.85 * windowWidth)
      .attr('height', 0.9 * windowHeight);

    svg.selectAll("*").remove();

    const { width, height } = svgRef.current.getBoundingClientRect();
    const contentGroup = svg.append("g");

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
      dispatch(setTriggerZoomToFit(true));
    }

    const edgeElements = contentGroup.selectAll("line")
      .data(mutableEdges)
      .enter().append("line")
      .attr("stroke", "#ddd");

    edgeElementsRef.current = edgeElements;

    const nodeElements = contentGroup.selectAll("circle")
      .data(mutableNodes)
      .enter().append("circle")
      .attr("r", d => d.currentRadius || 30)
      .attr("fill", "rgb(0, 183, 255)")
      .call(d3.drag()
        .on("start", dragStart)
        .on("drag", dragging)
        .on("end", dragEnd))
      .on("click", (event, d) => {
        event.stopPropagation();
        dispatch(selectNode(d.id));
        highlightNodeAndNeighbors(d.id);
      })
      .on("mouseenter", (event, d) => handleMouseEnterNode(d.id))
      .on("mouseleave", handleMouseLeaveNode);

    nodeElementsRef.current = nodeElements;

    const labels = contentGroup.selectAll(".node-label")
      .data(mutableNodes)
      .enter().append("text")
      .attr("class", "node-label")
      .attr("x", d => d.x)
      .attr("y", d => d.y - 15)
      .text(d => d.name)
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

    simulationRef.current = d3.forceSimulation(mutableNodes)
      .force("link", d3.forceLink(mutableEdges).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-forceStrength))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(d => d.currentRadius || 30))
      .alphaDecay(currentComponent === 0 ? 0.005 : 0.0228)
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

    return () => {
      const currentPositions = getCurrentPositions();
      const componentKey = `${currentNetwork}-${currentComponent}`;
      updateNetworkPositions(dispatch, currentNetwork, currentComponent, currentPositions);
      dispatch(updateZoomCache({
        network: currentNetwork,
        component: currentComponent,
        zoom: { k: zoomRef.current.k, x: zoomRef.current.x, y: zoomRef.current.y }
      }));
      simulationRef.current.stop();
      svg.on('.zoom', null);
      dispatch(setIsComponentChanged(true));
    };

  }, [currentNetwork, characterNodes, characterEdges, guestNodes, guestEdges, dispatch]);

  useEffect(() => {
    console.log("UseEffect visualizer 6");
    if (triggerZoomToFit) {
      const nodes = nodeElementsRef.current ? nodeElementsRef.current.data() : [];
      const zoom = d3.zoom().scaleExtent([0.01, 4]).on("zoom", (event) => {
        d3.select(svgRef.current).select("g").attr("transform", event.transform);
        zoomRef.current = event.transform;
      });
      adjustView(nodes, zoom);
      dispatch(setTriggerZoomToFit(false));
    }
  }, [triggerZoomToFit, currentNetwork, currentComponent, dispatch]);

  useEffect(() => {
    console.log("UseEffect visualizer 7");
    if (triggerZoomToSelection && highlights[currentNetwork]?.[currentComponent]) {
      const highlightVerticesIds = highlights[currentNetwork][currentComponent].nodes || [];
      const highlightVertices = nodeElementsRef.current.filter(d => highlightVerticesIds.includes(d.id));
      const zoom = d3.zoom().scaleExtent([0.01, 4]).on("zoom", (event) => {
        d3.select(svgRef.current).select("g").attr("transform", event.transform);
        zoomRef.current = event.transform;
      });
      adjustView(highlightVertices.data(), zoom);
      dispatch(setTriggerZoomToSelection(false));
    }
  }, [triggerZoomToSelection, selectedNodeId, highlights, dispatch]);

  useEffect(() => {
    console.log("UseEffect visualizer 8");
    const centralityScores = {
      degree: nodesRef.current.map(node => node.degree),
      betweenness: nodesRef.current.map(node => node.betweenness),
      eigenvector: nodesRef.current.map(node => node.eigenvector),
      closeness: nodesRef.current.map(node => node.closeness),
      none: nodesRef.current.map(() => 1)
    };

    const normalizedScores = normalizeScores(centralityScores[currentCentrality]);
    const nodeRadii = mapScoresToRadii(normalizedScores, radiusRange.minRadius, radiusRange.maxRadius);

    if (nodeElementsRef.current) {
      nodeElementsRef.current
        .attr("r", (d, i) => {
          d.currentRadius = nodeRadii[i];
          return nodeRadii[i];
        });
      labelsRef.current
        .style("font-size", (d, i) => `${Math.max(30, nodeRadii[i])}px`);

      if (simulationRef.current) {
        simulationRef.current.force("collide", d3.forceCollide().radius(d => d.currentRadius || 30));
        simulationRef.current.alpha(1).restart();
      }
    }

    dispatch(setIsComponentChanged(false));
  }, [currentCentrality, radiusRange, isComponentChanged, triggerZoomToFit, dispatch]);

  useEffect(() => {
    console.log("UseEffect visualizer 9");
    if (simulationRef.current) {
      simulationRef.current.force("charge").strength(-forceStrength);
      simulationRef.current.alpha(1).restart();
    }
  }, [forceStrength, currentNetwork, isComponentChanged, triggerZoomToFit]);

  useEffect(() => {
    console.log("UseEffect visualizer 10");
    if (simulationRef.current) {
      simulationRef.current.force("link").distance(linkDistance);
      simulationRef.current.alpha(1).restart();
    }
  }, [linkDistance, currentNetwork, isComponentChanged, triggerZoomToFit]);

  useEffect(() => {
    console.log("UseEffect visualizer 11");
    if (selectedNodeId === null && selectedEpisode === null) {
      dispatch(setHighlights([]));
    } else {
      highlightNodeAndNeighbors(selectedNodeId);
      setTriggerZoomToSelection(true);
    }
  }, [selectedNodeId, dispatch]);

  useEffect(() => {
    console.log("UseEffect visualizer 12");
    if (selectedNodeId === null && selectedEpisode === null) {
        dispatch(setHighlights([]));
      } else {
        highlightEpisode(selectedEpisode);
      }
  }, [selectedEpisode]);

  const normalizeScores = (scores) => {
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    if (max === min) {
      return scores;
    }
    return scores.map(score => (score - min) / (max - min));
  };

  const mapScoresToRadii = (normalizedScores, minRadius, maxRadius) => {
    console.log(`mapScores triggered`);
    return normalizedScores.map(score => minRadius + score * (maxRadius - minRadius));
  };

  const highlightNodeAndNeighbors = (nodeId) => {
    console.log(`HighlightNodeAndNeighbors triggered.`);
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
    };
    dispatch(setHighlights(payload));
  };

    const highlightEpisode = (episodeId) => {
    const episodeObjects = episodes.filter(d => d.episode_number === episodeId);
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

    const edgesToHighlight = [];
    edgesRef.current.forEach((d) => {
      if (nodeIdsToHighlight.includes(d.source) && nodeIdsToHighlight.includes(d.target)) {
        edgesToHighlight.push([d.source, d.target]);
      }
    });

    const payload = {
      nodes: nodeIdsToHighlight,
      edges: edgesToHighlight
    };

    dispatch(setHighlights(payload));
  };

  const calculateGraphBounds = (vertexSelection) => {
    console.log(`Calculating graph bounds.`);
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
    console.log(`Adjusting view`);
    if (!positions || Object.keys(positions).length === 0) return;

    const nodeData = nodeElementsRef.current.data();
    updateNetworkPositions(dispatch, currentNetwork, currentComponent, nodeData.reduce((acc, node) => ({
      ...acc,
      [node.id]: { x: node.x, y: node.y }
    }), {}));

    const bounds = calculateGraphBounds(positions);
    let scale = 0.80 / Math.max(bounds.width / svgRef.current.clientWidth, bounds.height / svgRef.current.clientHeight);

    if (bounds.width === 0 && bounds.height === 0) {
      scale = 1;
    }

    const translate = [
      (svgRef.current.clientWidth / 2) - scale * (bounds.centerX),
      (svgRef.current.clientHeight / 2) - scale * (bounds.centerY)
    ];

    const transform = d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale);
    const svgSelection = d3.select(svgRef.current);

    svgSelection.transition()
      .duration(500)
      .call(zoom.transform, transform);

    zoomRef.current = transform;

    nodeElementsRef.current.each(function(d, i) {
      const node = d3.select(this);
      const currentRadius = d.currentRadius || node.attr('r');
      node.attr('r', currentRadius);
    });

    labelsRef.current.each(function(d, i) {
      const label = d3.select(this);
      const currentRadius = nodeElementsRef.current.data()[i].r;
      label.style('font-size', `${Math.max(30, currentRadius)}px`);
    });

    dispatch(updateZoomCache({
      network: currentNetwork,
      component: currentComponent,
      zoom: { k: transform.k, x: transform.x, y: transform.y }
    }));
  };

  const handleMouseEnterNode = (nodeId) => {
    console.log(`Handling mouse enter node.`);
    hoverTimeoutRef.current = setTimeout(() => {
      dispatch(saveHighlights());
      highlightNodeAndNeighbors(nodeId);
    }, 500);
  };

  const handleMouseLeaveNode = () => {
    console.log("Handling mouse leave node");
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    dispatch(retrieveHighlightsSave());
  };

  const scaledWidth = 0.85 * windowWidth;
  const scaledHeight = 0.85 * windowHeight;

  return (
    <div id="visualizer-container" style={{ width: '100%', height: '100%' }}>
      <svg id='network' ref={svgRef} style={{ width: scaledWidth, height: scaledHeight }}>
      </svg>
    </div>
  );
};

export default Visualizer;
