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

  React.useEffect(() => {
    // Add event listener for tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.url) {
        console.log('URL changed:', changeInfo.url);
        // You can call manipulateDOM() here or perform other actions
      }
    });

    // Clean up the event listener when the component unmounts
    // return () => {
    //   chrome.tabs.onUpdated.removeListener();
    // };
  }, []);

  return (
    <div className="App">
      <button onClick={manipulateDOM}>Manipulate DOM</button>
    </div>
  );
}

export default App;
