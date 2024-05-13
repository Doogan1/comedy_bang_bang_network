import { configureStore } from '@reduxjs/toolkit';
import entityReducer from './entitySlice';

const store = configureStore({
    reducer: {
        entity: entityReducer
    },
});

export default store;
