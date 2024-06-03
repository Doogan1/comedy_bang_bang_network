import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCharacters, setSelectedComponent as setSelectedCharacterComponent, fetchComponentsSummary as fetchCharacterComponentsSummary } from './features/characters/characterSlice';
import { fetchGuests, setSelectedGuestComponent as setSelectedGuestComponent, fetchGuestComponentsSummary as fetchGuestComponentsSummary } from './features/guests/guestSlice';
import { selectNode, switchNetwork } from './features/ui/uiSlice';
import Visualizer from './components/Visualizer';
import Sidebar from './components/Sidebar';
import ControlsSidebar from './components/ControlsSidebar';
import NetworkSwitcher from './components/NetworkSwitcher';
import SearchBar from './components/SearchBar';
import './styles.css';

const App = () => {
    const dispatch = useDispatch();
    const currentNetwork = useSelector((state) => state.ui.currentNetwork);
    const selectedNodeId = useSelector((state) => state.ui.selectedNodeId);
    const selectedCharacterComponent = useSelector((state) => state.characters.selectedComponent);
    const characterComponentsSummary = useSelector((state) => state.characters.componentsSummary);
    const selectedGuestComponent = useSelector((state) => state.guests.selectedComponent);
    const guestComponentsSummary = useSelector((state) => state.guests.componentsSummary);

    
    useEffect(() => {
        if (currentNetwork === 'characters') {
            dispatch(fetchCharacterComponentsSummary());
        } else if (currentNetwork === 'guests') {
            dispatch(fetchGuestComponentsSummary());
        }
    }, [dispatch, currentNetwork]);

    useEffect(() => {
        if (currentNetwork === 'characters' && characterComponentsSummary.length > 0 && selectedCharacterComponent === 0) {
            dispatch(fetchCharacters(0));
        } else if (currentNetwork === 'guests' && guestComponentsSummary.length > 0 && selectedGuestComponent === 0) {
            dispatch(fetchGuests(0));
        }
    }, [characterComponentsSummary, guestComponentsSummary, dispatch, selectedCharacterComponent, selectedGuestComponent, currentNetwork]);

    const handleClickOutside = useCallback((event) => {

        if (selectedNodeId && event.target.nodeName === 'svg') {
            dispatch(selectNode(null)); // Deselect node
        }
    }, [dispatch, selectedNodeId]);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [handleClickOutside]);

    const handleComponentChange = (component) => {
        if (currentNetwork === 'characters') {
            dispatch(setSelectedCharacterComponent(component));
            dispatch(fetchCharacters(component));
        } else if (currentNetwork === 'guests') {
            dispatch(setSelectedGuestComponent(component));
            dispatch(fetchGuests(component));
        }
    };

    const componentsSummary = currentNetwork === 'characters' ? characterComponentsSummary : guestComponentsSummary;
    const selectedComponent = currentNetwork === 'characters' ? selectedCharacterComponent : selectedGuestComponent;

    return (
        <div className='container'>
            <ControlsSidebar
                selectedComponent={selectedComponent}
                setSelectedComponent={handleComponentChange}
                componentsSummary={componentsSummary}
            />
            <div className='visualizer-container'>
                <div className="top-bar">
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
