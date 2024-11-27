import { React, useContext, useState, useEffect } from 'react';
import { Row, Col, Container, Button, Carousel, Image} from 'react-bootstrap';
import { LoginForm } from './LoginForm';
import { useLocation, useNavigate } from 'react-router-dom';



function StartLayout(props) {
  const navigate = useNavigate();

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
<div className="carousel-outer-wrapper">
  <div className="carousel-outer-container">
    <div className="carousel-container">
      <div className="image-carousel">
        <div className="centered-button-wrapper">
          <Button variant="primary" className="centered-button z-index-1" onClick={()=>navigate('/start/game')}>Inizia</Button>
        </div>
        <div className="carousel-images-wrapper">
          {extendedImages.map((image, index) => (
            <Image src={image} key={index} className="carousel-image"  />
          ))}
        </div>
      </div>
    </div>
  </div>
</div>
);
};





function NotFoundLayout() {
    return(
        <>
          <h2>This is not the route you are looking for!</h2>
          <Link to="/">
            <Button variant="primary">Go Home!</Button>
          </Link>
        </>
    );
  }

function LoginLayout(props) {
  return (
    <Row className="vh-100">
      <Col md={12} className="below-nav">
        <LoginForm login={props.login} />
      </Col>
    </Row>
  );
}

export { LoginLayout, StartLayout, NotFoundLayout }; 
