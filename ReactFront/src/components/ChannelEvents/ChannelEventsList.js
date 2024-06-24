import { useState, useEffect } from 'react';
import { ChannelEvent } from "./ChannelEvent.js";
import apiClient from '../../Services/ApiClient/apiClient.mjs';

import './ChannelEventsList.css';

export default function ChannelEventsList({ channel_id, channel_events=[] }) {
    const [events, setEvents] = useState(channel_events);


    async function handleGetClick() {
        setEvents([]);

        // user must have to use getChannelCompletedEvents insted!
        const result = await apiClient.getEventsByChannelID(channel_id);
        setEvents(result);
    }

    useEffect(() => {
        handleGetClick()
    }, []);

    return (
        <>
            <div className="list">
                <button className="search-button" onClick={handleGetClick}>Get events</button>
            </div>
            
            <ul className="channel-events-list">
                {events.map(event => (
                    <li key={event} className="channel-event-item">
                        <ChannelEvent event_info={event} />
                    </li>
                ))}
            </ul>
        </>
    );
}
