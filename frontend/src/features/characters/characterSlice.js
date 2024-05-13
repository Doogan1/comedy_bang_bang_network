import { createSlice , createAsyncThunk} from '@reduxjs/toolkit';

const initialState = {
    nodes: [],
    links: [],
    positions: {},
    isFetched: false
};

// Define a thunk for fetching characters
export const fetchCharacters = createAsyncThunk(
    'characters/fetchCharacters',
    async (_, { rejectWithValue }) => {
      try {
        const response = await fetch('http://localhost:8000/api/characters/');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );

export const characterSlice = createSlice({
    name: 'characters',
    initialState: {
        entities: [],
        loading: false,
        error: null,
    },
    reducers: {
        setCharactersData: (state, action) => {
            state.nodes = action.payload.nodes;
            state.links = action.payload.links;
            state.isFetched = true;
        },
        updateCharacterPosition: (state, action) => {
            const { nodeId, position } = action.payload;
            state.positions[nodeId] = position;
        }
    },
    extraReducers: (builder) => {
        builder
          .addCase(fetchCharacters.pending, (state) => {
            state.loading = true;
          })
          .addCase(fetchCharacters.fulfilled, (state, action) => {
            state.entities = action.payload;
            state.loading = false;
          })
          .addCase(fetchCharacters.rejected, (state, action) => {
            state.error = action.payload;
            state.loading = false;
          });
      }
});

export const { setCharactersData, updateCharacterPosition } = characterSlice.actions;

export default characterSlice.reducer;
