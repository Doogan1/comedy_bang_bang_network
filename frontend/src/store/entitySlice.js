import { createSlice } from '@reduxjs/toolkit';

export const entitySlice = createSlice({
    name: 'entity',
    initialState: {
        currentEntityType: 'characters'
    },
    reducers: {
        setEntityType: (state, action) => {
            state.currentEntityType = action.payload;
        },
    },
});

export const { setEntityType } = entitySlice.actions;

export default entitySlice.reducer;
