// features/charactersSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    nodes: [],
    links: [],
    positions: {},
    isFetched: false
};

export const charactersSlice = createSlice({
    name: 'characters',
    initialState,
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
    }
});

export const { setCharactersData, updateCharacterPosition } = charactersSlice.actions;

export default charactersSlice.reducer;
