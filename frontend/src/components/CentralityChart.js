import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';

const CentralityChart = ({ show, handleClose, data , selectedCentrality}) => {
  const svgRef = React.useRef();
  const selectedNodeId = useSelector(state => state.ui.selectedNodeId);
  const capitalizedSelectedCentrality = selectedCentrality.charAt(0).toUpperCase() + selectedCentrality.slice(1);

  React.useEffect(() => {
    if (!data || data.length === 0 || !selectedNodeId) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 10, right: 30, bottom: 50, left: 50 },
      width = 600 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([0, width]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text");

    const histogram = d3.bin()
      .value(d => d.value) // Ensure the histogram uses the correct value accessor
      .domain(x.domain())
      .thresholds(x.ticks(70));

    const bins = histogram(data);

    console.log('Data:', JSON.stringify(data));
    console.log('Bins:', JSON.stringify(bins));

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(bins, d => d.length)]);

    g.append("g")
      .call(d3.axisLeft(y));

    const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

    g.selectAll("rect")
      .data(bins)
      .enter().append("rect")
      .attr("x", 1)
      .attr("transform", d => `translate(${x(d.x0)},${y(d.length)})`)
      .attr("width", d => x(d.x1) - x(d.x0) - 1)
      .attr("height", d => height - y(d.length))
      .style("fill", "#69b3a2")
      .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(`Frequency: ${d.length}`)
          .style("left", `${event.pageX + 5}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mousemove", function(event) {
        tooltip.style("left", `${event.pageX + 5}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", function() {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Adding X Axis Label
    svg.append("text")
      .attr("transform", `translate(${width / 2 + margin.left}, ${height + margin.top + 40})`)
      .style("text-anchor", "middle")
      .text(`${capitalizedSelectedCentrality} Value`);

    // Adding Y Axis Label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left - 50)
      .attr("x", -height / 2 - margin.top)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Frequency");
  }, [data, selectedNodeId]);

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{capitalizedSelectedCentrality} Distribution</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <svg ref={svgRef} width="600" height="400"></svg>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CentralityChart;
