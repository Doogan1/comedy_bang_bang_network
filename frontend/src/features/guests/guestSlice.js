// guestSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

const initialState = {
    nodes: [],
    edges: [],
    positions: {},
    cache: {},
    isFetched: false,
    loading: false,
    error: null,
    selectedComponent: 0,
    componentsSummary: [],
    isComponentChanged: false,
    highlightNodes: [],
    highlightEdges: [],
    selectedNodeId: null,
    entityDetails: {},
    sidebarWidth: 300, 
};

// guestSlice.js

// Thunk to fetch guest data
export const fetchGuests = createAsyncThunk(
    'guests/fetchGuests',
    async (_, { getState, rejectWithValue }) => {
      const state = getState();
      const component = state.ui.currentComponent;
      if (component === undefined) {
        return rejectWithValue('Component is undefined');
      } else if (state.guests.cache[component]) {
        return state.guests.cache[component];
      }
      try {
        const response = await fetch(`http://localhost:8000/api/network/guests/?component=${component}`);
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        const data = await response.json();
        return data;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  // Thunk to fetch guest components summary
  export const fetchGuestComponentsSummary = createAsyncThunk(
    'guests/fetchGuestComponentsSummary',
    async (entityType, { rejectWithValue }) => {
      try {
        const response = await fetch(`http://localhost:8000/api/components-summary/guests/`);
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        const data = await response.json();
        return data;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  // Thunk to fetch guest details
export const fetchGuestDetails = createAsyncThunk(
    'guests/fetchGuestDetails',
    async (guestId, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:8000/api/guests/${guestId}/`);
            if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


export const guestSlice = createSlice({
    name: 'guests',
    initialState,
    reducers: {
        setSelectedGuestComponent: (state, action) => {
            state.selectedComponent = action.payload;
        },
        updateGuestPositions: (state, action) => {
            const { component, positions } = action.payload;
            state.positions[component] = positions;
        },
        setIsGuestComponentChanged: (state, action) => {
            state.isComponentChanged = action.payload;
        },
        setGuestHighlightNodes: (state, action) => {
            state.highlightNodes = action.payload;
        },
        setGuestHighlightEdges: (state, action) => {
            state.highlightEdges = action.payload;
        },
        selectGuestNode: (state, action) => {
            state.selectedNodeId = action.payload;
        },
        resetGuestHighlights: (state) => {
            state.highlightNodes = [];
            state.highlightEdges = [];
        },
        setGuestEntityDetails: (state, action) => {
            state.entityDetails = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGuests.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchGuests.fulfilled, (state, action) => {
                state.nodes = action.payload.nodes;
                state.edges = action.payload.edges;
                
                const selectedComponent = action.meta.arg;

                state.loading = false;

                // Initialize positions if they don't exist
                action.payload.nodes.forEach(node => {
                    if (!state.positions[selectedComponent]) {
                        state.positions[selectedComponent] = {};
                    }
                    if (!state.positions[selectedComponent][node.id]) {
                        state.positions[selectedComponent][node.id] = { x: node.position[0] * 1000, y: node.position[1] * 1000 };
                    }
                });

                // Cache the fetched data
                state.cache[selectedComponent] = action.payload;
            })
            .addCase(fetchGuests.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            })
            .addCase(fetchGuestComponentsSummary.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchGuestComponentsSummary.fulfilled, (state, action) => {
                state.componentsSummary = action.payload;
                state.loading = false;
            })
            .addCase(fetchGuestComponentsSummary.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            })
            .addCase(fetchGuestDetails.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchGuestDetails.fulfilled, (state, action) => {
                state.entityDetails = action.payload;
                state.loading = false;
            })
            .addCase(fetchGuestDetails.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            });
    },
});

export const { 
    setSelectedGuestComponent, 
    updateGuestPositions, 
    setIsGuestComponentChanged, 
    setGuestHighlightNodes, 
    setGuestHighlightEdges,
    selectGuestNode,
    resetGuestHighlights,
    setGuestEntityDetails,
} = guestSlice.actions;

const selectSelectedComponentCache = (state) => state.guests.cache[state.guests.selectedComponent] || { nodes: [] };

export const selectGuestNames = createSelector(
  [selectSelectedComponentCache],
  (cache) => cache.nodes.map((node) => ({ id: node.id, name: node.name }))
);

export default guestSlice.reducer;
