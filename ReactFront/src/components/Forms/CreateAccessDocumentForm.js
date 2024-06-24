import apiClient from "../../Services/ApiClient/apiClient.mjs";
import { useState } from "react";
import { useFormInput } from "../../hooks/useFormInput";
import './CreateAccessDocumentForm.css';

export function CreateAccessDocumentForm() {
    const [isLoading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const enabledInput = useFormInput(false, isLoading);
    const requiresApprovalInput = useFormInput(false, isLoading);
    const actionTypeInput = useFormInput('', isLoading);
    const targetChannelIDInput = useFormInput('', isLoading);
    const channelTitleTemplateInput = useFormInput('New Channel {index}', isLoading);

    async function handleClick() {
        setLoading(true);
        setErrorMessage(null);

        try {
            const accessDocumentPayload = {
                enabled: enabledInput.value,
                requires_approval: requiresApprovalInput.value,
                action_type: actionTypeInput.value,
                target_channel_id: targetChannelIDInput.value,
                channel_title_template: channelTitleTemplateInput.value,
            };
            
            const response = await apiClient.createAccessDocument(accessDocumentPayload);

            if (response && response.isValid && response.isValid())
            {
                enabledInput.clear();
                requiresApprovalInput.clear();
                actionTypeInput.clear();
                targetChannelIDInput.clear();
                channelTitleTemplateInput.clear();
            }
            else {
                setErrorMessage("Failed to create access document. Please try again.");
            }
        } catch (error) {
            setErrorMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="create-access-document-container">
            <p className="create-access-document-title">Crear Access Document</p>
            <label className="create-access-document-label" htmlFor="enabled">
                <input className="create-access-document-checkbox" type="checkbox" id="enabled" {...enabledInput} />
                Enabled
            </label>
            
            <label className="create-access-document-label">
                <input className="create-access-document-checkbox" type="checkbox" id="requires-approval" {...requiresApprovalInput} />
                Requires Approval
            </label>
            <label className="create-access-document-label">
                Action type
                <select className="create-access-document-input" id="action-type" {...actionTypeInput} >
                    <option value="create">Create</option>
                    <option value="subscribe">Subscribe</option>
                </select>
            </label>
            <input className="create-access-document-input" placeholder="Target Channel ID" {...targetChannelIDInput} />
            <input className="create-access-document-input" placeholder="Channel Title Template" {...channelTitleTemplateInput} />
            <button className="create-access-document-button" disabled={isLoading} onClick={handleClick}>Crear</button>
            {isLoading && <p className="loading-text">Loading...</p>}
            {errorMessage && <p className="error-text">{errorMessage}</p>}
        </div>
    );
}
