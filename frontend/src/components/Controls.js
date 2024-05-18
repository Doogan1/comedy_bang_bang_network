import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setForceStrength } from '../features/ui/uiSlice';

const Controls = ({ selectedComponent, setSelectedComponent, componentsSummary }) => {
    const dispatch = useDispatch();
    const forceStrength = useSelector(state => state.ui.forceStrength);
    const [sliderValue, setSliderValue] = useState(forceStrength);

    const handleSliderChange = (e) => {
        const value = Number(e.target.value);
        setSliderValue(value);
        dispatch(setForceStrength(value));
    };

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
            <label htmlFor="chargeStrength">Charge Strength:</label>
            <input
                type="range"
                id="chargeStrength"
                min="0"
                max="10000"
                value={sliderValue}
                onChange={handleSliderChange}
            />
            <span>{sliderValue}</span>
        </div>
    );
};

export default Controls;

