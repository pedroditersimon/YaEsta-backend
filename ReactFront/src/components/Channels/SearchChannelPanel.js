import { useState } from 'react';
import { Channel } from "../Channels/Channel.js";
import ChannelList from "../Channels/ChannelList.js";

import apiClient from '../../Services/ApiClient/apiClient.mjs';

import './SearchChannelPanel.css';

export default function SearchChannelPanel() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        setIsLoading(true);
        setSearchResults([]);

        const results = await apiClient.getPublicChannels(searchTerm);
        setSearchResults(results);
        setIsLoading(false);
    };

    return (
        <div className="search-channel-panel">
            <p className="search-title">Search for Channels</p>
            <div className='list'>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Channel title..."
                    disabled={isLoading}
                    className="search-input"
                />
                <button className="search-button" onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {isLoading && <p className="loading-text">Loading...</p>}
            <ChannelList channels={searchResults} />
        </div>
    );
}
