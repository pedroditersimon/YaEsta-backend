import apiClient from "../../Services/ApiClient/apiClient.mjs";
import { useState,useEffect } from "react";
import {useFormInput, useFormCheckbox} from "../../hooks/useFormInput";

import './CreateChannelForm.css';

export function CreateChannelForm() {
    const [isLoading, setLoading] = useState(false);
    const titleInput = useFormInput('', isLoading);
    const publicInput = useFormCheckbox('', isLoading);

    async function handleClick() {
        setLoading(true);
        const channel = await apiClient.createNewChannel(titleInput.value, publicInput.value);

        if (channel.isValid()) {
            titleInput.clear();
            publicInput.clear();
        }

        setLoading(false);
    }

    return (
        <div className="create-channel-container">
            <p className="create-channel-title">Crear canal</p>
            <input className="create-channel-input" placeholder="Title" {...titleInput} />
            <label className="create-channel-label">
                <input type="checkbox" className="create-channel-checkbox" {...publicInput} />
                IsPublic
            </label>
            <button className="create-channel-button" disabled={isLoading} onClick={handleClick}>Crear</button>
            {isLoading && <p className="loading-text">Loading...</p>}
        </div>
    );
}