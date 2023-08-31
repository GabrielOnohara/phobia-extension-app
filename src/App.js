/* global chrome */
import React, { 
  
 } from 'react';
import './App.css'
import Toggle from 'react-styled-toggle';
function App() {
  // const manipulateDOM = () => {
  //   chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  //     const activeTab = tabs[0];
  //     chrome.tabs.sendMessage(activeTab.id, { action: 'manipulateDOM' }, response => {
  //       if (response.success) {
  //         console.log('DOM manipulation successful');
  //       }
  //     });
  //   });
  // };

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

  const [aracnofobia, setAracnofobia] = React.useState(true)
  const [tripofobia, setTripofobia] = React.useState(true)
  const [coulrofobia, setCoulrofobia] = React.useState(true)

  return (
    <div className="App">
      <h1>PhobIA Extension 😱</h1>
      <p>Extensão de detecção de fotos sensíveis para fobias</p>
      <ul>
        <li>
          <h3>Aracnofobia</h3> 
          {
            <Toggle checked={aracnofobia}
              onChange={() => setAracnofobia((oldValue) => !oldValue)}
            />
          }
        </li>
        <li>
        <h3>Tripofobia</h3> 
          {
            <Toggle checked={tripofobia}
              onChange={() => setTripofobia((oldValue) => !oldValue)}
            />
          }
        </li>
        <li>
        <h3>Coulrofobia</h3>  
          {
            <Toggle checked={coulrofobia}
              onChange={() => setCoulrofobia((oldValue) => !oldValue)}
            />
          }
        </li>
      </ul>
      <a href='https://github.com/GabrielOnohara/phobia-extension-app/' target="_blank" rel='noreferrer'> Github do Projeto</a>
    </div>
  );
}

export default App;
