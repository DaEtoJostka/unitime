import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #f5f5f5;
    color: #333;
    -webkit-tap-highlight-color: transparent;
  }
  
  /* Improve touch handling */
  @media (max-width: 768px) {
    html, body {
      overflow-x: hidden;
      position: relative;
      height: 100%;
    }
    
    input, button, select, textarea {
      font-size: 16px !important; /* Prevent iOS zoom on focus */
    }
    
    button {
      touch-action: manipulation;
    }
    
    .desktop-only {
      display: none !important;
    }
  }
`;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <GlobalStyle />
    <App />
  </React.StrictMode>
); 