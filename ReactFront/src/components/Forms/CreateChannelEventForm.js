import apiClient from "../../Services/ApiClient/apiClient.mjs";
import { useState, useEffect } from "react";
import {useFormInput} from "../../hooks/useFormInput";

import './CreateChannelEventForm.css';

export function CreateChannelEventForm() {
    const [isLoading, setLoading] = useState(false);
    const channelIDInput = useFormInput('', isLoading);
    const titleInput = useFormInput('', isLoading);

    async function handleClick() {
        setLoading(true);
        const event = await apiClient.createNewEvent(channelIDInput.value, titleInput.value);

        if (event.isValid()) {
            channelIDInput.clear();
            titleInput.clear();
        }

        setLoading(false);
    }

    return (
        <div className="create-event-container">
            <p className="create-event-title">Crear evento</p>
            <input className="create-event-input" placeholder="Channel ID" {...channelIDInput} />
            <input className="create-event-input" placeholder="Title" {...titleInput} />
            <button className="create-event-button" disabled={isLoading} onClick={handleClick}>Crear</button>
            {isLoading && <p className="loading-text">Loading...</p>}
        </div>
    );
}