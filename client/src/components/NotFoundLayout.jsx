import {Col, Row, Button} from "react-bootstrap";
import { React} from 'react';
import {useNavigate } from 'react-router-dom';

const NotFoundLayout=()=> {
    const navigate = useNavigate();
    return (
        <>
            <Row><Col className="text-start my-3 mx-3" ><h2>Error: page not found!</h2></Col><Col className="text-end my-3 mx-3"> <Button onClick={()=>navigate('/start')} className="custom-bg-button mt-2 my-5">Torna indietro</Button> </Col></Row>

           
            <Row className="text-center"><Col > <img src={`http://localhost:3001/pagenotfound.gif`} className="img-fluid"/> </Col></Row> 
        </>
    );
};


export default NotFoundLayout;