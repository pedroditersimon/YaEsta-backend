import { useState } from "react";
import apiClient from "../../Services/ApiClient/apiClient.mjs";

import "./ChannelEvent.css";

export function ChannelEvent({ event_info }) {
    const [event, setEvent] = useState(event_info);
    const [ isDeleted, setIsDeleted ] = useState(false);

    async function handleGetClick() {
        setEvent({});
        const result = await apiClient.getEventByID(event_info._id);
        setEvent(result);
    }

    async function handleDeleteClick() {
        const result = await apiClient.deleteEvent(event_info._id);
        setIsDeleted(result);
    }

    if (isDeleted) {
        return (<p className="deleted-message">[Deleted]</p>);
    }

    return (
        <div className="channel-event">
            <div className="event-info">
                <p className="event-id">ID: {event._id}</p>
                <p className="channel-id">Channel ID: {event.channel_id}</p>
                <p className="title">Creation Date: {event.creation_date}</p>
                <p className="title">Status: {event.status}</p>
                <p className="title">Title: {event.title}</p>
                <p className="description">Description: {event.description}</p>
                <p className="action-date">Action Date: {event.action_date}</p>
                <p className="notice-time">Notice Time: {event.notice_time}</p>
                <p className="map-location">Map Location: {event.map_location}</p>
            </div>
            <div className="list">
                <button className="search-button" onClick={handleGetClick}>Refresh evento</button>
                <button className="delete-button" onClick={handleDeleteClick}>Borrar evento</button>
            </div>

        </div>
    );
}
