import React from 'react';
import Visualizer from './components/Visualizer';
import Sidebar from './components/Sidebar';
import Controls from './components/Controls';

const App = () => {
    return (
        <div className="app-container">
            <Visualizer />
            <Sidebar />
            <Controls />
        </div>
    );
};

export default App;
