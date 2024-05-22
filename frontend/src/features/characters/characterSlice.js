import { createSlice , createAsyncThunk} from '@reduxjs/toolkit';

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
};

// Define a thunk for fetching characters
export const fetchCharacters = createAsyncThunk(
  'characters/fetchCharacters',
  async (component, { getState, rejectWithValue }) => {
    const state = getState();
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
          const response = await fetch(`http://localhost:8000/api/components-summary/${entityType}/`);
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
        }
        // updateCharacterPosition: (state, action) => {
        //   const { nodeId, position } = action.payload;
        //   // console.log(`Updating position of node ${nodeId} to position ${position}`);
        //   state.positions[nodeId] = position;
        // },
        // setCharactersData: (state, action) => {
        //     state.nodes = action.payload.nodes;
        //     state.edges = action.payload.edges;
        //     state.isFetched = true;
        // },
        // updateCharacterPosition: (state, action) => {
        //     const { nodeId, position } = action.payload;
        //     state.positions[nodeId] = position;
        // }
    },
    extraReducers: (builder) => {
        builder
          .addCase(fetchCharacters.pending, (state) => {
            state.loading = true;
          })
          .addCase(fetchCharacters.fulfilled, (state, action) => {
            state.nodes = action.payload.nodes;
            state.edges = action.payload.edges;
            const selectedComponent = state.selectedComponent;

            state.loading = false;

            // Initialize positions if they don't exist
            action.payload.nodes.forEach(node => {
              if (!state.positions[selectedComponent]) {
                  state.positions[selectedComponent] = {};
              }
              if (!state.positions[selectedComponent][node.id]) {
                  console.log(`Position of node ${node.id} was not defined, so we are defining it to be x: ${node.position[0]}, y: ${node.position[1]}`);
                  state.positions[selectedComponent][node.id] = { x: node.position[0], y: node.position[1] };
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

export const { setSelectedComponent , updatePositions} = characterSlice.actions;

export default characterSlice.reducer;
