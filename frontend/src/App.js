import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCharacters, setSelectedComponent as setSelectedCharacterComponent, fetchComponentsSummary as fetchCharacterComponentsSummary } from './features/characters/characterSlice';
import { fetchGuests, setSelectedGuestComponent as setSelectedGuestComponent, fetchGuestComponentsSummary as fetchGuestComponentsSummary } from './features/guests/guestSlice';
import { selectNode, switchNetwork , switchComponent , setHighlights , selectEpisode , saveHighlights} from './features/ui/uiSlice';
import { fetchEpisodes , setEpisodes} from './features/episodes/episodeSlice';
import Visualizer from './components/Visualizer';
import Sidebar from './components/Sidebar';
import ControlsSidebar from './components/ControlsSidebar';
import NetworkSwitcher from './components/NetworkSwitcher';
import SearchBar from './components/SearchBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';



const App = () => {
    const dispatch = useDispatch();
    const currentNetwork = useSelector((state) => state.ui.currentNetwork);
    const selectedNodeId = useSelector((state) => state.ui.selectedNodeId);

    const characterComponentsSummary = useSelector((state) => state.characters.componentsSummary);
    const guestComponentsSummary = useSelector((state) => state.guests.componentsSummary);

    const currentComponent = useSelector((state) => state.ui.currentComponent);

    const episodes = useSelector((state) => state.episodes.episodes);
    const windowState = useSelector((state) => state.ui.window);
    const windowWidth = windowState.width;
    const topbarWidth = windowWidth * 0.75;
    const windowHeight = windowState.height;
    
    useEffect(() => {
        if (currentNetwork === 'characters') {
            dispatch(fetchCharacterComponentsSummary());
        } else if (currentNetwork === 'guests') {
            dispatch(fetchGuestComponentsSummary());
        }
    }, [dispatch, currentNetwork]);

    useEffect(() => {
        const episodeValues = Object.values(episodes);

        if (episodeValues.length === 0) {
            dispatch(fetchEpisodes());
        }

    }, [episodes, dispatch]);

    useEffect(() => {
        if (currentNetwork === 'characters' && characterComponentsSummary.length > 0 && currentComponent === 0) {
            dispatch(fetchCharacters(0));
        } else if (currentNetwork === 'guests' && guestComponentsSummary.length > 0 && currentComponent === 0) {
            dispatch(fetchGuests(0));
        }
    }, [characterComponentsSummary, guestComponentsSummary, dispatch, currentComponent , currentNetwork]);

    const handleClickOutside = useCallback((event) => {
        if ((selectedNodeId || selectEpisode) && event.target.classList.contains('network-svg')) {
            dispatch(selectEpisode(null));
            dispatch(setHighlights({nodes: [], edges: []}));
            dispatch(saveHighlights({nodes: [], edges: []}));
            dispatch(selectNode(null)); // Deselect node
        }
    }, [dispatch, selectedNodeId]);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, [handleClickOutside]);

    const handleComponentChange = (component) => {
        dispatch(switchComponent(component));
    };

    const componentsSummary = currentNetwork === 'characters' ? characterComponentsSummary : guestComponentsSummary;


    return (
        <div className='container'>
            <ControlsSidebar
            selectedComponent={currentComponent}
            setSelectedComponent={handleComponentChange}
            componentsSummary={componentsSummary}
            />
            <div className='visualizer-container'>
                <div className="top-bar" style={{width: topbarWidth}}>
                    <NetworkSwitcher /> 
                    <SearchBar />
                </div>
                <Visualizer />
            </div>
            <Sidebar />
        </div>
    );
};

export default App;
