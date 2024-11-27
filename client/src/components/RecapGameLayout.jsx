import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../API/API.mjs';
import FeedbackContext from "../contexts/FeedbackContext.js";

const RecapGameLayout = () => {
  const [review, setReview] = useState([]);
  const { setFeedbackFromError} = useContext(FeedbackContext);

  useEffect(() => {
    const fetchMeme = async () => {
      try {
        const r = await API.getReview();
        setReview(r);
      } catch (error) {
        setFeedbackFromError("Errore nel recupero dei dati", error)
      }
    };
    fetchMeme();
  }, []);

  const navigate = useNavigate();

  // Create an array of round numbers
  const rounds = [1, 2, 3];

  // Map the review data to the corresponding round
  const reviewMap = new Map();
  review.forEach(item => reviewMap.set(item.round, item));

  // Calculate the total score
  const totalScore = review.reduce((acc, item) => acc + (item.score || 0), 0);

  return (
    <Container className='mt-4'>
      <Row className="justify-content-center">
        {rounds.map((round) => {
          const item = reviewMap.get(round);
          return (
            <Col xs={12} md={6} lg={4} className="d-flex justify-content-center mb-4" key={round}>
              <Card style={{ width: '18rem' }}>
                {item ? (
                  <>
                    {(item.score != 0)&& <Card.Img variant="top" src={`http://localhost:3001/${item.image}`} />}
                    <Card.Body>
                      <Card.Title>{round}° Round</Card.Title>
                      {(item.score!=0 ) && <Card.Text>{item.description}</Card.Text>}
                      <Card.Text><small className="text-muted">+{item.score} punti</small></Card.Text>
                    </Card.Body>
                  </>
                ) : (
                  <>
                    <Card.Body>
                      <Card.Title>{round}° Round</Card.Title>
                      <Card.Text>+0 punti, tempo scaduto</Card.Text>
                      
                    </Card.Body>
                  </>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
      <Row className="justify-content-center">
        <Col xs="auto">
          <h4 className="mt-3">Punteggio totale: {totalScore} punti</h4>
        </Col>
      </Row>
      <Row>
        <Col className="d-flex justify-content-center">
          <Button className="mt-3 custom-bg-button" variant="secondary" onClick={() => navigate('/start')}>
            Fine partita
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default RecapGameLayout;
