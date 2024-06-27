import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentNetwork: 'characters',
    currentComponent: '0',
    currentZoomLevel: {
        k: 1,
        x: 0,
        y: 0
    },
    window: {
        width: window.innerWidth,
        height: window.innerHeight,
    },
    zoomCache: {},
    selectedNodeId: null,
    selectedEpisode: null,
    entityDetails: {
        name: '',
        episodes: []
    },
    sidebarWidth: 300,
    forceStrength: 10000,
    linkDistance: 1000,
    currentCentrality: 'eigenvector',
    radiusRange: {
        minRadius: 35,
        maxRadius: 175
    },
    triggerZoomToFit: false, 
    triggerZoomToSelection: false,
    highlights: {
        characters: {},
        guests: {}
    },
    highlightsSave: {
        characters: {},
        guests: {}
    }
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        switchNetwork: (state, action) => {
            state.currentNetwork = action.payload;
            state.entityDetails = initialState.entityDetails; 
        },
        switchComponent: (state, action) => {
            state.currentComponent = action.payload;
        },
        setCurrentZoomLevel: (state, action) => {
            state.currentZoomLevel = action.payload;
        },
        updateZoomCache(state, action) {
            const { network, component, zoom } = action.payload;
            state.zoomCache[`${network}-${component}`] = zoom;
        },
        selectNode: (state, action) => {
            console.log(`Setting node id to ${action.payload}`);
            state.selectedNodeId = action.payload;
        },
        setHighlights: (state, action) => {
            const { nodes, edges } = action.payload;
            const currentNetwork = state.currentNetwork;
            const currentComponent = state.currentComponent;

            if (!state.highlights[currentNetwork]) {
                state.highlights[currentNetwork] = {};
            }

            state.highlights[currentNetwork][currentComponent] = { nodes, edges };
        },
        saveHighlights: (state) => {
            state.highlightsSave = state.highlights[state.currentNetwork][state.currentComponent];
        },
        retrieveHighlightsSave: (state) => {

            state.highlights[state.currentNetwork][state.currentComponent] = state.highlightsSave;
        },
        selectEpisode: (state, action) => {
            state.selectedEpisode = action.payload;
        },
        setEntityDetails: (state, action) => {
            state.entityDetails = action.payload;
        },
        setSidebarWidth: (state, action) => {
            state.sidebarWidth = action.payload;
        },
        setForceStrength: (state, action) => {
            state.forceStrength = action.payload;
        },
        setLinkDistance: (state, action) => {
            state.linkDistance = action.payload;
        },
        setCentrality: (state, action) => {
            state.currentCentrality = action.payload;
        },
        setRadiusRange: (state, action) => {
            state.radiusRange.minRadius = action.payload[0];
            state.radiusRange.maxRadius = action.payload[1];
        },
        setTriggerZoomToFit: (state, action) => {
            state.triggerZoomToFit = action.payload;
        },
        setTriggerZoomToSelection: (state, action) => {
            state.triggerZoomToSelection = action.payload;
        },
        setWindow: (state, action) => {
            state.window.width = action.payload.width;
            state.window.height = action.payload.height;
        }
    }
});

export const { switchNetwork, switchComponent, setCurrentZoomLevel, updateZoomCache, selectNode, selectEpisode, setHighlights, setEntityDetails, setSidebarWidth, setForceStrength, setLinkDistance, setCentrality, setRadiusRange, setTriggerZoomToFit, setTriggerZoomToSelection, setWindow, saveHighlights, retrieveHighlightsSave } = uiSlice.actions;

export default uiSlice.reducer;
