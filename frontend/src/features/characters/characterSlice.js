import { createSlice , createAsyncThunk} from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

const initialState = {
    nodes: [],
    edges: [],
    positions: {},
    cache: {},
    isFetched: false,
    loading: false,
    error: null,
    componentsSummary: [],
    isComponentChanged: false,
};

// Define a thunk for fetching characters
export const fetchCharacters = createAsyncThunk(
  'characters/fetchCharacters',
  async (_, { getState, rejectWithValue }) => {
    console.log(`Fetching characters!`);
    const state = getState();
    const component = state.ui.currentComponent; // Access currentComponent from uiSlice
    console.log(`The component is ${component}`);
    if (component === undefined) {
      return rejectWithValue('Component is undefined');
    } else if (state.characters.cache[component]) {
      return state.characters.cache[component];
    }

    try {
      const response = await fetch(`http://localhost:8000/api/network/characters/?component=${component}`);
      if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchComponentsSummary = createAsyncThunk(
  'characters/fetchComponentsSummary',
  async (entityType, { rejectWithValue }) => {
      try {
          const response = await fetch(`http://localhost:8000/api/components-summary/characters/`);
          if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
          const data = await response.json();
          return data;
      } catch (error) {
          return rejectWithValue(error.message);
      }
  }
);

export const fetchCharacterDetails = createAsyncThunk(
  'characters/fetchCharacterDetails',
  async (characterId, { rejectWithValue }) => {
      try {
          const response = await fetch(`http://localhost:8000/api/characters/${characterId}/`);
          if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
          const data = await response.json();
          return data;
      } catch (error) {
          return rejectWithValue(error.message);
      }
  }
);


export const characterSlice = createSlice({
    name: 'characters',
    initialState,
    reducers: {
        setSelectedComponent: (state, action) => {
          state.selectedComponent = action.payload;
        },
        updatePositions: (state, action) => {
          const { component, positions } = action.payload;
          state.positions[component] = positions;
        },
        setIsComponentChanged: (state, action) => {
          const newVal = action.payload;
          state.isComponentChanged = newVal;
        }
    },
    extraReducers: (builder) => {
        builder
          .addCase(fetchCharacters.pending, (state) => {
            state.loading = true;
          })
          .addCase(fetchCharacters.fulfilled, (state, action) => {
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
                  state.positions[selectedComponent][node.id] = { x: node.position[0] * 1000, y: node.position[1] * 1000};
              }
            });

            // Cache the fetched data
            state.cache[selectedComponent] = action.payload;
          })
          .addCase(fetchCharacters.rejected, (state, action) => {
            state.error = action.payload;
            state.loading = false;
          })
          .addCase(fetchComponentsSummary.pending, (state) => {
            state.loading = true;
          })
          .addCase(fetchComponentsSummary.fulfilled, (state, action) => {
              state.componentsSummary = action.payload;
              state.loading = false;
          })
          .addCase(fetchComponentsSummary.rejected, (state, action) => {
              state.error = action.payload;
              state.loading = false;
          })
          .addCase(fetchCharacterDetails.pending, (state) => {
            state.loading = true;
          })
          .addCase(fetchCharacterDetails.fulfilled, (state, action) => {
              state.loading = false;
          })
          .addCase(fetchCharacterDetails.rejected, (state, action) => {
              state.error = action.payload;
              state.loading = false;
          });
    },
});

export const { setSelectedComponent , updatePositions , setIsComponentChanged } = characterSlice.actions;

const selectSelectedComponentCache = (state) => state.characters.cache[state.characters.selectedComponent] || { nodes: [] };

export const selectCharacterNames = createSelector(
  [selectSelectedComponentCache],
  (cache) => cache.nodes.map((node) => ({ id: node.id, name: node.name }))
);

export default characterSlice.reducer;
