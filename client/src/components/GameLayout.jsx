import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Badge, Form, Modal, Image} from 'react-bootstrap';

import { useLocation, useNavigate } from 'react-router-dom';
import API from '../API/API.mjs';
import Game from '../Models/Game.mjs';
import FeedbackContext from "../contexts/FeedbackContext.js";


const GameLayout = (props) => { 
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [game, setGame] = useState(0);
  const [meme, setMeme] = useState({id: 0, image: ''});  
  const [choice, setChoice] = useState(0);
  const [captions, setCaptions] = useState([]);
  const [captionContent, setCaptionContent] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [seconds, setSeconds] = useState(30);
  const [popupContent, setPopupContent] = useState({game: new Game(0,0,0,0,0,0), correctCaptions: [{id: 0, description: ''}, {id: 0, description: ''}]});
  const [showPopupTermina, setShowPopupTermina] = useState(false);
  const [contentGuest, setContentGuest] = useState({correctCaptions: [{id: 0, description: ''}, {id: 0, description: ''}], isCorrect: false});
  const navigate = useNavigate();
  const { setFeedbackFromError} = useContext(FeedbackContext);
  //USEEFFECT TO RETRIEVE THE GAME ID
  useEffect(() => {
    const fetchgameId = async () => {
      try {
        if (round === 1 && props.user && props.login) {
          let gameId = await API.getLastGameId();
          gameId = gameId + 1;
          setGame(gameId);
        }
      } catch (error) {
        setFeedbackFromError("Errore durante il recupero dell'id del gioco", error);
      }
    };
    fetchgameId();
  }, [props.user, game]);


//USEEFFECT TO RETRIEVE THE MEME
  useEffect(() => {
    const fetchMeme = async () => {
      try {
        if (props.login && game !== 0 && round !== 0){
          const m = await API.getMeme(game, round);
          setMeme(m);  
        }else{
          const m = await API.getRandomMeme();
          setMeme(m);
        }
      } catch (error) {
        setFeedbackFromError("Errore durante il recupero del meme", error);
      }
    };
    fetchMeme();
  }, [game, round, props.user]);


  //USEEFFECT TO RETRIEVE THE RANDOM CAPTIONS
useEffect(() => {
  const fetchCaptions = async () => {
    try {
      if (meme.id !== 0) {
      const captions = await API.getRandomCaptions(meme.id);
          // Algoritmo di Fisher-Yates per lo shuffle
          for (let i = captions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [captions[i], captions[j]] = [captions[j], captions[i]];
          }
    
      setCaptions(captions);
    }
    } catch (error) {
      setFeedbackFromError("Errore durante il recupero delle didascalie", error);
    }
  };
  fetchCaptions();
},[meme]); 


//HANDLE THE OPEN OF THE POPUP
const HandleOpen = () => {
  setShowPopup(true);
  setTimerActive(false); // Ferma il timer
  if (!props.login){
    handleCorrectCaptionGuest();
  }
}
//HANDLE THE OPEN OF THE POPUPTemina
const handleOpenTermina = () => {
  setShowPopupTermina(true);
}

//HANDLE THE ADD ROUND
const HandleAddRoundEndTime= async () => {
  try {
    if(props.login && seconds === 0 && timerActive === false){
      const g = new Game(game, props.user.id, round, 0,  meme.id, 0);  
      const r = await API.addRound(g, captions);
      setPopupContent(r);

    }
  } catch (error) {
    setFeedbackFromError("Errore durante l'aggiunta del round", error);
  }
}

//HANDLE THE ADD ROUND
const HandleAddRound= async () => {
  try {
    if(props.login ){
      const g = new Game(game, props.user.id, round, score,  meme.id, choice);  
      const r = await API.addRound(g, captions);
      setPopupContent(r);
    }
   
  } catch (error) {
    setFeedbackFromError("Errore durante l'aggiunta del round", error);
  }
}
//HANDLE THE CLOSE OF THE POPUP AND INCREMENT THE ROUND
const handleClose = () =>{
  setShowPopup(false);
  setCaptionContent('');
  setChoice(0);
  setScore(0);
  if (round!==3 && props.login || round!==1 && !props.login){
    setTimerActive(true);
  }
  incrementRound();
  
  if (round === 3 && props.login ) {
    navigate('/review');
  }
  if(round ===1 && (!props.login)) {
    navigate('/start');
  }
}


//HANDLE THE TIMER
const handleTimer = (i) => {
  setTimerActive(i);
}
//INCREMENT THE ROUND
const incrementRound = () => {
  if(props.login){
    setRound(prevRound => (prevRound < 3 ? prevRound + 1 : prevRound));
    if (round !==3 )
      setSeconds(30);
  }
  
}
//HANDLE THE TERMINA OF THE POPUP
const handleTermina = () => {
  setShowPopupTermina(false);
  navigate('/start');
}
//HANDLE THE ANNULLA OF THE POPUP
const handleAnnulla = () => {
  setShowPopupTermina(false);
}
//HANDLE THE CORRECT CAPTION FOR THE GUEST
const handleCorrectCaptionGuest = async () => {
  if (!props.login) {
    try {
      // Aspetta che la promessa sia risolta e poi procedi
      const obj = await API.checkGuestCaptions(meme.id, captions, choice);
      setContentGuest(obj);
    } catch (error) {
      // Gestisci eventuali errori qui
      setFeedbackFromError("Errore durante il controllo delle didascalie", error);
    }
  }
}


//HANDLE THE CLICK ON THE CAPTION
  const handleCaptionClick = (c) => {
    setCaptionContent(c.description);
    setChoice(c.id);
  }
//USEEFFECT TO HANDLE THE TIMER
  useEffect(() => {
    let timer;
    if (timerActive && seconds > 0 ) {
      timer = setInterval(() => {
        setSeconds(seconds => seconds - 1);
      }, 1000);
    }else if ((seconds === 0 && !timerActive && round <3) || (round ===3 && !timerActive)) { 
      if (props.login) {
        //ADD THE ROUND IN THE DB
        HandleAddRoundEndTime();}
    }
    else if (seconds === 0) {
      setScore(0);
      setChoice(0);
      if (props.login) {
        //ADD THE ROUND IN THE DB
        if (round < 3 ) {
          HandleOpen();
        } else {
          HandleOpen();
          handleTimer(false);
          
        }
      }else{
        if (round < 1 ) {
          HandleOpen();
          setSeconds(30);
        } else {
          handleTimer(false);
          HandleOpen();
          //TODO: deve spuntare il toast e solo dopo aver schiacciato il tasto del toast deve navigare a /start
        }
      }
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [timerActive, seconds, round]);

 



  return (
    <Container fluid className="vh-100 d-flex flex-column ">
      <Row className="w-100 mt-4">
        <Col>
          <Row className="d-flex align-items-center justify-content-between">
            <Col>
              <h2>Round: {round}</h2>
            </Col>
            <Col className="text-center">
              <h2>Tempo: {seconds}</h2>
              
            </Col>
            <Col className="text-end">
              <Button variant="primary" onClick={handleOpenTermina} className="custom-bg-termina">
                Termina ora
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
      

      <Container fluid className="vh-100 d-flex flex-column justify-content-center align-items-center">
  <Row className="align-items-center justify-content-center text-center w-100">
    <Col xs={12} md={4} className="d-flex flex-column align-items-center">
      {meme.image && (
        <Image
          src={`http://localhost:3001/${meme.image}`}
          rounded
          style={{ width: '100%', maxWidth: '600px', marginTop: '20px' }}
        />
      )}
      <Form.Control
        type="text"
        placeholder="La didascalia appare qui"
        value={captionContent}
        readOnly
        className="mt-2"
      />
      <Button
        variant="primary"
        onClick={() => {
          HandleAddRound();
          HandleOpen();
        }}
        className="mt-2 custom-bg-button"
      >
        Conferma
      </Button>
    </Col>
    <Col className=' justify-content-end '>
    <Caption onCaptionClick={handleCaptionClick} captions={captions} />
    </Col>
  </Row>
</Container>



    <Popup content={popupContent} login={props.login} show={showPopup} onHide={handleClose} guest={contentGuest} />
    <PopupTermina show={showPopupTermina} onHide={handleTermina} onClose={handleAnnulla} />
  </Container>
  );
};




function Caption(props) {
  return (
    <Col className="d-flex flex-column">
    {props.captions.map((caption) => (
      <Button 
        key={caption.id} 
        variant="primary" 
        onClick={() => props.onCaptionClick(caption)} 
        className="mb-2 custom-bg-button" // Classe per aggiungere margine inferiore tra i pulsanti
        style={{ width: '100%' }} // Larghezza al 100% per adattarsi alla larghezza della colonna
      >
        {caption.description}
        <span className="visually-hidden">unread messages</span>
      </Button>
    ))}
  </Col>
  
  );
}


function Popup(props) {
  return (
    <Modal show={props.show} >
      <Modal.Header>
        <Modal.Title>Risultato del Round</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.login && (
        <p>Il punteggio del round {props.content.game.round}  è di  punti {props.content.game.score}.</p>)}
        {props.content.game.score !==5 &&  props.login &&(<p>Caption più adatte: {props.content.correctCaptions[0].description} e {props.content.correctCaptions[1].description}.</p>)}
        {!props.login && props.guest.isCorrect && (<p> Il punteggio del round 1 è di punti 5</p>)} 
        {!props.login && !props.guest.isCorrect && (<p>Il punteggio del round 1 è di punti 0</p>)}
        {!props.login && !props.guest.isCorrect && (<p>Caption più adatte: {props.guest.correctCaptions[0].description} e {props.guest.correctCaptions[1].description}.</p>)}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary"  className='custom-bg-button'onClick={props.onHide}>Avanti</Button>
      </Modal.Footer>
    </Modal>
  );
}
function PopupTermina(props) {
  return (
    <Modal show={props.show} >
      <Modal.Header >
        <Modal.Title>Termina gioco</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Sei sicuro di voler terminare il gioco?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.onHide}>Termina</Button>
        <Button variant="primary" className='custom-bg-button' onClick={props.onClose}>Annulla</Button>
      </Modal.Footer>
    </Modal>
  );
}




export { GameLayout };
