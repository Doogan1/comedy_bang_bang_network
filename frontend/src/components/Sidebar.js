import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCharacterDetails } from '../features/characters/characterSlice';
import { fetchGuestDetails } from '../features/guests/guestSlice'; 
import { setEntityDetails, setSidebarWidth, selectNode } from '../features/ui/uiSlice';
import { setTriggerZoomToFit , switchNetwork } from '../features/ui/uiSlice'; // Assuming this action exists for zooming to fit

const Sidebar = () => {
    const dispatch = useDispatch();
    const { currentNetwork, selectedNodeId, entityDetails, sidebarWidth } = useSelector(state => state.ui);

    console.log(entityDetails);

    useEffect(() => {
        if (selectedNodeId !== null) {
            if (currentNetwork === 'characters') {
                dispatch(fetchCharacterDetails(selectedNodeId))
                    .then(action => {
                        if (fetchCharacterDetails.fulfilled.match(action)) {
                            dispatch(setEntityDetails(action.payload));
                        }
                    });
            } else if (currentNetwork === 'guests') {
                dispatch(fetchGuestDetails(selectedNodeId))
                    .then(action => {
                        if (fetchGuestDetails.fulfilled.match(action)) {
                            dispatch(setEntityDetails(action.payload));
                        }
                    });
            }
        }
    }, [selectedNodeId, currentNetwork, dispatch]);

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
            
            const sidebar = document.querySelector('.sidebar');
            if (sidebar.scrollHeight > sidebar.clientHeight) {
                scrollbarWidth = sidebar.offsetWidth - sidebar.clientWidth;
            } else {
                scrollbarWidth = 0;
            }
        };

        const handleMouseMove = (e) => {
            if (!isResizing) return;
            let deltaX = e.clientX - startX;
            let newWidth = startWidth - deltaX + scrollbarWidth;
    
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

        const resizer = document.querySelector('.resizer');
        resizer.addEventListener('mousedown', handleMouseDown);

        return () => {
            resizer.removeEventListener('mousedown', handleMouseDown);
        };
    }, [sidebarWidth, dispatch]);

    const handleEntityClick = (id) => {
        const targetNetwork = currentNetwork === 'characters' ? 'guests' : 'characters';
        dispatch(switchNetwork(targetNetwork));
        dispatch(selectNode(id));
        // dispatch(setTriggerZoomToFit(true));
        // Add logic to switch networks if necessary
    };

    return (
        <div className="sidebar" id="entityDetails" style={{ display: selectedNodeId ? 'block' : 'none', width: `${sidebarWidth}px` }}>
            <div className="resizer"></div>
            <h3>{currentNetwork === 'characters' ? 'Character Details' : 'Guest Details'}</h3>
            <div><h2>{entityDetails.character_name}</h2></div>
            <div>
                <h4>{currentNetwork === 'characters' ? 'Played By' : 'Characters'}</h4>
                <div className='character-actor-sidebar-list'>
                    {currentNetwork === 'characters' && entityDetails.actors && entityDetails.actors.length > 0 ? (
                        entityDetails.actors.map((actor) => (
                            <span className="clickSpan" key={actor.id} onClick={() => handleEntityClick(actor.id)}>{actor.name}</span>
                        ))
                    ) : currentNetwork === 'guests' && entityDetails.characters && entityDetails.characters.length > 0 ? (
                        entityDetails.characters.map((character) => (
                            <span className="clickSpan" key={character.id} onClick={() => handleEntityClick(character.id)}>{character.name} </span>
                        ))
                    ) : (
                        <span>Unknown</span>
                    )}
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Episode Number</th>
                        <th>Release Date</th>
                    </tr>
                </thead>
                <tbody>
                    {entityDetails.episodes && entityDetails.episodes.map((episode, index) => (
                        <tr key={index}>
                            <td>{episode.title}</td>
                            <td>{episode.episode_number}</td>
                            <td>{episode.release_date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Sidebar;
