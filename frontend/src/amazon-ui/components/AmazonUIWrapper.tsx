import React from 'react';
import { StateProvider } from '../state/StateProvider';
import reducer, { initialState } from '../state/reducer';
import AmazonApp from './App';
import '../styles/App.css';

// This wrapper isolates Amazon UI and its state
const AmazonUIWrapper: React.FC = () => {
  return (
    <div className="amazon-ui-wrapper">
      <StateProvider initialState={initialState} reducer={reducer}>
        <AmazonApp />
      </StateProvider>
    </div>
  );
};

export default AmazonUIWrapper;