import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCharacterDetails } from '../features/characters/characterSlice';
import { setEntityDetails , setSidebarWidth} from '../features/ui/uiSlice';

const Sidebar = () => {
    const dispatch = useDispatch();
    const { currentEntityType, selectedNodeId, entityDetails , sidebarWidth} = useSelector(state => state.ui);
  
    useEffect(() => {
        if (selectedNodeId !== null) {
            dispatch(fetchCharacterDetails(selectedNodeId))
                .then(action => {
                    if (fetchCharacterDetails.fulfilled.match(action)) {
                        dispatch(setEntityDetails(action.payload));
                    }
                });
        }
    }, [selectedNodeId, dispatch]);

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

    return (
        <div className="sidebar" id="characterDetails" style={{ display: selectedNodeId ? 'block' : 'none', width: `${sidebarWidth}px` }}>
            <div className="resizer"></div>
            <h3>{currentEntityType === 'characters' ? 'Character Details' : 'Guest Details'}</h3>
            <div><h2>{entityDetails.character_name}</h2></div>
            <div>
                <h4>Played By</h4>
                <ul>
                    {entityDetails.actors && entityDetails.actors.length > 0 ? (
                        entityDetails.actors.map((actor) => (
                            <li key={actor.id}>{actor.name}</li>
                        ))
                    ) : (
                        <li>Unknown</li>
                    )}
                </ul>
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
                    {entityDetails.episodes.map((episode, index) => (
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

