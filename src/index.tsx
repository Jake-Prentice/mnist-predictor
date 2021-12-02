import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { MnistProvider } from './contexts/MnistContext';

ReactDOM.render(
  <React.StrictMode>
    <MnistProvider>
      <App />
    </MnistProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
