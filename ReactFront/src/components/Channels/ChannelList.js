import { useState, useEffect } from 'react';
import { Channel } from "../Channels/Channel.js";
import apiClient from '../../Services/ApiClient/apiClient.mjs';

import './ChannelList.css';

export default function ChannelList({ channels }) {
    return (
        <ul className="channels-list">
            {channels.map(channel => (
                <li key={channel._id} className="channel-item">
                    <Channel channel={channel} />
                </li>
            ))}
        </ul>
    );
}
