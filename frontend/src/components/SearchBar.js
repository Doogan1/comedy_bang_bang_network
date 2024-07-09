import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectNode , addNodeToSet} from '../features/ui/uiSlice';
import { selectCharacterNames } from '../features/characters/characterSlice';
import { selectGuestNames } from '../features/guests/guestSlice';
import '../styles.css'; 

const SearchBar = () => {
  const dispatch = useDispatch();
  const currentNetwork = useSelector((state) => state.ui.currentNetwork);
  const characterNames = useSelector(selectCharacterNames);
  const guestNames = useSelector(selectGuestNames);

  const [query, setQuery] = useState('');

  const handleSearch = (event) => {
    setQuery(event.target.value);
  };

  const handleSelect = (id) => {
    dispatch(selectNode(id));
    dispatch(addNodeToSet(id));
    setQuery(''); // Clear the search query after selection
  };

  const names = currentNetwork === 'characters' ? characterNames : guestNames;
  const filteredNames = names.filter((name) => name.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5); // Limit to closest 5 names

  return (
    <div className="search-bar-container">
      <input 
        type="text" 
        value={query} 
        onChange={handleSearch} 
        placeholder="Search name..." 
        className="search-input"
      />
      {query && filteredNames.length > 0 && (
        <ul className="search-dropdown">
          {filteredNames.map((name) => (
            <li key={name.id} onClick={() => handleSelect(name.id)} className="search-item">
              {name.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
