import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState, useEffect } from 'react';
import './App.css';
import { NavHeader } from './components/NavHeader';
import React, { createContext } from 'react';
import { LoginLayout, StartLayout } from './components/PageLayout';
import { GameLayout } from './components/GameLayout';
import API from './API/API.mjs';
import RecapGameLayout from './components/RecapGameLayout';
import HistoryLayout from './components/HistoryLayout';
import ProfileLayout from './components/ProfileLayout';
import NotFoundLayout from './components/NotFoundLayout';
import { useNavigate, Navigate, Routes, Route, Outlet, useLocation  } from 'react-router-dom';
import { Container, Toast, ToastBody , Modal, Button} from 'react-bootstrap';
import FeedbackContext from "./contexts/FeedbackContext.js";




function App() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [feedback, setFeedback] = useState({title: '', message: ''});


  const setFeedbackFromError = (title, err) => {
    let t = '';
    let message = '';
    if (err.message){ 
      message = err.message;
      t = title;
    }
    else{ 
      message = "Unknown Error";
      t = "Error";
    }
    setFeedback({title: t, message: message}); // Assuming only one error message at a time
};

  useEffect(() => {
    const init = async () => {
      try {
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
        
      } catch (err) {
        if(loggedIn){
          setFeedbackFromError('Errore' ,err);
        } 
        setLoggedIn(false);
        setUser(null);
          
      }
    };
    init();
  }, []);

  const handleLogin = async (credentials) => {

      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
      setFeedback({title: "Login effettuato",message: "Benvenuto, "+ user.name});
  };

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(null);
    navigate('/');
  };

  return (
    <FeedbackContext.Provider value={{setFeedback, setFeedbackFromError}}>

     
    <Routes>
    <Route element={ 
      <>
      <NavHeader logout={handleLogout} user={user} loggedIn={loggedIn}  />
      <Container fluid className="flex-grow-1 d-flex flex-column">
        <Outlet/>
      </Container>
    </>}>
    
     
        <Route path ="/" element={loggedIn ? <Navigate replace to='/start' /> : <LoginLayout login={handleLogin} />} />
        <Route path ="/start" element={<StartLayout login={loggedIn}  />} />
        <Route path = "/start/game" element={<GameLayout login={loggedIn} user= {user} />} /> 
        <Route path = "/review" element={loggedIn ? <RecapGameLayout user = {user} login={loggedIn} /> : <Navigate replace to='/start'/> } />
        <Route path="/profile/history" element={loggedIn ? <HistoryLayout user = {user} /> : <Navigate replace to='/start' />} />
        <Route path="/profile" element={loggedIn ? <ProfileLayout user = {user} /> : <Navigate replace to='/start' />} />
 
        <Route path="/*" element={<NotFoundLayout/>}/>
        </Route>
      </Routes>
      

      <Modal show={feedback.message !== ''} >
      <Modal.Header >
        <Modal.Title>{feedback.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{feedback.message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => {if(feedback.title !== "Login effettuato" ){navigate('/start');} if(feedback.title === "Errore nel login" ){navigate('/');}  setFeedback({title: '', message: ''}); }}>Chiudi</Button>
      </Modal.Footer>
    </Modal>
      </FeedbackContext.Provider>

  );
}

export default App;

