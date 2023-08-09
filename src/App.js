/* global chrome */
import React from 'react';

function App() {
  const manipulateDOM = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { action: 'manipulateDOM' }, response => {
        if (response.success) {
          console.log('DOM manipulation successful');
        }
      });
    });
  };

  return (
    <div className="App">
      <button onClick={manipulateDOM}>Manipulate DOM</button>
    </div>
  );
}

export default App;
