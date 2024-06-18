import { useState, useEffect } from 'react';
import { Channel } from "../Channels/Channel.js";
import ChannelList from "../Channels/ChannelList.js";
import apiClient from '../../Services/ApiClient/apiClient.mjs';

import './MyChannels.css';

export default function MyChannels() {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const getMyChannels = async () => {
        setIsLoading(true);
        setResults([]);
        
        const results = await apiClient.getUserChannels();
        setResults(results);
        setIsLoading(false);
    };

    useEffect(() => {
        getMyChannels();
    }, []);

    return (
        <div className="my-channels-container">
            <div className='list-center'>
                <h2 className="my-channels-title">My Channels</h2>
                <button className="search-button" onClick={getMyChannels} disabled={isLoading}>
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
                
            </div>
            {isLoading && <p className="loading-text">Loading...</p>}
            <ChannelList channels={results} />
        </div>
    );
}
