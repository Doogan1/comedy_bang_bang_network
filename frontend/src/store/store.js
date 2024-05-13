import { configureStore } from '@reduxjs/toolkit';
import charactersReducer from '../features/charactersSlice';
import guestsReducer from '../features/guestsSlice';
import uiReducer from '../features/uiSlice';

export const store = configureStore({
    reducer: {
        characters: charactersReducer,
        guests: guestsReducer,
        ui: uiReducer
    }
});
