import './App.css';
import { useState, useEffect } from 'react';

import { Login, Register } from "../components/Forms/Auth.js";
import SearchChannelPanel from '../components/Channels/SearchChannelPanel.js';
import MyChannels from '../components/Channels/MyChannels.js';
import { CreateChannelForm } from '../components/Forms/CreateChannelForm.js';
import { CreateChannelEventForm } from '../components/Forms/CreateChannelEventForm.js';

export default function App() {
  
  return (
    <div className="App">
      <div className='list'>
        <Register />
        <Login />
      </div>

      <div className='list'>
        <CreateChannelForm />
        <CreateChannelEventForm />
      </div>

      <div className='list'>
        <MyChannels />
        <SearchChannelPanel />
      </div>

    </div>
  );

}
