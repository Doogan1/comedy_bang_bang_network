import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCharacterDetails } from '../features/characters/characterSlice';
import { fetchGuestDetails } from '../features/guests/guestSlice';
import {
  setEntityDetails, setSidebarWidth, selectNode,
  switchComponent, setTriggerZoomToSelection, setHighlights, setCurrentZoomLevel
} from '../features/ui/uiSlice';
import { setTriggerZoomToFit, switchNetwork, selectEpisode } from '../features/ui/uiSlice'; // Assuming this action exists for zooming to fit

const Sidebar = () => {
  const dispatch = useDispatch();
  const { currentNetwork, selectedNodeId, entityDetails, sidebarWidth, currentComponent } = useSelector(state => state.ui);
  const resizerRef = useRef(null);
  const sidebarRef = useRef(null);
  const [isOpen, setIsOpen] = useState(true);
  const [sections, setSections] = useState({
    details: true,
    actors: true,
    episodes: true
  });

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
    setIsOpen(true);
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

      if (sidebarRef.current.scrollHeight > sidebarRef.current.clientHeight) {
        scrollbarWidth = sidebarRef.current.offsetWidth - sidebarRef.current.clientWidth;
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

  useEffect(() => {
    const updateResizerHeight = () => {
      const resizer = resizerRef.current;
      if (sidebarRef.current) {
        resizer.style.height = `${sidebarRef.current.scrollHeight}px`;
      }
    };

    updateResizerHeight();

    window.addEventListener('resize', updateResizerHeight);
    return () => {
      window.removeEventListener('resize', updateResizerHeight);
    };
  }, [entityDetails]);

  const handleEntityClick = (id, component) => {
    const targetNetwork = currentNetwork === 'characters' ? 'guests' : 'characters';
    dispatch(switchNetwork(targetNetwork));
    dispatch(switchComponent(component - 1));
    dispatch(selectNode(id));
  };

  const handleEpisodeClick = (episodeId) => {
    dispatch(selectNode(null));
    dispatch(selectEpisode(episodeId));
  };

  const toggleSection = (section) => {
    setSections(prevSections => ({
      ...prevSections,
      [section]: !prevSections[section]
    }));
  };

  const closeSidebar = () => {
    setIsOpen(false);
    dispatch(selectNode(null));
  };

  if (!isOpen) return null;

  return (
    <div className="sidebar" id="entityDetails" ref={sidebarRef} style={{ display: selectedNodeId ? 'block' : 'none', width: `${sidebarWidth}px` }}>
      <div className="resizer" ref={resizerRef}></div>
      <button onClick={closeSidebar} style={{ position: 'absolute', top: '5px', left: `15px` }}>X</button>
      <h3>{currentNetwork === 'characters' ? 'Character Details' : 'Guest Details'}</h3>
      <div><h2>{entityDetails.character_name}</h2></div>
      <hr />
      <div>
        <h4 onClick={() => toggleSection('actors')} >
          {currentNetwork === 'characters' ? 'Played By' : 'Characters'}
          {sections.actors ? '>' : ' v'}
        </h4>
        {sections.actors && (
          <div className='character-actor-sidebar-list'>
            {currentNetwork === 'characters' && entityDetails.actors && entityDetails.actors.length > 0 ? (
              entityDetails.actors.map((actor) => (
                <span className="clickSpan" key={actor.id} onClick={() => handleEntityClick(actor.id, actor.component)}>{actor.name}</span>
              ))
            ) : currentNetwork === 'guests' && entityDetails.characters && entityDetails.characters.length > 0 ? (
              entityDetails.characters.map((character) => (
                <span className="clickSpan" key={character.id} onClick={() => handleEntityClick(character.id, character.component)}>{character.name} </span>
              ))
            ) : (
              <span>Unknown</span>
            )}
          </div>
        )}
      </div>
      <hr />
      <div>
        <h4 onClick={() => toggleSection('episodes')}>
          Episodes
          {sections.episodes ? ' >' : ' v'}
        </h4>
        {sections.episodes && (
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
                <tr key={index} onClick={() => handleEpisodeClick(episode.episode_number)}>
                  <td>{episode.title}</td>
                  <td>{episode.episode_number}</td>
                  <td>{episode.release_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
