import React from 'react';
import { StateProvider } from '../state/StateProvider';
import reducer, { initialState } from '../state/reducer';
import bhoomiApp from './App';
import '../styles/App.css';

// This wrapper isolates bhoomi UI and its state
const bhoomiUIWrapper: React.FC = () => {
  return (
    <div className="bhoomi-ui-wrapper">
      <StateProvider initialState={initialState} reducer={reducer}>
        <bhoomiApp />
      </StateProvider>
    </div>
  );
};

export default bhoomiUIWrapper;