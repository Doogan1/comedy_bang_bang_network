import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCharacters, setSelectedComponent, fetchComponentsSummary } from './features/characters/characterSlice';
import Visualizer from './components/Visualizer';
import Sidebar from './components/Sidebar';
import Controls from './components/Controls';
import './styles.css';

const App = () => {

    const dispatch = useDispatch();
    const selectedComponent = useSelector((state) => state.characters.selectedComponent);
    const componentsSummary = useSelector((state) => state.characters.componentsSummary);
    const nodes = useSelector((state) => state.characters.nodes);
    const edges = useSelector((state) => state.characters.edges);

    useEffect(() => {
        // Fetch component summary when the component mounts
        dispatch(fetchComponentsSummary('characters')); // Adjust 'characters' if needed
    }, [dispatch]);

    useEffect(() => {
        // Fetch the initial component (component 0) once the componentsSummary is fetched
        if (componentsSummary.length > 0 && selectedComponent === 0) {
            dispatch(fetchCharacters(0));
        }
    }, [componentsSummary, dispatch, selectedComponent]);
    
    const handleComponentChange = (component) => {
        dispatch(setSelectedComponent(component));
        dispatch(fetchCharacters(component));
    };

    return (
        <div>
            <Controls
                selectedComponent={selectedComponent}
                setSelectedComponent={handleComponentChange}
                componentsSummary={componentsSummary}
            />
            <Visualizer nodes={nodes} edges={edges} />
        </div>
    );
};

export default App;
