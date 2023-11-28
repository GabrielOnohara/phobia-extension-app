/* global chrome */
import React, { 
  
 } from 'react';
import './App.css'
import Toggle from 'react-styled-toggle';
function App() {

  // React.useEffect(() => {
  //   // Add event listener for tab updates
  //   chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  //     if (changeInfo.url) {
  //       console.log('URL changed:', changeInfo.url);
  //       // You can call manipulateDOM() here or perform other actions
  //     }
  //   });

  //   // Clean up the event listener when the component unmounts
  //   // return () => {
  //   //   chrome.tabs.onUpdated.removeListener();
  //   // };
  // }, []);

  const [aracnofobia, setAracnofobia] = React.useState(true)
  const [ofidiofobia, setOfidiofobia] = React.useState(true)

  const toggleAracnofobia = () => {
    setAracnofobia(oldValue => {
      phobiaOptionsChanged(
        {
          aracnofobia: !oldValue,
          ofidiofobia: ofidiofobia,
        }
      )
      return !oldValue
    })
    
    console.log("Toggle Aracnofobia");
  }

  const toggleOfidiofobia = () => {
    setOfidiofobia(oldValue => {
      phobiaOptionsChanged(
        {
          aracnofobia: aracnofobia,
          ofidiofobia: !oldValue,
        }
      )
      return !oldValue
    })
    console.log("Toggle Ofidiofobia");
  }

  const phobiaOptionsChanged = (phobias) => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { action: 'phobiaOptionsChanged', phobias: phobias }, response => {
        if (response.success) {
          console.log('phobiaOptionsChanged successful');
        }
      });
    });
  };

  return (
    <div className="App">
      <h1>PhobIA Extension 😱</h1>
      <p>Extensão de detecção de fotos sensíveis para fobias</p>
      <ul>
        <li>
          <h3>Aracnofobia</h3> 
          {
            <Toggle checked={aracnofobia}
              onChange={toggleAracnofobia}
            />
          }
        </li>
        <li>
        <h3>Ofidiofobia</h3>  
          {
            <Toggle checked={ofidiofobia}
              onChange={toggleOfidiofobia}
            />
          }
        </li>
      </ul>
      <a href='https://github.com/GabrielOnohara/phobia-extension-app/' target="_blank" rel='noreferrer'> Github do Projeto</a>
    </div>
  );
}

export default App;
