import { createSlice , createAsyncThunk} from '@reduxjs/toolkit';

const initialState = {
    selectedEpisodes: [],
    episodes: {},
};

// Define a thunk for fetching characters
export const fetchEpisodes = createAsyncThunk(
  'characters/fetchEpisodes',
  async ( _ , { rejectWithValue }) => {
      try {
          const response = await fetch(`http://localhost:8000/api/episodes/`);
          if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
          const data = await response.json();
          return data;
      } catch (error) {
          return rejectWithValue(error.message);
      }
  }
);


export const episodeSlice = createSlice({
    name: 'episodes',
    initialState,
    reducers: {
        setEpisodes: (state, action) => {
            state.episodes = action.payload;
          },   
    },
    extraReducers: (builder) => {
        builder
          .addCase(fetchEpisodes.pending, (state) => {
            state.loading = true;
          })
          .addCase(fetchEpisodes.fulfilled, (state, action) => {
              state.episodes = action.payload;
              state.loading = false;
          })
          .addCase(fetchEpisodes.rejected, (state, action) => {
              state.error = action.payload;
              state.loading = false;
          });
    },
});

export const { setEpisodes } = episodeSlice.actions;


export default episodeSlice.reducer;
