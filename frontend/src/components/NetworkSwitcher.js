import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { switchNetwork , selectNode , selectEpisode, switchComponent} from '../features/ui/uiSlice';

const NetworkSwitcher = () => {
    const dispatch = useDispatch();
    const currentNetwork = useSelector(state => state.ui.currentNetwork);
    const characterButtonRef = useRef(null);
    const guestButtonRef = useRef(null);

    const handleSwitch = (network) => {
        dispatch(selectNode(null));
        dispatch(selectEpisode(null));
        dispatch(switchComponent(1));
        if (network === 'characters') {
            characterButtonRef.current.classList.add('selected');
            guestButtonRef.current.classList.remove('selected');
        } else if (network === 'guests') {
            characterButtonRef.current.classList.remove('selected');
            guestButtonRef.current.classList.add('selected');
        }
        dispatch(switchNetwork(network));
    };

    return (
        <div className='tabs'>
            <button
                onClick={() => handleSwitch('characters')}
                className={`tab ${currentNetwork === 'characters' ? 'selected' : ''}`}
                ref={characterButtonRef}
            >
                Character Network
            </button>
            <button
                onClick={() => handleSwitch('guests')}
                className={`tab ${currentNetwork === 'guests' ? 'selected' : ''}`}
                ref={guestButtonRef}
            >
                Guest Network
            </button>
        </div>
    );
};

export default NetworkSwitcher;
