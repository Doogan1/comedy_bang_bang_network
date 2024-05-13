import React from 'react';
import { useSelector } from 'react-redux';

const Sidebar = () => {
    const { entityType, entityDetails } = useSelector(state => state.ui);

    return (
        <div className="sidebar">
            <div className="resizer"></div>
            <h3>{entityType === 'characters' ? 'Character Details' : 'Guest Details'}</h3>
            <div>{entityDetails.name}</div>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Episode Number</th>
                        <th>Release Date</th>
                    </tr>
                </thead>
                <tbody>
                    {entityDetails.episodes.map((episode, index) => (
                        <tr key={index}>
                            <td>{episode.title}</td>
                            <td>{episode.episodeNumber}</td>
                            <td>{episode.releaseDate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Sidebar;
