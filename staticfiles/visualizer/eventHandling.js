import { highlightNode , resetHighlights } from "/static/visualizer/networkBehavior.js";
import { switchEntityType , updateNodeSizes, fetchCharacterDetails, fetchGuestDetails, getCurrentEntityType} from "/static/visualizer/networkDataManagement.js";
import { resizeSidebar } from "/static/visualizer/menuBehavior.js";

let currentClickHandler;
let currentInputHandler;
let currentChangeHandler;

function createClickHandler(simulation, node, link, labels) {
    return function onBodyClick(event) {
        const target = event.target;
        const targetId = target.getAttribute('id');
        const isNode = target.classList.contains('node');
        const isSVG = target.classList.contains('networkSVG');

        switch (targetId) {
            case 'toggleSimulation':
                simulation.toggleSimulation();
                break;
            case 'tab-characters':
                switchEntityType('characters');
                break;
            case 'tab-guests':
                switchEntityType('guests');
                break;
            case 'centerOnGraph':
                simulation.adjustView();
                break;
        }

        if (isNode) {
            const nodeId = parseInt(target.getAttribute('node-id'));
            highlightNode(nodeId, node, link, labels);
            const currentEntityType = getCurrentEntityType();
            switch (currentEntityType) {
                case 'characters':
                    fetchCharacterDetails(nodeId, simulation);
                    resizeSidebar();
                    break;
                case 'guests':
                    fetchGuestDetails(nodeId);
                    resizeSidebar();
                    break;
            }
        }

        if (isSVG) {
            resetHighlights(node, link, labels);
        }

        if (!document.getElementById('characterDetails').contains(event.target)) {
            document.getElementById('characterDetails').style.display = 'none';
        }

        if (!document.getElementById('guestDetails').contains(event.target)) {
            document.getElementById('guestDetails').style.display = 'none';
        }
    };
}

function createInputHandler(simulation) {
    return function onBodyInput(event) {
        const targetId = event.target.getAttribute('id');
        switch (targetId) {
            case 'linkDistance':
            case 'chargeStrength':
                simulation.updateForces();
                break;
            case 'nodeScale':
                const scaleFactor = parseFloat(event.target.value);
                const centralityMeasure = document.getElementById('centralitySelector').value;
                document.getElementById('scaleValue').textContent = `${scaleFactor}x`;
                updateNodeSizes(centralityMeasure);
                break;
        }
    }
}



function onBodyChange(event) {
    const targetId = event.target.getAttribute('id');
    switch (targetId) {
        case 'centralitySelector':
            updateNodeSizes(event.target.value);
            break;
        case 'toggleNames':
            toggleNodeNames(event.target.checked);
            break;
    }
}

export function setupEventListeners(simulation, node, link, labels, svg, zoom) {
    // Remove any existing listeners if they exist
    if (currentClickHandler) {
        document.body.removeEventListener('click', currentClickHandler);
    }

    if (currentInputHandler) {
        document.body.removeEventListener('input', currentInputHandler);
    }
    // Create new handlers with the current context
    currentClickHandler = createClickHandler(simulation, node, link, labels, svg, zoom);
    currentInputHandler = createInputHandler(simulation);

    document.body.addEventListener('click', currentClickHandler);
    
    document.body.addEventListener('input', currentInputHandler);
    
    document.body.removeEventListener('change', onBodyChange);
    document.body.addEventListener('change', onBodyChange);
    
}

