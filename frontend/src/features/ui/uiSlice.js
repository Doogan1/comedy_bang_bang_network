// features/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentNetwork: 'characters',
    currentZoomLevel: {
        k: 1,
        x: 0,
        y: 0
    },
    zoomCache: {},
    selectedNodeId: null,
    entityDetails: {
        name: '',
        episodes: []
    },
    sidebarWidth: 300,
    forceStrength: 5000,
    linkDistance: 500,
    currentCentrality: 'none',
    radiusRange: {
        minRadius: 1,
        maxRadius: 30
    },
    triggerZoomToFit: false // Flag to trigger zoom-to-fit
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        switchNetwork: (state, action) => {
            state.currentNetwork = action.payload;
            state.selectedNodeId = null;  // Reset selected node ID
            state.entityDetails = initialState.entityDetails;  // Reset entity details to initial state
        },
        setCurrentZoomLevel: (state, action) => {
            state.currentZoomLevel = action.payload;
        },
        updateZoomCache: (state, action) => {
            const { component, zoom } = action.payload;
            state.zoomCache[component] = zoom;
        },
        selectNode: (state, action) => {
            state.selectedNodeId = action.payload;
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
    }
});

export const { switchNetwork, setCurrentZoomLevel, updateZoomCache, selectNode , setEntityDetails , setSidebarWidth , setForceStrength, setLinkDistance, setCentrality, setRadiusRange, setTriggerZoomToFit} = uiSlice.actions;

export default uiSlice.reducer;
