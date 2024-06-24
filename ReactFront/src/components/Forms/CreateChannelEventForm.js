import apiClient from "../../Services/ApiClient/apiClient.mjs";
import { useState } from "react";
import { useFormInput } from "../../hooks/useFormInput";
import './CreateChannelEventForm.css';

export function CreateChannelEventForm() {
    const [isLoading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const channelIDInput = useFormInput('', isLoading);
    const titleInput = useFormInput('', isLoading);
    const descriptionInput = useFormInput('', isLoading);
    const actionDateInput = useFormInput('', isLoading);
    const reminderDateInput = useFormInput('', isLoading);

    async function handleClick() {
        setLoading(true);
        setErrorMessage(null);

        try {
            const eventPayload = {
                channel_id: channelIDInput.value,
                title: titleInput.value,
                description: descriptionInput.value,
                action_date: actionDateInput.value,
                reminder_date: reminderDateInput.value,
            };
            
            const response = await apiClient.createNewEvent(eventPayload);

            if (response && response.isValid && response.isValid()) {
                channelIDInput.clear();
                titleInput.clear();
                descriptionInput.clear();
                actionDateInput.clear();
                reminderDateInput.clear();
            } else {
                setErrorMessage("Failed to create event. Please try again.");
            }
        } catch (error) {
            setErrorMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="create-event-container">
            <p className="create-event-title">Crear evento</p>
            <input className="create-event-input" placeholder="Channel ID" {...channelIDInput} />
            <input className="create-event-input" placeholder="Title" {...titleInput} />
            <input className="create-event-input" placeholder="Description" {...descriptionInput} />
            <label className="create-event-label" htmlFor="action-date">Action Date</label>
            <input className="create-event-input" type="datetime-local" id="action-date" {...actionDateInput} />
            <label className="create-event-label" htmlFor="reminder-date">Reminder Date</label>
            <input className="create-event-input" type="datetime-local" id="reminder-date" {...reminderDateInput} />
            <button className="create-event-button" disabled={isLoading} onClick={handleClick}>Crear</button>
            {isLoading && <p className="loading-text">Loading...</p>}
            {errorMessage && <p className="error-text">{errorMessage}</p>}
        </div>
    );
}
