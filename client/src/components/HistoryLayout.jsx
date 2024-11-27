import React, { useState, useEffect, useContext} from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { Container, Row, Col, Nav, Tab, Button, Badge, Card, FormControl, Form, InputGroup } from 'react-bootstrap';
import API from '../API/API.mjs';
import FeedbackContext from "../contexts/FeedbackContext.js";




function LeftTabsExample(props) {
  const [games, setGames] = useState([]);
  const [gameDetails, setGameDetails] = useState({});
  const [activeKey, setActiveKey] = useState("game-0");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
const { setFeedbackFromError} = useContext(FeedbackContext);
//USEEFFECT TO RETRIVE ID GAMES
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const fetchedGames = await API.getAllGamesByUsername(props.user.id);
        setGames(fetchedGames);
      } catch (error) {
        setFeedbackFromError("Errore nel recupero delle partite", error)
      }
    };

    fetchGames();
  }, [props.user.id]);
  //USEEFFECT TO RETRIVE DETAILS OF GAMES
  useEffect(() => {
    const fetchGameDetails = async (gameId) => {
      try {
        if(gameId !== 0){
        const details = await API.getGameById(gameId);
        setGameDetails(prevDetails => ({
          ...prevDetails,
          [gameId]: details
        }));}
      } catch (error) {
        setFeedbackFromError("Errore nel recupero dei dettagli della partita", error)
      }
    };
    //SPLIT ACTIVEKEY TO GET ID GAME AND CALL FETCHGAMEDETAILS
    const gameId = parseInt(activeKey.split('-')[1], 10);
    if (!gameDetails[gameId]) {
      fetchGameDetails(gameId);
    }
  }, [activeKey, games, props.user.id, gameDetails]);

  //HANDLESELECT TO SET ACTIVEKEY (GAME ID)
  const handleSelect = (eventKey) => {
    setActiveKey(eventKey);
  };
//CALCULATE TOTAL SCORE
  const calculateTotalScore = (details) => {
    return details.reduce((total, detail) => total + (detail.score || 0), 0);
  };
//SORT GAMES
  const sortedGames = [...games].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.id - b.id;
    } else {
      return b.id - a.id;
    }
  });
//FILTER GAMES
  const filteredGames = () => {
    return sortedGames.filter(game => game.id.toString().includes(searchTerm));
  };
//HANDLEORDER TO SET SORTORDER
  const handleOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const renderRoundCard = (round, details) => {
    const roundDetails = details.find(detail => detail.round === round) || {};
    const { image, description, score } = roundDetails;
    return (
      <Col xs={12} md={6} lg={4} className="justify-content-center " key={round}>
        <Row className="justify-content-center mx-4 mt-5">
          <Card style={{ width: '18rem' }}>
            {image && (
              <Card.Img variant="top" src={`http://localhost:3001/${image}`} className="mt-2" />
            )}
            <Card.Body>
              <Card.Title>{round}° Round</Card.Title>
              <Card.Text>{description || 'Round non giocato'}</Card.Text>
              <Card.Text>
                <small className="text-muted">{score !== undefined ? `+${score} punti` : '0 punti'}</small>
              </Card.Text>
            </Card.Body>
          </Card>
        </Row>
      </Col>
    );
  };

  const filteredGamesList = filteredGames(); // Invoke filteredGames to get the array

  return (
    <Tab.Container id="left-tabs-example" activeKey={activeKey} onSelect={handleSelect}>
      <Row className="">
        <Col sm={3} className="col-md-3 bg-light d-md-block overflow-auto rounded" id="game-list">
          <Form.Group className="my-3">
            <InputGroup>
            
              <FormControl
                type="text"
                placeholder="Cerca per id"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           
              <Button variant="outline-secondary" onClick={handleOrder}>
                  {sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />}
                </Button>
          
            </InputGroup>
          </Form.Group>
          <Nav variant="pills" className="flex-column my-1">
            {filteredGamesList.map((game) => ( // Use filteredGamesList here
              <Nav.Item key={game.id}>
                <Nav.Link eventKey={`game-${game.id}`}>{`Game ${game.id}`}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Col>
        <Col sm={9}>
          <Tab.Content>
            {filteredGamesList.map((game) => ( // Use filteredGamesList here
              <Tab.Pane eventKey={`game-${game.id}`} key={game.id}>
                {gameDetails[game.id] ? (
                  <Row className="justify-content-center ">
                   
                    {[1, 2, 3].map((round) => renderRoundCard(round, gameDetails[game.id]))} 
                    <Row className="text-center mt-4">

                    <h4>Punteggio totale: {calculateTotalScore(gameDetails[game.id])} punti</h4>
                    </Row>
                  </Row>
                ) : (
                  <div>Loading...</div>
                )}
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  );
}

export default LeftTabsExample;
