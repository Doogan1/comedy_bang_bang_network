// features/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentEntityType: 'characters',
    currentZoomLevel: 1,
    selectedNodeId: null,
    entityDetails: {
        name: '',
        episodes: []
    },
    sidebarWidth: 300
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        switchEntityType: (state, action) => {
            state.currentEntityType = action.payload;
            state.selectedNodeId = null;  // Reset selected node ID
            state.entityDetails = initialState.entityDetails;  // Reset entity details to initial state
        },
        setZoomLevel: (state, action) => {
            state.currentZoomLevel = action.payload;
        },
        selectNode: (state, action) => {
            state.selectedNodeId = action.payload;
        },
        setEntityDetails: (state, action) => {
            state.entityDetails = action.payload;
        },
        setSidebarWidth: (state, action) => {
            state.sidebarWidth = action.payload;
        }
    }
});

export const { switchEntityType, setZoomLevel, selectNode , setEntityDetails , setSidebarWidth } = uiSlice.actions;

export default uiSlice.reducer;
