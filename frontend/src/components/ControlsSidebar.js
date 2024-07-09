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
                    max="40000"
                    value={forceStrength}
                    onChange={handleForceStrengthChange}
                    className='slider'
                />
                
            </div>
            <hr />
            <div className='control-group'>
                <label htmlFor="linkDistance" className='label'>Link Distance: {linkDistance}</label>
                <input
                    type="range"
                    id="linkDistance"
                    min="1"
                    max="2000"
                    value={linkDistance}
                    onChange={handleLinkDistanceChange}
                    className='slider'
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
                                <p>
                                    Centrality is a fundamental concept in network analysis that measures the importance or influence of individual nodes within a network. 
                                    It helps identify the most significant nodes that can affect the overall structure and behavior of the network. 
                                    There are several types of centrality metrics, each capturing different aspects of a node's prominence.
                                </p>
                                <p>
                                    In the context of the Comedy Bang Bang network, centrality metrics are used to analyze and visualize the relationships and interactions between characters or between guests on the podcast. 
                                    Read on for an overview of each type of centrality utilized here and what each means in the context of the Comedy Bang Bang network. 
                                    For more detailed and extensive information on centrality measures, you can visit <a target="_blank" href="https://en.wikipedia.org/wiki/Centrality">this website</a>.
                                </p>
                                <h5>Degree Centrality</h5>
                                <p>
                                    Degree centrality is the simplest centrality measure and is defined as the number of edges incident with the vertex which also corresponds to the number of neighbors of the node. 
                                    For more information, see <a target="_blank" href="https://en.wikipedia.org/wiki/Centrality#Degree_centrality">Degree Centrality</a>.
                                </p>
                                <p>
                                    In the context of the Comedy Bang Bang Network character network, the degree of a node is the number of unique characters they've appeared with over all episodes.
                                </p>
                                <h5>Betweenness Centrality</h5>
                                <p>
                                    Betweenness centrality quantifies the number of times a node contributes to the shortest path between two other nodes. 
                                    It is a measure of the influence a node has over the flow of information communicated or materials transfered between nodes. 
                                    Nodes with high betweenness centrality lie on many shortest paths between nodes, so they play an important role in communication between nodes. 
                                    For more detailed information including how it is calculated, please visit <a target="_blank" href="https://en.wikipedia.org/wiki/Centrality#Betweenness_centrality">Betweenness Centrality</a>.
                                </p>
                                <p>
                                    In the context of the Comedy Bang Bang character network, vertices with high betweenness act as bridges between different groups, showing their role in connecting various parts of the network.
                                </p>
                                <h5>Eigenvector Centrality</h5>
                                <p>
                                    Eigenvector centrality measures the influence of a node within a network. 
                                    It assigns relative scores to all nodes in the network based on the concept that connections to high-scoring nodes contribute more to the score of the node in question than equal connections to low-scoring nodes. 
                                    This means that a node is considered more central if it is connected to many nodes that themselves are highly central. 
                                    For more detailed information including how it is calculated, please visit <a target="_blank" href="https://en.wikipedia.org/wiki/Centrality#Eigenvector_centrality">Eigenvector Centrality</a>.
                                </p>
                                <p>
                                    In the Comedy Bang Bang networks, nodes with high eigenvector centrality are important in the sense of influence as they appear in episodes with other characters/guests of high influence.
                                </p>
                                <h5>Closeness Centrality</h5>
                                <p>
                                    Closeness centrality measures how "close" (in terms of graphical distance) a node is to the rest of the nodes in the network. 
                                    It is defined as the inverse of the sum of the shortest path distances from the node to all other nodes in the network. 
                                    Nodes with high closeness centrality have shorter average distances to all other nodes, indicating they are closer to the center of the network. 
                                    For more detailed information including how it is calculated, please visit <a target="_blank" href="https://en.wikipedia.org/wiki/Centrality#Closeness_centrality">Closeness Centrality</a>.
                                </p>
                                <p>
                                    In the Comedy Bang Bang networks, characters/guests with high closeness require the least amount of steps to get to other characters/guests in the sense of coappearance chains.
                                </p>
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
                        max={1000}
                        defaultValue={[radiusRange.minRadius, radiusRange.maxRadius]}
                        onChange={handleRadiusChange}
                        className='slider'
                    />
                    <div>Min Radius: {radiusRange.minRadius}</div>
                    <div>Max Radius: {radiusRange.maxRadius}</div>
                </div>
            </div>
            <hr />  
            <button onClick={handleZoomToFit} style={styles.button}>Zoom to Fit</button>
            <button onClick={handleZoomToSelection} style={styles.button}>Zoom to Selection</button> 
        </div>
    );
};

const styles = {
    select: {
        width: '100%',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '14px',
    },
    value: {
        display: 'block',
        marginTop: '5px',
        textAlign: 'right',
        color: '#555',
        fontSize: '14px',
    },
    button: {
        marginTop: '5px',
        padding: '5px',
        backgroundColor: '#f6b813',
        color: '#ba2216',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
    },
};

export default ControlsSidebar;
