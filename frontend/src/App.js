import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCharacters, setSelectedComponent, fetchComponentsSummary } from './features/characters/characterSlice';
import { selectNode } from './features/ui/uiSlice';
import Visualizer from './components/Visualizer';
import Sidebar from './components/Sidebar';
import ControlsSidebar from './components/ControlsSidebar';
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

    useEffect(() => {
        // Add event listener to handle clicks outside the sidebar
        const handleClickOutside = (event) => {
            if (!event.target.closest('.sidebar') && !event.target.closest('circle')) {
                dispatch(selectNode(null)); // Deselect node
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [dispatch]);

    const handleComponentChange = (component) => {
        dispatch(setSelectedComponent(component));
        dispatch(fetchCharacters(component));
    };

    return (
        <div style={mainLayoutStyles.container}>
            <ControlsSidebar
                selectedComponent={selectedComponent}
                setSelectedComponent={handleComponentChange}
                componentsSummary={componentsSummary}
            />
            <div style={mainLayoutStyles.visualizerContainer}>
                <Visualizer />
            </div>
            <Sidebar />
        </div>
    );
};

const mainLayoutStyles = {
    container: {
        display: 'flex',
        height: '100vh',
    },
    visualizerContainer: {
        flex: 1,
        position: 'relative',
    },
};

export default App;
