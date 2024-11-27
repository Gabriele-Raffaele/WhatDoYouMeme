import React from "react";

const FeedbackContext = React.createContext({
    setFeedback: ({title: title, message: message}) => {},
    setFeedbackFromError: (title, err) => {}
 
});

export default FeedbackContext;