import { setupEventListeners } from "/static/visualizer/eventHandling.js";
import { highlightNode , resetHighlights } from "/static/visualizer/networkBehavior.js";
import { NetworkSimulation } from "/static/visualizer/networkSimulation.js";
import { highlightActiveTab } from "/static/visualizer/menuBehavior.js";

// Static Visualization Setup

let currentEntityType = 'characters';

export function setupVisualization(containerId) {
    let networkContainer = document.getElementById(containerId);
    let svg = d3.select(networkContainer).select("svg.networkSVG");
    let contentGroup = svg.select("g");
    const width = networkContainer.clientWidth;
    const height = networkContainer.clientHeight;

    if (svg.empty()) {
        // Create the SVG if it does not exist
        svg = d3.select(networkContainer).append("svg")
            .classed("networkSVG", true)
            .attr("width", width)
            .attr("height", height);

        const zoom = d3.zoom().on("zoom", (event) => {
            contentGroup.attr("transform", event.transform);
        });

        svg.call(zoom);

        // Create a 'g' element to hold all the content to be zoomed
        contentGroup = svg.append("g");

        return { svg, contentGroup, width, height, zoom };
    } else {
        // Update the dimensions of the existing SVG
        svg.attr("width", width)
            .attr("height", height);

        return { svg, contentGroup, width, height, zoom: d3.zoom().on("zoom", (event) => contentGroup.attr("transform", event.transform)) };
    }
}


export function fetchCharacterDetails(characterId, simulation) {
        fetch(`/api/characters/${characterId}/`)
            .then(response => response.json())
            .then(data => {
                // Display the sidebar with character details
                document.getElementById('characterDetails').style.display = 'block';
                document.getElementById('characterName').textContent = data.character_name;
                const actorList = document.getElementById('playedBy');
                actorList.innerHTML = '';
                actorList.textContent = 'Played By: '
                data.actors.forEach(actor => {
                    const actorLink = document.createElement('span');
                    actorLink.textContent += actor.name;
                    actorLink.className = 'actor-link';
                    actorLink.onclick = () => switchToGuest(actor.id, simulation);  // Function to switch view and focus
                    actorList.appendChild(actorLink);
                    actorList.appendChild(document.createTextNode(', ')); // Add commas between names
                });
                actorList.lastChild.remove();  // Remove the last comma

                const episodeList = document.getElementById('episodeList');
                episodeList.innerHTML = '';  // Clear previous entries
                data.episodes.forEach(episode => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${episode.title}</td>
                        <td>${episode.episode_number}</td>
                        <td>${episode.release_date}</td>
                    `;
                    episodeList.appendChild(tr);
                });
            })
            .catch(error => console.error('Error fetching character details:', error));
}

function switchToGuest(guestId, simulation) {
    switchEntityType('guests');  // Function that switches the entityType and reloads the guest network
    setTimeout(() => {  // Wait for network to load, then focus on guest
        simulation.focusOnGuest(guestId);  // Function to focus or zoom in on the guest
    }, 1000);  // Adjust timing as necessary
}



export function fetchGuestDetails(guestId) {
    fetch(`/api/guests/${guestId}/`)
        .then(response => response.json())
        .then(data => {
            // Display the sidebar with character details
            document.getElementById('guestDetails').style.display = 'block';
            document.getElementById('guestName').textContent = data.character_name;
            const episodeList = document.getElementById('guestEpisodeList');
            episodeList.innerHTML = '';  // Clear previous entries
            data.episodes.forEach(episode => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${episode.title}</td>
                    <td>${episode.episode_number}</td>
                    <td>${episode.release_date}</td>
                `;
                episodeList.appendChild(tr);
            });
        })
        .catch(error => console.error('Error fetching character details:', error));
}

export function getCurrentEntityType() {
    // Find the element with the class 'selected' among the tabs
    const selectedTab = document.querySelector('.tab.selected');
    // Return the lowercase text content of the selected tab
    if (selectedTab) {
        return selectedTab.textContent.toLowerCase().trim();
    }
    return null; // Return null if no tab is selected
}

export function populateComponentSelector(entityType) {
    fetch(`/api/components-summary/${entityType}`)
        .then(response => response.json())
        .then(components => {
            const selector = document.getElementById('componentSelector');
            selector.innerHTML = '';  // Clear existing options
            components.forEach(component => {
                const option = document.createElement('option');
                option.value = component.index;
                option.text = `Component ${component.index + 1} - ${component.size} nodes (${component.percentage.toFixed(2)}%)`;
                selector.appendChild(option);
            });
            selector.onchange = () => fetchAndDisplayComponent(selector.value);
        })
        .catch(error => console.error('Error fetching component summaries:', error));
}
// Fetch and Display Component
export function fetchAndDisplayComponent(componentIndex) {
    clearVisualization();
    fetch(`/api/network/${currentEntityType}/?component=${componentIndex}`)
        .then(response => response.json())
        .then(data => {
            const { svg, contentGroup, width, height, zoom } = setupVisualization('network');
            const { simulation, node, link, labels} = createVisualization(svg, contentGroup, width, height, data.nodes, data.edges, zoom);
            setupEventListeners(simulation, node, link, labels, svg, zoom);
            updateNodeSizes('degree');
            toggleNodeNames(document.getElementById('toggleNames').checked);
        });
}

export function switchEntityType(newEntityType) {
    currentEntityType = newEntityType;
    highlightActiveTab(currentEntityType);
    populateComponentSelector(currentEntityType);
    fetchAndDisplayComponent(0); // Always fetch the first component on switch
}

export function toggleNodeNames(showNames) {
    const labels = d3.selectAll(".node-label");
    if (showNames) {
        labels.style("display", "block");
    } else {
        labels.style("display", "none");
    }
}

export function updateNodeSizes(centralityMeasure) {
    const nodes = d3.selectAll("circle");
    const centralityValues = nodes.data().map(node => node[centralityMeasure]);
    const sizeScale = d3.scaleLinear()
                        .domain([d3.min(centralityValues), d3.max(centralityValues)])
                        .range([5, 25]); // Customize the range based on your visualization needs
    const scaleFactor = parseFloat(document.getElementById('nodeScale').value);

    nodes.transition()
         .duration(500)
         .attr("r", node => {
            node.radius = sizeScale(node[centralityMeasure]) * scaleFactor;
            return node.radius;
        });
    
    // Update the labels based on the new node sizes
    const labels = d3.selectAll(".node-label");
    labels.transition()
        .duration(500)
        .style("font-size", d => `${Math.max(10, d.radius)}px`);
}

// Clear SVG content and reset simulation
function clearVisualization() {
    const svg = d3.select('#network svg');
    if (!svg.empty()) {
        svg.remove();  // Remove the entire SVG to clear all contents
    }
    if (typeof simulation !== 'undefined' && simulation) {
        simulation.stop();  // Stop any running simulation
    }
}

function createVisualization(svg, group, width, height, nodes, edges, zoom) {
    const link = group.append("g")
        .attr("stroke", "#4fedff")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(edges.map(link => ({
            ...link,
            source: nodes.find(n => n.id === link.source),
            target: nodes.find(n => n.id === link.target),
            value: link.value
        })))
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value))
        .attr("x1", d => d.source.position[0] * width)
        .attr("y1", d => d.source.position[1] * height)
        .attr("x2", d => d.target.position[0] * width)
        .attr("y2", d => d.target.position[1] * height)
        .attr("opacity", 1)
        .attr("stroke-opacity", 0.6);

    const node = group.append("g")
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .classed("node", true) // Add 'node' class to each circle for event handling
        .attr("r", d => d.radius = 5)
        .attr("fill", "blue")
        .attr("node-id", d => d.id)
        .attr("cx", d => d.position[0] * width)
        .attr("cy", d => d.position[1] * height)
        .attr("fx", d => d.position[0] * width)
        .attr("fy", d => d.position[1] * height)
        .attr("opacity", 1);
    

    node.each(function(d) {
        d3.select(this).data()[0].centrality = d.centrality;
    });

    const labels = group.append("g")
        .selectAll(".node-label")
        .data(nodes)
        .enter().append("text")
        .attr("class", "node-label")
        .attr("x", d => d.position[0] * width)
        .attr("y", d => (d.position[1] * height) - 10)
        .text(d => d.name)
        .style("display", "block")
        .style("font-size", d => `${Math.max(10, d.radius * 2)}px`)
        .attr("opacity", 1); 

    // Further node and link setup, including 'title' for tooltips or labels, etc.
    node.append("title")
        .text(d => d.name);

    // node.on("click", (event, d) => {
    //     highlightNode(d, node, link, labels);
    //     event.stopPropagation();
    // });

    // svg.on("click", function(event) {
    //     // Check if the click was directly on the SVG and not on any child elements
    //     if (event.target === this) {
    //         resetHighlights(node, link, labels);
    //     }
    // });
    

    // Instantiate the simulation class
    const simulation = new NetworkSimulation(svg, group, zoom, width, height, nodes, edges, node, link, labels);


    return {simulation, node, link, labels};


    // Attach event listeners for controlling the simulation
    // document.getElementById('toggleSimulation').addEventListener('click', () => simulation.toggleSimulation());
    // document.getElementById('linkDistance').addEventListener('input', () => simulation.updateForces());
    // document.getElementById('chargeStrength').addEventListener('input', () => simulation.updateForces());
    // document.getElementById('centralitySelector').addEventListener('change', function() {
    //     updateNodeSizes(this.value);
    // });
    // document.getElementById('toggleNames').addEventListener('change', function() {
    //     toggleNodeNames(this.checked);
    // });
    // document.getElementById('nodeScale').addEventListener('input', function() {
    //     const scaleFactor = parseFloat(this.value);
    //     const centralityMeasure = document.getElementById('centralitySelector').value;
    //     document.getElementById('scaleValue').textContent = `${scaleFactor}x`;
    
    //     updateNodeSizes(centralityMeasure);
    // });
    
    // // Event listeners for switching between characters and guests
    // document.getElementById('tab-characters').addEventListener('click', () => switchEntityType('characters'));
    // document.getElementById('tab-guests').addEventListener('click', () => switchEntityType('guests'));


    
    
    // // Optionally, add an event listener to close the sidebar when clicking outside it
    // document.addEventListener('click', function(event) {
    //     if (!document.getElementById('characterDetails').contains(event.target)) {
    //         document.getElementById('characterDetails').style.display = 'none';
    //     }
    // }, true);
}

export function calculateGraphBounds(nodes, width, height) {
    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;

    nodes.forEach(d => {
        if (d.x < xMin) xMin = d.x;
        if (d.x > xMax) xMax = d.x;
        if (d.y < yMin) yMin = d.y;
        if (d.y > yMax) yMax = d.y;
    });

    return { x: xMin, y: yMin, width: xMax - xMin, height: yMax - yMin };
}


