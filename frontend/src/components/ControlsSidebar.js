import React, { useEffect , useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setForceStrength, setLinkDistance, setSidebarWidth, setCentrality, setRadiusRange, setTriggerZoomToFit , setTriggerZoomToSelection} from '../features/ui/uiSlice';
import { fetchComponentsSummary } from '../features/characters/characterSlice';
import { fetchGuestComponentsSummary , setSelectedGuestComponent} from '../features/guests/guestSlice';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { BiInfoCircle } from "react-icons/bi";
import { Modal , Button} from 'react-bootstrap';

const ControlsSidebar = ({ selectedComponent, setSelectedComponent, componentsSummary }) => {
    const dispatch = useDispatch();
    const forceStrength = useSelector(state => state.ui.forceStrength);
    const linkDistance = useSelector(state => state.ui.linkDistance);
    const sidebarWidth = useSelector(state => state.ui.sidebarWidth);
    const currentCentrality = useSelector(state => state.ui.currentCentrality);
    const radiusRange = useSelector(state => state.ui.radiusRange);
    const currentNetwork = useSelector(state => state.ui.currentNetwork);
    const currentComponent = useSelector(state => state.ui.currentComponent);

    const characterComponentsSummary = useSelector(state => state.characters.componentsSummary);
    const guestComponentsSummary = useSelector(state => state.guests.componentsSummary);

    const [isCentralityInfoOpen, setIsCentralityInfoOpen] = useState(false);

    const toggleCentralityInfo = () => {
        setIsCentralityInfoOpen(!isCentralityInfoOpen);
        console.log(`You clicked the info button!  The current value of isCentralityInfoOpen after toggling is ${isCentralityInfoOpen}`);
      };

    useEffect(() => {
        if (currentNetwork === 'characters') {
            dispatch(fetchComponentsSummary());
        } else if (currentNetwork === 'guests') {
            dispatch(fetchGuestComponentsSummary());
        }
    }, [dispatch, currentNetwork]);

    const createHandleSliderChange = (actionCreator) => (e) => {
        const value = Number(e.target.value);
        dispatch(actionCreator(value));
    };

    const handleForceStrengthChange = createHandleSliderChange(setForceStrength);
    const handleLinkDistanceChange = createHandleSliderChange(setLinkDistance);

    const handleCentralityChange = (event) => {
        dispatch(setCentrality(event.target.value));
    };

    const handleRadiusChange = (values) => {
        dispatch(setRadiusRange(values));
    };

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

    const handleZoomToFit = () => {
        dispatch(setTriggerZoomToFit(true));
    };

    const handleZoomToSelection = () => {
        dispatch(setTriggerZoomToSelection(true));
    }

    const currentComponentsSummary = currentNetwork === 'characters' ? characterComponentsSummary : guestComponentsSummary;

    return (
        <div className="controls-sidebar" >
            <div className="controls-resizer"></div>
            <div style={styles.container}>
                <h3>Controls</h3>
                <div  className="control-group">
                    <label htmlFor="component-selector" className='label'>Select Component</label>
                    <select
                        id="component-selector"
                        value={selectedComponent}
                        onChange={(e) => setSelectedComponent(Number(e.target.value))}
                        style={styles.select}
                    >
                        {currentComponentsSummary.map((comp) => (
                            <option key={comp.id} value={comp.id}>
                                Component {comp.id} - Order: {comp.size} ({comp.percentage.toFixed(2)}%)
                            </option>
                        ))}
                    </select>
                </div>
                <hr />
                <div className="control-group">
                    <label htmlFor="chargeStrength" className='label'>Charge Strength: {forceStrength}</label>
                    <input
                        type="range"
                        id="chargeStrength"
                        min="0"
                        max="10000"
                        value={forceStrength}
                        onChange={handleForceStrengthChange}
                        style={styles.slider}
                    />
                    
                </div>
                <hr />
                <div className='control-group'>
                    <label htmlFor="linkDistance" className='label'>Link Distance: {linkDistance}</label>
                    <input
                        type="range"
                        id="linkDistance"
                        min="1"
                        max="1000"
                        value={linkDistance}
                        onChange={handleLinkDistanceChange}
                        style={styles.slider}
                    />
                </div>
                <hr />
                <div className="node-sizing-container">
                    <h4>Node Sizing</h4>
                    <div className="centrality-container">
                        <div className="heading-info-question">
                            <h6>Size by Centrality Rank</h6>
                            <BiInfoCircle onClick={toggleCentralityInfo} style={{cursor: 'pointer' }}/> 
                            <Modal show={isCentralityInfoOpen} onHide={toggleCentralityInfo}>
                                <Modal.Header closeButton>
                                  <Modal.Title>Centrality Info</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                  <p>This is where we will write information describing centrality measures.</p>
                                </Modal.Body>
                                <Modal.Footer>
                                  <Button variant="secondary" onClick={toggleCentralityInfo}>Close</Button>
                                </Modal.Footer>
                            </Modal>
                        </div>
                        <div>
                            <input
                                type="radio"
                                id="none"
                                name="centrality"
                                value="none"
                                checked={currentCentrality === 'none'}
                                onChange={handleCentralityChange}
                            />
                            <label htmlFor="none">Uniform</label>
                        </div>
                        <div>
                            <input
                                type="radio"
                                id="degree"
                                name="centrality"
                                value="degree"
                                checked={currentCentrality === 'degree'}
                                onChange={handleCentralityChange}
                            />
                            <label htmlFor="degree">Degree</label>
                        </div>
                        <div>
                            <input
                                type="radio"
                                id="betweenness"
                                name="centrality"
                                value="betweenness"
                                checked={currentCentrality === 'betweenness'}
                                onChange={handleCentralityChange}
                            />
                            <label htmlFor="betweenness">Betweenness</label>
                        </div>
                        <div>
                            <input
                                type="radio"
                                id="eigenvector"
                                name="centrality"
                                value="eigenvector"
                                checked={currentCentrality === 'eigenvector'}
                                onChange={handleCentralityChange}
                            />
                            <label htmlFor="eigenvector">Eigenvector</label>
                        </div>
                        <div>
                            <input
                                type="radio"
                                id="closeness"
                                name="centrality"
                                value="closeness"
                                checked={currentCentrality === 'closeness'}
                                onChange={handleCentralityChange}
                            />
                            <label htmlFor="closeness">Closeness</label>
                        </div>
                    </div>
                    <hr />
                    <div className="slider-range-container">
                        <label>Node Radius Range</label>
                        <Slider range
                            min={1}
                            max={200}
                            defaultValue={[radiusRange.minRadius, radiusRange.maxRadius]}
                            onChange={handleRadiusChange}
                        />
                        <div>Min Radius: {radiusRange.minRadius}</div>
                        <div>Max Radius: {radiusRange.maxRadius}</div>
                    </div>
                    <hr />
                </div>  
                <button onClick={handleZoomToFit} style={styles.button}>Zoom to Fit</button>
                <button onClick={handleZoomToSelection} style={styles.button}>Zoom to Selection</button>
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
    button: {
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default ControlsSidebar;
