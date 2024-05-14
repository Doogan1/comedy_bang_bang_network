class NetworkState {
    constructor(initialState) {
        this.zoom = d3.zoomIdentity;
        this.nodes = [];
        this.links = [];
    }

    update(newState) {
        this.state = { ...this.state, ...newState };
        this.notifyAll();
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notifyAll() {
        this.listeners.forEach(callback => callback(this.state));
    }
}

// Usage
const charactersState = new NetworkState({ nodes: [], edges: [], zoom: 1 });
const guestsState = new NetworkState({ nodes: [], edges: [], zoom: 1 });

// Subscribe to state changes
charactersState.subscribe(state => console.log('Characters State Updated:', state));
guestsState.subscribe(state => console.log('Guests State Updated:', state));

// Update states
charactersState.update({ nodes: [/* new nodes array */] });
guestsState.update({ edges: [/* new edges array */] });