import React, { useState} from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { Navbar, Nav, Form, Button, Container, Row, Col, Popover, OverlayTrigger } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LogoutButton } from './LoginForm';
import { useLocation, useNavigate } from 'react-router-dom';

const NavHeader = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
 

  const popover = (
    <Popover id="popover-profile" className="popover-bottom">
      <Popover.Body>
        <Button variant="primary"  className='mx-1 custom-bg-button' onClick={() => { navigate('/profile');  }}>
          Profilo Utente
        </Button>
        <LogoutButton logout={props.logout} />
      </Popover.Body>
    </Popover>
  );

  return (
    <Navbar expand="sm" variant="dark" className="custom-bg-color z-index-1">
      <Container fluid>
        <Row className="w-100 align-items-center">
          <Col xs="auto">
            {(location.pathname === '/profile' || location.pathname === '/profile/history') && (
              <Button variant="outline-light" onClick={() => {
                if (location.pathname === '/profile/history') {
                  navigate('/profile');
                } else {
                  navigate('/start');
                }
              }} className="ms-2">
                <i className="bi bi-arrow-left"></i> {/* Bottone freccia */}
              </Button>
            )}
          </Col>
          <Col className="text-start">
          <Link
        to="/start"
        className={`navbar-brand m-4 fs-3 ${(location.pathname === '/' || location.pathname === '/start/game') ? 'disabled' : ''}`}
      >
        What do you meme?
      </Link>
          </Col>
          <Col xs="auto" className="ms-auto me-4">
            <Nav className="d-flex align-items-center">
              {props.user && props.user.username && (
                <Navbar.Text className="mx-3 fs-7 text-truncate">
                  Benvenuto, {props.user.name}!
                </Navbar.Text>
              )}
              <Form className="d-flex">
                {/* Bottone profilo */}
                {location.pathname === '/start' && props.loggedIn && (
                  <OverlayTrigger
                    trigger="click"
                    placement="bottom"
                    overlay={popover}
                    key = "bottom"
                  >
                    <Button variant="outline-light">
                      <FaUserCircle size={22} />
                    </Button>
                  </OverlayTrigger>
                )}
                {/* Bottone login */}
                {location.pathname === '/start' && !props.loggedIn && (
                  <Button variant="outline-light" onClick={() => navigate('/')}>
                    Login
                  </Button>
                )}
                {location.pathname === '/profile' && props.loggedIn && (
                  <LogoutButton logout={props.logout} />
                )}
              </Form>
            </Nav>
          </Col>
        </Row>
      </Container>
    </Navbar>
  );
}

export { NavHeader };
