import { calculateGraphBounds } from  "/static/visualizer/networkDataManagement.js";

export class NetworkSimulation {
    constructor(svg, group, zoom, width, height, nodes, edges, node, link, labels) {
        this.svg = svg;
        this.group = group;
        this.width = width;
        this.height = height;
        this.nodes = nodes;
        this.edges = edges
        this.link = link
        this.node = node;
        this.labels = labels;
        this.zoom = zoom;

        this.initializeSimulation();
    }

    initializeSimulation() {
        const chargeStrength = -document.getElementById('chargeStrength').value;
        const linkDistance = document.getElementById('linkDistance').value;

        // Assuming initial positions are given in the data
        this.nodes.forEach(node => {
            node.x = node.position[0] * this.width;
            node.y = node.position[1] * this.height;
        });

        this.simulation = d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.edges).id(d => d.id).distance(linkDistance).strength(0.1))
            .force("charge", d3.forceManyBody().strength(chargeStrength))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .on("tick", () => {
                this.link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

                this.node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);

                this.labels
                    .attr("x", d => d.x)
                    .attr("y", d => d.y - d.radius)
                    .style("font-size", d => labelFontSize(d.radius));
                });
    }

    warmStart() {
        this.simulation.alpha(0.5).restart();
    }

    updateForces() {
        const linkDistance = document.getElementById('linkDistance').value;
        const chargeStrength = -1 * document.getElementById('chargeStrength').value;
        this.simulation.force("link").distance(+linkDistance);
        this.simulation.force("charge").strength(+chargeStrength);
        this.simulation.alpha(1).restart();
    }

    toggleSimulation() {
        if (this.simulation.alpha() < 0.01 || this.simulation.alpha() === 1) {

            this.simulation.alpha(1).restart(); // Ensure to restart if alpha is 1 or very low
        } else {

            this.simulation.alpha(0); // Explicitly cool down the simulation
            this.simulation.stop();
        }
    }

    adjustView() {

        // Calculate the bounds of the graph
        const bounds = calculateGraphBounds(this.nodes, this.width, this.height);


        // Fit and center the graph
        const scale = 0.95 / Math.max(bounds.width / this.width, bounds.height / this.height);
        const translate = [
            (this.width / 2) - scale * (bounds.x + bounds.width / 2),
            (this.height / 2) - scale * (bounds.y + bounds.height / 2)
        ];

        this.svg.transition()
            .duration(500) // Smooth transition
            .call(
                this.zoom.transform,
                d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
            );
    }

    focusOnGuest(guestId) {
        // Calculate the bounds of the graph
        const bounds = calculateGraphBounds(this.nodes, this.width, this.height);


        // Fit and center the graph
        const scale = 0.95 / Math.max(bounds.width / this.width, bounds.height / this.height);
        const translate = [
            (this.width / 2) - scale * (bounds.x + bounds.width / 2),
            (this.height / 2) - scale * (bounds.y + bounds.height / 2)
        ];

        this.svg.transition()
            .duration(500) // Smooth transition
            .call(
                this.zoom.transform,
                d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
            );
    }
    
    
}


// Scaling function to adjust label font size based on node radius
function labelFontSize(radius) {
    return `${Math.max(10, radius * 2)}px`; // Adjust multiplier as needed
}