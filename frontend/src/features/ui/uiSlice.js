import { createSlice , createAsyncThunk} from '@reduxjs/toolkit';

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
    areMultipleNodesSelected: false,
    selectedNodeSet: [],
    selectedEpisode: null,
    entityDetails: {
        name: '',
        episodes: []
    },
    sidebarWidth: 300,
    forceStrength: 20000,
    linkDistance: 1000,
    currentCentrality: 'eigenvector',
    radiusRange: {
        minRadius: 70,
        maxRadius: 215
    },
    triggerZoomToFit: false, 
    triggerZoomToSelection: false,
    highlights: {
        characters: {},
        guests: {}
    },
    highlightedPath: [],
    highlightsSave: {
        characters: {},
        guests: {}
    }
};

// Define a thunk for fetching the shortest path
export const fetchShortestPath = createAsyncThunk(
    'ui/fetchShortestPath',
    async ({ network, startNodeId, endNodeId }, { rejectWithValue }) => {
      try {
        console.log(`Fetching shortest path with network: ${network}, ${startNodeId}, ${endNodeId}`);
        const response = await fetch(`https://dpolejni.pythonanywhere.com/api/shortest_path/${network}/${startNodeId}/${endNodeId}/`);
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        const data = await response.json();
        return data.path;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );

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
        setMultipleNodesSelected: (state, action) => {
            state.areMultipleNodesSelected = action.payload;
        },
        addNodeToSet: (state, action) => {
            const nodeId = action.payload;
            if (nodeId && !state.selectedNodeSet.includes(nodeId)) {
                console.log(`Adding selected node to set. action.payload: ${nodeId}`);
                console.log(`Current state.selectedNodeSet: ${[...state.selectedNodeSet]}`);
                state.selectedNodeSet = [...state.selectedNodeSet, nodeId];
                console.log(`State after adding the new node to selectedNodeSet: ${[...state.selectedNodeSet]}`);
            } else {
                console.log(`Node ${nodeId} is already in the selectedNodeSet or payload is invalid.`);
            }
        },
        removeNodeFromSet: (state, action) => {
            console.log(`Removing node from set. action.payload: ${action.payload}`);
            state.selectedNodeSet = state.selectedNodeSet.filter(id => id !== action.payload);
            console.log(`New state.selectedNodeSet: ${state.selectedNodeSet}`);
        },
        resetNodeSelection: (state) => {
            console.log(`Resetting nodeSelection`);
            state.selectedNodeId = null;
            state.areMultipleNodesSelected = false;
            state.selectedNodeSet = [];
        },
        setHighlights: (state, action) => {
            const { nodes, edges } = action.payload;
            console.log(`Incoming highlights nodes: ${nodes} and edges ${edges}`);
            const currentNetwork = state.currentNetwork;
            const currentComponent = state.currentComponent;

            if (!state.highlights[currentNetwork]) {
                state.highlights[currentNetwork] = {};
            }

            state.highlights[currentNetwork][currentComponent] = { nodes, edges };
        },
        clearHighlightedPath: (state) => {
            state.highlightedPath = [];
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
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchShortestPath.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchShortestPath.fulfilled, (state, action) => {
                state.highlightedPath = action.payload;
                state.loading = false;
            })
            .addCase(fetchShortestPath.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            })
    }
});

export const { switchNetwork, switchComponent, setCurrentZoomLevel, updateZoomCache, 
    selectNode, selectEpisode, setHighlights, setEntityDetails, setSidebarWidth, 
    setForceStrength, setLinkDistance, setCentrality, setRadiusRange, setTriggerZoomToFit, 
    setTriggerZoomToSelection, setWindow, saveHighlights, retrieveHighlightsSave , 
    setMultipleNodesSelected, addNodeToSet, removeNodeFromSet, resetNodeSelection ,
    clearHighlightedPath} = uiSlice.actions;

export default uiSlice.reducer;
