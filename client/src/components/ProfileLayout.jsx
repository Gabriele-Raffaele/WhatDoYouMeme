import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Tab, Button, Badge, Form, Toast, Image, Card } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../API/API.mjs';


function ProfileLayout(props){
    const navigate = useNavigate();
    return (
        <Container className="profile-layout mt-5">
        <Row className="justify-content-center">
            <Col md={6}>
                <Card>
                    <Card.Header as="h5">Profilo utente</Card.Header>
                    <Card.Body>
                        <div className="text-center mb-3">
                            <Image 
                                src={`http://localhost:3001/${props.user.image}`}
                                roundedCircle 
                                fluid 
                                className="profile-image" 
                                alt="Profile"
                            />
                        </div>
                        <Card.Title className="text-center">{props.user.name}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted text-center">@{props.user.username}</Card.Subtitle>
                        <Card.Text>
                            <strong>Email:</strong> {props.user.email}
                        </Card.Text>
                        <Card.Text>
                            <strong>Data di nascita:</strong> {new Date(props.user.birthdate).toLocaleDateString()}
                        </Card.Text>
                        <div className="d-flex justify-content-end mt-3">
                            <Button variant="primary" className='custom-bg-button' onClick={()=>navigate('/profile/history')}>
                                Cronologia
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    </Container>
    );
}


export default ProfileLayout;