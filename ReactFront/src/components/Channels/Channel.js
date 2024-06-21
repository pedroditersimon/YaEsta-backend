import apiClient from "../../Services/ApiClient/apiClient.mjs";
import ChannelEventsList from "../ChannelEvents/ChannelEventsList.js";
import { useState } from "react";

import "./Channel.css";

export function Channel({ channel }) {
    const [ isLoading, setIsLoading ] = useState(false);
    const [ isDeleted, setIsDeleted ] = useState(false);

    async function handleSubscribeClick() {
        setIsLoading(true);

        const result = await apiClient.subscribeToChannel(channel._id);
        setIsLoading(false);
    }

    async function handleUnsubscribeClick() {
        setIsLoading(true);

        const result = await apiClient.unsubscribeFromChannel(channel._id);
        setIsDeleted(result);
        setIsLoading(false);
    }

    async function handleDeleteClick() {
        setIsLoading(true);

        const result = await apiClient.deleteChannel(channel._id);
        setIsDeleted(result);
        setIsLoading(false);
    }

    if (isDeleted) {
        return (<></>);
    }

    return (
        <div className="channel">
            <div className="channel-info">
                <p className="channel-id">ID: {channel._id}</p>
                <p className="title">Creation Date: {channel.creation_date}</p>
                <p className="channel-title">Title: {channel.title}</p>
                <p className="channel-public">Public: {channel.isPublic ? 'Yes' : 'No'}</p>
                <p className="channel-title">Members: {channel.membersCount}</p>
                <p className="channel-events-title">Events ({channel.eventsCount}):</p>
            </div>

            <ChannelEventsList channel_id={channel._id} />

            <div className="list">
                <button disabled={isLoading} className="delete-button" onClick={handleUnsubscribeClick}>De-subscribirse</button>
                <button disabled={isLoading} className="search-button" onClick={handleSubscribeClick}>Subscribirse</button>
            </div>
            <button disabled={isLoading} className="delete-button" onClick={handleDeleteClick}>Borrar canal</button>

        </div>
    );
}


