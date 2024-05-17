import { createSlice , createAsyncThunk} from '@reduxjs/toolkit';

const initialState = {
    nodes: [],
    links: [],
    positions: {},
    isFetched: false,
    loading: false,
    error: null,
    selectedComponent: 0,
    componentsSummary: [],
};

// Define a thunk for fetching characters
export const fetchCharacters = createAsyncThunk(
  'characters/fetchCharacters',
  async (component, { rejectWithValue }) => {
      if (component === undefined) {
        return rejectWithValue('Component is undefined');
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
            state.loading = false;
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

export const { setSelectedComponent } = characterSlice.actions;

export default characterSlice.reducer;
