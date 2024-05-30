import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCharacters, setSelectedComponent as setSelectedCharacterComponent, fetchComponentsSummary as fetchCharacterComponentsSummary } from './features/characters/characterSlice';
import { fetchGuests, setSelectedGuestComponent as setSelectedGuestComponent, fetchGuestComponentsSummary as fetchGuestComponentsSummary } from './features/guests/guestSlice';
import { selectNode, switchNetwork } from './features/ui/uiSlice';
import Visualizer from './components/Visualizer';
import Sidebar from './components/Sidebar';
import ControlsSidebar from './components/ControlsSidebar';
import NetworkSwitcher from './components/NetworkSwitcher';
import './styles.css';

const App = () => {
    const dispatch = useDispatch();
    const currentNetwork = useSelector((state) => state.ui.currentNetwork);
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

    useEffect(() => {
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
        <div style={mainLayoutStyles.container}>
            <ControlsSidebar
                selectedComponent={selectedComponent}
                setSelectedComponent={handleComponentChange}
                componentsSummary={componentsSummary}
            />
            <div style={mainLayoutStyles.visualizerContainer}>
                <NetworkSwitcher />
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
