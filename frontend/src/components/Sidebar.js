import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCharacterDetails } from '../features/characters/characterSlice';
import { fetchGuestDetails } from '../features/guests/guestSlice';
import {
  setEntityDetails, setSidebarWidth, selectNode,
  switchComponent, setHighlights, saveHighlights, retrieveHighlightsSave,
  setTriggerZoomToSelection
} from '../features/ui/uiSlice';
import { setTriggerZoomToFit, switchNetwork, selectEpisode, addNodeToSet , resetNodeSelection} from '../features/ui/uiSlice';
import CentralityChart from './CentralityChart';
import { BiBarChartSquare } from "react-icons/bi";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { currentNetwork, selectedNodeId, entityDetails, sidebarWidth, selectedEpisode, currentComponent , highlights , highlightsSave} = useSelector(state => state.ui);
  const resizerRef = useRef(null);
  const sidebarRef = useRef(null);
  const [isOpen, setIsOpen] = useState(true);
  const [showChart, setShowChart] = useState(false);
  const [centralityData, setCentralityData] = useState([]);
  const [selectedCentrality, setSelectedCentrality] = useState('');
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

  const handleCentralityClick = (metric) => {
    setSelectedCentrality(metric);
    const data = getDataForCentrality(metric);
    setCentralityData(data);
    setShowChart(true);
  };

  const getDataForCentrality = (metric) => {
    const nodes = currentNetwork === 'characters' ? characterNodes : guestNodes;
    const degreeMultiplier = metric === 'degree' ? nodes.length - 1 : 1;
    return nodes.map(node => ({ id: node.id, value: node[metric] * degreeMultiplier }));
  };

  useEffect(() => {
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

    const attachResizerEvents = () => {
      const resizer = resizerRef.current;
      if (resizer) {
        resizer.addEventListener('mousedown', handleMouseDown);
      }
    };

    const removeResizerEvents = () => {
      const resizer = resizerRef.current;
      if (resizer) {
        resizer.removeEventListener('mousedown', handleMouseDown);
      }
    };

    attachResizerEvents();
    return () => {
      removeResizerEvents();
    };
  }, [sidebarWidth, dispatch, isOpen]);

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

  const handleEntityClick = (id, component, isSwitch = true) => {
    const targetNetwork = currentNetwork === 'characters' ? 'guests' : 'characters';
    if (isSwitch) {
      dispatch(switchNetwork(targetNetwork));
      dispatch(switchComponent(component));
    }
    dispatch(resetNodeSelection());
    console.log(`Dispatching select node id to ${id}`);
    dispatch(addNodeToSet(id));
    dispatch(selectNode(id));
  };

  const handleEpisodeClick = (episodeId) => {
    dispatch(saveHighlights());
    dispatch(selectEpisode(episodeId));
    setIsEpisodeClicked(true);
  };

  const handleEpisodeDoubleClick = (episodeId) => {
    dispatch(saveHighlights());
    dispatch(selectEpisode(episodeId));
    dispatch(selectNode(null));
    setIsEpisodeClicked(true);
    setTriggerZoomToSelection(true);
  };

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
    };
    console.log(`Setting highlights from sidebar component handleMouseEnter function with ${JSON.stringify(payload)}`);
    dispatch(setHighlights(payload));
  };

  const handleEpisodeMouseLeave = () => {
    dispatch(retrieveHighlightsSave());
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

  const getSharedEpisodes = (characterId) => {

    if (!Array.isArray(episodeDetails)) {
      return '';
    }
    
    return episodeDetails.filter(episode => {
      if (currentNetwork === 'characters') {
        return episode.characters.map(character => character.id).includes(entityDetails.character_id) && episode.characters.map(character => character.id).includes(characterId);
      } else {
        return episode.guests.map(guest => guest.id).includes(entityDetails.character_id) && episode.guests.map(guest => guest.id).includes(characterId);
      }
    }).map(episode => episode.title).join(', ');
  };

  if (!isOpen) return null;

  const getCentralityValue = (nodes, metric) => {
    const node = nodes.find(node => node.id === selectedNodeId);
    const order = nodes.length;
    const centralityValue = node && !isNaN(node[metric]) ? (metric === "degree" ? Number(node[metric] * (order - 1)).toFixed(0) : Number(node[metric]).toFixed(4)) : 'N/A';
    return centralityValue;
  };

  console.log(highlights);
  console.log(highlightsSave);
  console.log(selectedNodeId);

  return (
    <div className="sidebar" id="entityDetails" ref={sidebarRef} style={{ display: selectedNodeId || selectedEpisode ? 'block' : 'none', width: `${sidebarWidth}px` }}>
      <div className="resizer" ref={resizerRef}></div>
      <button onClick={closeSidebar} className="close-sidebar-btn">X</button>
      <h3>{currentNetwork === 'characters' ? 'Character Details' : 'Guest Details'}</h3>
      <div>
        <h2>{entityDetails?.character_name ?? 'No Character Selected'}</h2>
        <hr />
        <h4 onClick={() => toggleSection('details')}>
          Details
          {sections.details ? ' v' : ' >'}
        </h4>
        {sections.details && (
          <div>
            <h5>Component: {entityDetails?.component ?? 'N/A'}</h5>
            <h5>
              Degree: {getCentralityValue(currentNetwork === 'characters' ? characterNodes : guestNodes, 'degree')}
              <span className="chart-icon">
                <BiBarChartSquare onClick={() => handleCentralityClick('degree')} />
              </span>
            </h5>
            <h5>
              Eigenvector: {getCentralityValue(currentNetwork === 'characters' ? characterNodes : guestNodes, 'eigenvector')}
              <span className="chart-icon">
                <BiBarChartSquare onClick={() => handleCentralityClick('eigenvector')} />
              </span>
            </h5>
            <h5>
              Betweenness: {getCentralityValue(currentNetwork === 'characters' ? characterNodes : guestNodes, 'betweenness')}
              <span className="chart-icon">
                <BiBarChartSquare onClick={() => handleCentralityClick('betweenness')} />
              </span>
            </h5>
            <h5>
              Closeness: {getCentralityValue(currentNetwork === 'characters' ? characterNodes : guestNodes, 'closeness')}
              <span className="chart-icon">
                <BiBarChartSquare onClick={() => handleCentralityClick('closeness')} />
              </span>
            </h5>
          </div>
        )}
      </div>
      <hr />
      <div>
        <h4 onClick={() => toggleSection('actors')}>
          {currentNetwork === 'characters' ? 'Played By' : 'Characters'}
          {sections.actors ? ' v' : ' >'}
        </h4>
        {sections.actors && (
          <div className='character-actor-sidebar-list'>
            {currentNetwork === 'characters' && entityDetails?.actors?.length > 0 
              ? entityDetails.actors.map(actor => (
                  <span className="clickSpan" key={actor.id} onClick={() => handleEntityClick(actor.id, actor.component)}>
                    {actor.name}
                  </span>
                ))
              : currentNetwork === 'guests' && entityDetails?.characters?.length > 0 
                ? entityDetails.characters.map(character => (
                    <span className="clickSpan" key={character.id} onClick={() => handleEntityClick(character.id, character.component)}>
                      {character.name}
                    </span>
                  ))
                : <span>Unknown</span>}
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
              {entityDetails?.episodes?.length > 0
                ? entityDetails.episodes.map((episode, index) => (
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
                  ))
                : <tr>
                    <td colSpan="3">No episodes available</td>
                  </tr>}
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
              {currentNetwork === 'characters' && characterEdges?.length > 0
                ? characterEdges.filter(edge => edge.source === entityDetails.character_id || edge.target === entityDetails.character_id)
                    .map(edge => {
                      const characterId = edge.source === entityDetails.character_id ? edge.target : edge.source;
                      const character = characterNodes.find(node => node.id === characterId);
                      return (
                        <tr key={characterId} onClick={() => handleEntityClick(characterId, entityDetails.component, false)}>
                          <td>{character?.name ?? 'N/A'}</td>
                          <td>{getSharedEpisodes(characterId)}</td>
                        </tr>
                      );
                    })
                : currentNetwork === 'guests' && guestEdges?.length > 0
                  ? guestEdges.filter(edge => edge.source === entityDetails.character_id || edge.target === entityDetails.character_id)
                      .map(edge => {
                        const guestId = edge.source === entityDetails.character_id ? edge.target : edge.source;
                        const guest = guestNodes.find(node => node.id === guestId);
                        return (
                          <tr key={guestId} onClick={() => handleEntityClick(guestId, entityDetails.component, false)}>
                            <td>{guest?.name ?? 'N/A'}</td>
                            <td>{getSharedEpisodes(guestId)}</td>
                          </tr>
                        );
                      })
                  : <tr>
                      <td colSpan="2">Unknown</td>
                    </tr>}
            </tbody>
          </table>
        )}
      </div>
      <CentralityChart
        show={showChart}
        handleClose={() => setShowChart(false)}
        data={centralityData}
        selectedCentrality={selectedCentrality}
      />
    </div>
  );
};

export default Sidebar;
