export function highlightNode(selectedNodeId, node, link, labels) {
    // Reset all nodes and links to default styles
    resetHighlights(node, link, labels);
    // Highlight the selected node
    node.filter(d => d.id === selectedNodeId)
        .attr("stroke", "red").attr("opacity", 1);

    // Highlight all connected links
    link.filter(d => d.source.id === selectedNodeId || d.target.id === selectedNodeId)
        .transition().duration(500)
        .attr("stroke", "red").attr("opacity", 1);

    // Highlight all adjacent nodes
    node.filter(d => link.data().some(link => (link.source.id === selectedNodeId || link.target.id === selectedNodeId) && (link.source.id === d.id || link.target.id === d.id)))
        .transition().duration(500)
        .attr("stroke", "red").attr("opacity", 1);
    
    // Dim all nonadjacent nodes and not the node itself
    node.filter(d => link.data().every(link => (link.source.id !== selectedNodeId && link.target.id !== selectedNodeId) || (link.source.id !== d.id && link.target.id !== d.id)))
        .transition().duration(500)
        .attr("opacity", 0.3);
    
    
    // Dim all non-incident links
    link.filter(d => d.source.id !== selectedNodeId && d.target.id !== selectedNodeId)
        .transition().duration(500)
        .attr("opacity", 0.3);
    
    // Apply dimming class to nonadjacent labels
    labels.filter(d => !link.data().some(l => (l.source.id === selectedNodeId || l.target.id === selectedNodeId) && (l.source.id === d.id || l.target.id === d.id)))
        .transition().duration(500)
        .attr("opacity", 0.3);
    
}

export function resetHighlights(node, link, labels) {
    // Reset nodes
    node.transition().duration(500)
        .attr("stroke", "#000").attr("opacity", 1);
    // Reset links
    link.transition().duration(500)
        .attr("stroke", "#4fedff").attr("stroke-opacity", 0.6).attr("opacity", 1);

    labels.transition().duration(500)
        .attr("opacity", 1);
    
}