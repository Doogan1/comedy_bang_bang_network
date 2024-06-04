import { configureStore } from '@reduxjs/toolkit';
import characterReducer from '../features/characters/characterSlice';
import guestReducer from '../features/guests/guestSlice';
import uiReducer from '../features/ui/uiSlice';
import episodeReducer from '../features/episodes/episodeSlice';

export const store = configureStore({
    reducer: {
        characters: characterReducer,
        guests: guestReducer,
        ui: uiReducer,
        episodes: episodeReducer
    }
});
