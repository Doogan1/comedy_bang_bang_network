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
        const response = await fetch('http://localhost:8000/api/network/characters/?component=0');
        console.log("Response Status:", response.status);
        console.log("Response Status Text:", response.statusText);
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        const data = await response.json();
        console.log("Data received:", data);
        return data;
      } catch (error) {
        console.error("Error fetching characters:", error);
        return rejectWithValue(error.message);
      }
    }
);


export const characterSlice = createSlice({
    name: 'characters',
    initialState: {
        nodes: [],
        edges: [],
        loading: false,
        error: null,
    },
    reducers: {
        setCharactersData: (state, action) => {
            state.nodes = action.payload.nodes;
            state.edges = action.payload.edges;
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
            state.nodes = action.payload.nodes;
            state.edges = action.payload.edges;
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
