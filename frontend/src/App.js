import React, { useEffect, useCallback , useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCharacters, setSelectedComponent as setSelectedCharacterComponent, fetchComponentsSummary as fetchCharacterComponentsSummary } from './features/characters/characterSlice';
import { fetchGuests, setSelectedGuestComponent as setSelectedGuestComponent, fetchGuestComponentsSummary as fetchGuestComponentsSummary } from './features/guests/guestSlice';
import { selectNode, switchNetwork , switchComponent , setHighlights , selectEpisode , saveHighlights , resetNodeSelection} from './features/ui/uiSlice';
import { fetchEpisodes , setEpisodes} from './features/episodes/episodeSlice';
import Visualizer from './components/Visualizer';
import Sidebar from './components/Sidebar';
import ControlsSidebar from './components/ControlsSidebar';
import NetworkSwitcher from './components/NetworkSwitcher';
import SearchBar from './components/SearchBar';
import { BiInfoCircle } from "react-icons/bi";
import { Modal , Button} from 'react-bootstrap';
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

    const [isCBBInfoOpen, setIsCBBInfoOpen] = useState(false);

    const toggleCBBInfo = () => {
        setIsCBBInfoOpen(!isCBBInfoOpen);
    };
    
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
            dispatch(resetNodeSelection());
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
        dispatch(selectNode(null));
        dispatch(switchComponent(component));
    };

    const componentsSummary = currentNetwork === 'characters' ? characterComponentsSummary : guestComponentsSummary;


    return (
        <div className="full-width-container">
            <ControlsSidebar
            selectedComponent={currentComponent}
            setSelectedComponent={handleComponentChange}
            componentsSummary={componentsSummary}
            />
            <div className="title">
                <h1>Comedy Bang! Bang!<BiInfoCircle onClick={toggleCBBInfo} style={{cursor: 'pointer' }}/></h1>
                <Modal show={isCBBInfoOpen} onHide={toggleCBBInfo}>
                    <Modal.Header closeButton>
                        <Modal.Title>Comedy Bang! Bang! Info</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h6>The Podcast</h6>
                        <p>
                            Comedy Bing Bong is a popular weekly podcast hosted by Scott Aukerman. 
                            It began in 2009 and is known for its unique blend of interviews, character-based improvisation, and absurdist humor. 
                            Each episode typically features Aukerman engaging with comedians, actors, and musicians, alongside recurring fictional characters played by guest comedians. 
                            The podcast has garnered a dedicated fan base and has been praised for its innovative approach to comedy and its ability to blend spontaneous humor with structured segments.
                        </p>
                        <p>
                            You can listen to recent episodes and some archived episodes of Comedy Bang! Bang! wherever you get your podcasts.  
                            You can also subscribe to <a target="_blank" href="https://www.comedybangbangworld.com/">Comedy Bang! Bang! World</a> to get ad-free episodes and the complete archive of episodes.  
                            The information used for this website was scraped from the <a target="_blank" href="https://comedybangbang.fandom.com/wiki/Main_Page">Comedy Bang Bang Fandom</a> - thank you to all those involved in maintaining that wiki.
                        </p>
                        <h6>The Character Network</h6>
                        <p>
                            The character network in the Comedy Bang! Bang! project represents the relationships and interactions between the various fictional characters that have appeared on the podcast over the years. 
                            These characters, often created and performed by guest comedians, form a rich tapestry of interconnected stories and running jokes. 
                            By visualizing these connections, listeners can gain a deeper understanding of how different characters relate to one another and trace the evolution of recurring bits and storylines throughout the show's history.
                        </p>
                        <h6>The Guest Network</h6>
                        <p>
                            The guest network, on the other hand, focuses on the real-life guests who have appeared on Comedy Bang! Bang!. 
                            This network illustrates the connections between guests based on their appearances in the same episodes. 
                            By examining the guest network, fans can explore which comedians, actors, and musicians have frequently collaborated on the show, revealing patterns in guest appearances and highlighting the diverse range of talent that has contributed to the podcast's success.
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={toggleCBBInfo}>Close</Button>
                    </Modal.Footer>
                </Modal>

                <h2> Network Explorer <span className='by-line'>by <a target="_blank" href='https://sites.google.com/view/drake-olejniczak/home'>Drake Olejniczak</a></span></h2>
            </div>
            <div className="visualizer-container-big">
                <div className="top-bar">
                    <NetworkSwitcher />
                    <div>
                    </div>
                    <SearchBar />
                </div>
                <div className="visualizer">
                    <Visualizer />
                </div>
            </div>
            <Sidebar />
        </div>
    );
};

export default App;
