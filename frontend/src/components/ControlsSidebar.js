import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setForceStrength, setLinkDistance, setSidebarWidth } from '../features/ui/uiSlice';

const ControlsSidebar = ({ selectedComponent, setSelectedComponent, componentsSummary }) => {
    const dispatch = useDispatch();
    const forceStrength = useSelector(state => state.ui.forceStrength);
    const linkDistance = useSelector(state => state.ui.linkDistance);
    const sidebarWidth = useSelector(state => state.ui.sidebarWidth);

    const createHandleSliderChange = (actionCreator) => (e) => {
        const value = Number(e.target.value);
        dispatch(actionCreator(value));
    };

    const handleForceStrengthChange = createHandleSliderChange(setForceStrength);
    const handleLinkDistanceChange = createHandleSliderChange(setLinkDistance);

    useEffect(() => {
        let isResizing = false;
        let startX;
        let startWidth;
        let scrollbarWidth = 0;

        const handleMouseDown = (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = sidebarWidth;
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', stopResize);
            e.preventDefault();
            
            const sidebar = document.querySelector('.controls-sidebar');
            if (sidebar.scrollHeight > sidebar.clientHeight) {
                scrollbarWidth = sidebar.offsetWidth - sidebar.clientWidth;
            } else {
                scrollbarWidth = 0;
            }
        };

        const handleMouseMove = (e) => {
            if (!isResizing) return;
            let deltaX = e.clientX - startX;
            let newWidth = startWidth + deltaX + scrollbarWidth;
    
            if (newWidth > 100) {
                dispatch(setSidebarWidth(newWidth));
            }
        };

        const stopResize = (e) => {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', stopResize);
            e.stopPropagation();
        };

        const resizer = document.querySelector('.controls-resizer');
        resizer.addEventListener('mousedown', handleMouseDown);

        return () => {
            resizer.removeEventListener('mousedown', handleMouseDown);
        };
    }, [sidebarWidth, dispatch]);

    return (
        <div className="controls-sidebar" style={{ width: `${sidebarWidth}px` }}>
            <div className="controls-resizer"></div>
            <div style={styles.container}>
                <div style={styles.controlGroup}>
                    <label htmlFor="component-selector" style={styles.label}>Select Component:</label>
                    <select
                        id="component-selector"
                        value={selectedComponent}
                        onChange={(e) => setSelectedComponent(Number(e.target.value))}
                        style={styles.select}
                    >
                        {componentsSummary.map((comp) => (
                            <option key={comp.index} value={comp.index}>
                                Component {comp.index} - Order: {comp.size} ({comp.percentage.toFixed(2)}%)
                            </option>
                        ))}
                    </select>
                </div>
                <div style={styles.controlGroup}>
                    <label htmlFor="chargeStrength" style={styles.label}>Charge Strength:</label>
                    <input
                        type="range"
                        id="chargeStrength"
                        min="0"
                        max="10000"
                        value={forceStrength}
                        onChange={handleForceStrengthChange}
                        style={styles.slider}
                    />
                    <span style={styles.value}>{forceStrength}</span>
                </div>
                <div style={styles.controlGroup}>
                    <label htmlFor="linkDistance" style={styles.label}>Link Distance:</label>
                    <input
                        type="range"
                        id="linkDistance"
                        min="1"
                        max="1000"
                        value={linkDistance}
                        onChange={handleLinkDistanceChange}
                        style={styles.slider}
                    />
                    <span style={styles.value}>{linkDistance}</span>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        height: '100%',
    },
    controlGroup: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#333',
    },
    select: {
        width: '100%',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '14px',
    },
    slider: {
        width: '100%',
        marginTop: '5px',
    },
    value: {
        display: 'block',
        marginTop: '5px',
        textAlign: 'right',
        color: '#555',
        fontSize: '14px',
    },
};

export default ControlsSidebar;