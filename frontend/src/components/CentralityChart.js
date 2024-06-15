import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import * as d3 from 'd3';

const CentralityChart = ({ show, handleClose, data }) => {
  const svgRef = React.useRef();
  const selectedNodeId = useSelector(state => state.ui.selectedNodeId);
  React.useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 10, right: 30, bottom: 30, left: 40 },
      width = 450 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, d3.max(data)])
      .range([0, width]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    const histogram = d3.bin()
      .domain(x.domain())
      .thresholds(x.ticks(70));

    const bins = histogram(data);

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(bins, d => d.length)]);

    g.append("g")
      .call(d3.axisLeft(y));

    g.selectAll("rect")
      .data(bins)
      .enter().append("rect")
      .attr("x", 1)
      .attr("transform", d => `translate(${x(d.x0)},${y(d.length)})`)
      .attr("width", d => x(d.x1) - x(d.x0) - 1)
      .attr("height", d => height - y(d.length))
      .style("fill", "#69b3a2");

    const selectedNodeValue = data.find(d => {

        return d.id === selectedNodeId;
    }).value;

    g.append("line")
      .attr("x1", x(selectedNodeValue))
      .attr("x2", x(selectedNodeValue))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "red")
      .attr("stroke-width", 2);
  }, [data, selectedNodeId]);

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Centrality Distribution</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <svg ref={svgRef} width="450" height="400"></svg>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CentralityChart;
