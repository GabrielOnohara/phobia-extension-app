/* global chrome */
import React, { 
  
 } from 'react';
import './App.css'
import Toggle from 'react-styled-toggle';
function App() {
  // }, []);
  chrome.runtime.sendMessage({popupOpen: true}, response => {
    if (response.phobias) {
      setAracnofobia(response.phobias.aracnofobia)
      setOfidiofobia(response.phobias.ofidiofobia)
    }
  });


  const [aracnofobia, setAracnofobia] = React.useState(true)
  const [ofidiofobia, setOfidiofobia] = React.useState(true)

  const toggleAracnofobia = () => {
    setAracnofobia(oldValue => {
      if(ofidiofobia === undefined){
        phobiaOptionsChanged(
          {
            aracnofobia: !oldValue,
            ofidiofobia: true,
          }
        )
      }else{
        phobiaOptionsChanged(
          {
            aracnofobia: !oldValue,
            ofidiofobia: ofidiofobia,
          }
        )
      }
      
      return !oldValue
    })
    
    console.log("Toggle Aracnofobia");
  }

  const toggleOfidiofobia = () => {
    setOfidiofobia(oldValue => {
      if(aracnofobia === undefined){
        phobiaOptionsChanged(
          {
            aracnofobia: true,
            ofidiofobia: !oldValue,
          }
        )
      }else {
        phobiaOptionsChanged(
          {
            aracnofobia: aracnofobia,
            ofidiofobia: !oldValue,
          }
        )
      }
      return !oldValue
    })
    console.log("Toggle Ofidiofobia");
  }

  const phobiaOptionsChanged = (phobias) => {

    chrome.runtime.sendMessage({phobiasChange: true, phobias: phobias}, response => {
      console.log("Phobias Change P");
      console.log(response);
      if (response.status) {
        console.log("Phobias Change 2 success");
      }
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
