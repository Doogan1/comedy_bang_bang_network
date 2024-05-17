import React from 'react';

const Controls = ({ selectedComponent, setSelectedComponent, componentsSummary }) => {
    return (
        <div>
            <label htmlFor="component-selector">Select Component:</label>
            <select
                id="component-selector"
                value={selectedComponent}
                onChange={(e) => setSelectedComponent(Number(e.target.value))}
            >
                {componentsSummary.map((comp) => (
                    <option key={comp.index} value={comp.index}>
                        Component {comp.index} - Order: {comp.size} ({comp.percentage.toFixed(2)}%)
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Controls;

