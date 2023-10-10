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
  const [tripofobia, setTripofobia] = React.useState(true)
  const [coulrofobia, setCoulrofobia] = React.useState(true)

  const toggleAracnofobia = () => {
    setAracnofobia(oldValue => {
      phobiaOptionsChanged(
        {
          aracnofobia: !oldValue,
          tripofobia: tripofobia,
          coulrofobia: coulrofobia,
        }
      )
      return !oldValue
    })
    
    console.log("Toggle Aracnofobia");
  }

  const toggleTripofobia = () => {
    setTripofobia(oldValue => {
      phobiaOptionsChanged(
        {
          aracnofobia: aracnofobia,
          tripofobia: !oldValue,
          coulrofobia: coulrofobia,
        }
      )
      return !oldValue
    })
    console.log("Toggle Tripofobia");

  }

  const toggleCoulrofobia = () => {
    setCoulrofobia(!coulrofobia)
    setCoulrofobia(oldValue => {
      phobiaOptionsChanged(
        {
          aracnofobia: aracnofobia,
          tripofobia: tripofobia,
          coulrofobia: !oldValue,
        }
      )
      return !oldValue
    })
    console.log("Toggle Coulrofobia");
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
        <h3>Tripofobia</h3> 
          {
            <Toggle checked={tripofobia}
              onChange={toggleTripofobia}
            />
          }
        </li>
        <li>
        <h3>Coulrofobia</h3>  
          {
            <Toggle checked={coulrofobia}
              onChange={toggleCoulrofobia}
            />
          }
        </li>
      </ul>
      <a href='https://github.com/GabrielOnohara/phobia-extension-app/' target="_blank" rel='noreferrer'> Github do Projeto</a>
    </div>
  );
}

export default App;
