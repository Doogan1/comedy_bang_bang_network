import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCharacterDetails } from '../features/characters/characterSlice';
import { fetchGuestDetails } from '../features/guests/guestSlice';
import {
  setEntityDetails, setSidebarWidth, selectNode,
  switchComponent, setHighlights, saveHighlights, retrieveHighlightsSave,
  setTriggerZoomToSelection
} from '../features/ui/uiSlice';
import { setTriggerZoomToFit, switchNetwork, selectEpisode } from '../features/ui/uiSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { currentNetwork, selectedNodeId, entityDetails, sidebarWidth, selectedEpisode } = useSelector(state => state.ui);
  const resizerRef = useRef(null);
  const sidebarRef = useRef(null);
  const [isOpen, setIsOpen] = useState(true);
  const [sections, setSections] = useState({
    details: true,
    actors: true,
    episodes: true,
    neighbors: true,
  });

  const episodeDetails = useSelector(state => state.episodes.episodes);
  const characterEdges = useSelector(state => state.characters.edges);
  const characterNodes = useSelector(state => state.characters.nodes);
  const guestEdges = useSelector(state => state.guests.edges);
  const guestNodes = useSelector(state => state.guests.nodes);
  const [isEpisodeClicked, setIsEpisodeClicked] = useState(false);


  useEffect(() => {
    console.log("UseEffect sidebar 1");
    console.log(characterEdges.length);
    dispatch(saveHighlights());
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
    console.log("UseEffect sidebar 2");
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
    console.log("UseEffect sidebar 3");
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

  const handleEntityClick = (id, component, isSwitch = true) => {
    const targetNetwork = currentNetwork === 'characters' ? 'guests' : 'characters';
    if (isSwitch) {
      dispatch(switchNetwork(targetNetwork));
      dispatch(switchComponent(component));
    }
    dispatch(selectNode(id));
  };

  const handleEpisodeClick = (episodeId) => {
    dispatch(saveHighlights());
    dispatch(selectEpisode(episodeId));
    dispatch(selectNode(null));
    setIsEpisodeClicked(true);
  };

  const handleEpisodeDoubleClick = (episodeId) => {
    dispatch(saveHighlights());
    dispatch(selectEpisode(episodeId));
    dispatch(selectNode(null));
    setIsEpisodeClicked(true);
    setTriggerZoomToSelection(true);
  }

  const handleEpisodeMouseEnter = (episodeId) => {
    if (isEpisodeClicked) {
      saveHighlights();
    }
    const episodeToHighlight = episodeDetails.filter(d => d.episode_number === episodeId);
    
    const nodesToHighlight = [];
    const edgesToHighlight = [];

    if (currentNetwork === 'characters') {
        episodeToHighlight[0].characters.forEach(character => nodesToHighlight.push(character.id));
        characterEdges.forEach((d) => {
          if (nodesToHighlight.includes(d.source) && nodesToHighlight.includes(d.target)) {
            edgesToHighlight.push([d.source, d.target]);
          }
        });
    }

    if (currentNetwork === 'guests') {
        episodeToHighlight[0].guests.forEach(guest => nodesToHighlight.push(guest.id));
        guestEdges.forEach((d) => {
          if (nodesToHighlight.includes(d.source) && nodesToHighlight.includes(d.target)) {
            edgesToHighlight.push([d.source, d.target]);
          }
        });
    }

    const payload = {
      nodes: nodesToHighlight,
      edges: edgesToHighlight
    }

    dispatch(setHighlights(payload));
  }

  const handleEpisodeMouseLeave = () => {
    dispatch(retrieveHighlightsSave());
  }

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

  const getSharedEpisodes = (characterId) => {
    return episodeDetails.filter(episode => {
      if (currentNetwork === 'characters') {
        return episode.characters.map(character => character.id).includes(entityDetails.character_id) && episode.characters.map(character => character.id).includes(characterId);
      } else {
        return episode.guests.map(guest => guest.id).includes(entityDetails.character_id) && episode.guests.map(guest => guest.id).includes(characterId);
      }
    }).map(episode => episode.title).join(', ');
  };

  if (!isOpen) return null;

  return (
    <div className="sidebar" id="entityDetails" ref={sidebarRef} style={{ display: selectedNodeId || selectedEpisode ? 'block' : 'none', width: `${sidebarWidth}px` }}>
      <div className="resizer" ref={resizerRef}></div>
      <button onClick={closeSidebar} style={{ position: 'absolute', top: '5px', left: `15px` }}>X</button>
      <h3>{currentNetwork === 'characters' ? 'Character Details' : 'Guest Details'}</h3>
      <div><h2>{entityDetails.character_name}</h2>
      <h4 onClick={() => toggleSection('details')} >
          Details
          {sections.details ? ' v' : ' >'}
        </h4>
      {sections.details && (
        <div>
          <h5>Component: {entityDetails.component}</h5>
          <h5>Degree: {selectedNodeId && characterNodes.length > 0 ? (
            currentNetwork === 'characters' ? (characterNodes.find(node => node.id === selectedNodeId).degree * (characterNodes.length - 1)).toFixed(0) 
            : (guestNodes.length > 0 ? (guestNodes.find(node => node.id === selectedNodeId).degree * (guestNodes.length - 1)).toFixed(4) : ""))
            : ("")
            }
          </h5>
          <h5>Eigenvector: {selectedNodeId && characterNodes.length > 0 ? (
            currentNetwork === 'characters' ? characterNodes.find(node => node.id === selectedNodeId).eigenvector.toFixed(4)
            : (guestNodes.length > 0 ? guestNodes.find(node => node.id === selectedNodeId).eigenvector.toFixed(4) : ""))
          : ("")
          }
          </h5>
          <h5>Betweenness: {selectedNodeId && characterNodes.length > 0 ? (
            currentNetwork === 'characters' ? characterNodes.find(node => node.id === selectedNodeId).betweenness.toFixed(4)
            : (guestNodes.length > 0 ? guestNodes.find(node => node.id === selectedNodeId).betweenness.toFixed(4) : ""))
          : ("")}
          </h5>
          <h5>Closeness: {selectedNodeId && characterNodes.length > 0 ? (
            currentNetwork === 'characters' ? characterNodes.find(node => node.id === selectedNodeId).closeness.toFixed(4)
            : (guestNodes.length > 0 ? guestNodes.find(node => node.id === selectedNodeId).closeness.toFixed(4) : ""))
          : ("")
          }
          </h5>
        </div>
      )}

      </div>
      <hr />
      <div>
        <h4 onClick={() => toggleSection('actors')} >
          {currentNetwork === 'characters' ? 'Played By' : 'Characters'}
          {sections.actors ? ' v' : ' >'}
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
          {sections.episodes ? ' v' : ' >'}
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
                <tr
                key={index}
                onClick={() => handleEpisodeClick(episode.episode_number)}
                onMouseEnter={() => handleEpisodeMouseEnter(episode.episode_number)}
                onMouseLeave={() => handleEpisodeMouseLeave()}
                onDoubleClick={() => handleEpisodeDoubleClick(episode.episode_number)}
                className={selectedEpisode && selectedEpisode === episode.episode_number ? 'current-episode' : ''}
                >
                  <td>{episode.title}</td>
                  <td>{episode.episode_number}</td>
                  <td>{episode.release_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <hr />
      <div>
        <h4 onClick={() => toggleSection('neighbors')}>
          Neighbors
          {sections.neighbors ? ' v' : ' >'}
        </h4>
        {sections.neighbors && (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Shared Episodes</th>
              </tr>
            </thead>
            <tbody>
              {currentNetwork === 'characters' && characterEdges && characterEdges.length > 0 ? (
                characterEdges.filter((edge) => edge.source === entityDetails.character_id || edge.target === entityDetails.character_id)
                  .map((edge) => {
                    const characterId = edge.source === entityDetails.character_id ? edge.target : edge.source;
                    const character = characterNodes.find(node => node.id === characterId);
                    return (
                      <tr key={characterId} onClick={() => handleEntityClick(characterId, entityDetails.component, false)}>
                        <td>{character && character.name}</td>
                        <td>{getSharedEpisodes(characterId)}</td>
                      </tr>
                    );
                  })
              ) : currentNetwork === 'guests' && guestEdges && guestEdges.length > 0 ? (
                guestEdges.filter((edge) => edge.source === entityDetails.character_id || edge.target === entityDetails.character_id)
                  .map((edge) => {
                    const guestId = edge.source === entityDetails.character_id ? edge.target : edge.source;
                    const guest = guestNodes.find(node => node.id === guestId);
                    return (
                      <tr key={guestId} onClick={() => handleEntityClick(guestId, entityDetails.component, false)}>
                        <td>{guest && guest.name}</td>
                        <td>{getSharedEpisodes(guestId)}</td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan="2">Unknown</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
