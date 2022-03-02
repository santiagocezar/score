import { enableMapSet } from 'immer';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
enableMapSet();

ReactDOM.render(<App />, document.getElementById('root'));
