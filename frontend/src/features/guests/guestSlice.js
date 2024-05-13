// features/charactersSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    nodes: [],
    links: [],
    positions: {},
    isFetched: false
};

export const guestSlice = createSlice({
    name: 'guests',
    initialState,
    reducers: {
        setGuestsData: (state, action) => {
            state.nodes = action.payload.nodes;
            state.links = action.payload.links;
            state.isFetched = true;
        },
        updateGuestPosition: (state, action) => {
            const { nodeId, position } = action.payload;
            state.positions[nodeId] = position;
        }
    }
});

export const { setGuestData, updateGuestPosition } = guestSlice.actions;

export default guestSlice.reducer;
