import React, { useState } from 'react';
import { Form, Button, Alert, Col, Row, Container } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
//react-slick
function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
//HANDLE SUBMIT
  const handleSubmit = (event) => {
    event.preventDefault();
    const credentials = { username, password };

    props.login(credentials)
      .then(() => navigate("/start"))
      .catch((err) => {
        if(err.message === "Unauthorized")
          setErrorMessage("Invalid username and/or password");
        else
          setErrorMessage(err.message);
        setShow(true);
      });
  };

  const images = [
    'http://localhost:3001/background1.jpg',
    'http://localhost:3001/background2.jpg',
    'http://localhost:3001/background3.jpg',
    'http://localhost:3001/background4.jpg',
    'http://localhost:3001/background5.jpg',
    'http://localhost:3001/background6.jpg',
  
  ];
   // Duplicate the image array to create an infinite scrolling effect
 const extendedImages = [...images, ...images];


  return (
    
    <Container fluid className="m-0 p-0 w-100 h-100 d-flex justify-content-center  align-items-center carousel-container">
      
<div className="carousel-images-wrapper">
          {extendedImages.map((image, index) => (
            <img src={image} key={index} className="carousel-image" alt={`Image ${index}`} />
          ))}</div>
      <Row className="justify-content-center w-100 position-absolute">
        <Col md={4} className="login-form-container">
          <h1 className="pb-3">Login</h1>
          <Form onSubmit={handleSubmit}>
            <Alert
              dismissible
              show={show}
              onClose={() => setShow(false)}
              variant="danger">
              {errorMessage}
            </Alert>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                value={username} placeholder="Esempio: user1"
                onChange={(ev) => setUsername(ev.target.value)}
                required={true}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password} placeholder="Inserisci la password."
                onChange={(ev) => setPassword(ev.target.value)}
                required={true}
              />
            </Form.Group>
            <Button className="mt-3 mx-3" variant="secondary" onClick={() => navigate('/start')}>Continue as Guest!</Button>
            <Button className="mx-3 mt-3" type="submit">Login</Button>
          </Form>
        </Col>  
      </Row>
    </Container>
  );
}

function LogoutButton(props) {
  const navigate = useNavigate();
  return (
    <Button variant="outline-light" className='custom-bg-button-logout' onClick={() => { props.logout(); navigate('/'); }}>Logout</Button>
  )
}

function LoginButton(props) {
  const navigate = useNavigate();
  return (
    <Button variant="outline-light" onClick={() => navigate('/start')}>Login</Button>
  )
}

export { LoginForm, LogoutButton, LoginButton };
