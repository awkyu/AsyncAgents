import './ChatComponent.css';
import '../App.css';

import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, List, ListItem, ListItemText, Paper, Box } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';


const ChatComponent = ({ onSendMessage, messages, isOpen, selectedLink, removeLinkHandler }) => {
    const [hoveredSender, setHoveredSender] = useState(false);

    const handleMouseEnterSender = () => {
        setHoveredSender(true);
    };

    const handleMouseLeaveSender = () => {
        setHoveredSender(false);
    };

    const [hoveredRecipient, setHoveredRecipient] = useState(false);

    const handleMouseEnterRecipient = () => {
        setHoveredRecipient(true);
    };

    const handleMouseLeaveRecipient = () => {
        setHoveredRecipient(false);
    };

    const [message, setMessage] = useState('');

    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]); // Dependency array ensures this runs when messages update


    const handleSubmit = (event) => {
        event.preventDefault();
        onSendMessage(message);
        setMessage('');
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            {isOpen ? 
            (<div>
                <div style={
                    {
                        display: 'flex',
                        justifyContent: 'space-between',
                    }
                }>
                    <div className={'user-title text-sent scroll-hidden'} style={hoveredSender ? {
                        display: 'inline-block',
                        // textOverflow: 'auto',
                        overflow: 'auto',
                        whiteSpace: 'nowrap',
                        marginBottom: '10px',
                        minWidth: '40%',
                    } : {
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        marginBottom: '10px',
                        minWidth: '40%',
                    }}
                    onMouseEnter={handleMouseEnterSender}
                    onMouseLeave={handleMouseLeaveSender}>
                        {selectedLink[0] ? selectedLink[0] : 'None'}
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '10px',
                        marginLeft: '5px',
                        marginRight: '5px',
                    }}>
                        to
                    </div>
                    <p className={`user-title text-received scroll-hidden`}  style={hoveredRecipient ? {
                        display: 'inline-block',
                        // textOverflow: 'auto',
                        overflow: 'auto',
                        whiteSpace: 'nowrap',
                        marginBottom: '10px',
                        minWidth: '40%',
                    } : {
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        marginBottom: '10px',
                        minWidth: '40%',
                    }}
                    onMouseEnter={handleMouseEnterRecipient}
                    onMouseLeave={handleMouseLeaveRecipient}>
                        {selectedLink[1] ? selectedLink[1] : 'None'}
                    </p>
                    {/* <NameTag className={`user-title text-received`}
                    style={{
                        lineHeight: '1.4',
                        borderRadius: '18px',
                        marginBottom: '10px',
                        margin: '0px',
                    }} selectedNode={selectedLink[1] ? selectedLink[1] : 'None'} /> */}

                </div>
                <div className={`scroll-hidden ${selectedLink[0] ? "chat-container": "chat-empty"}`}>
                    {
                        selectedLink[0] ? (
                            messages.map((message, index) => (
                            <div key={index} className={`message ${message.sender === selectedLink[0] ? 'message-sent' : 'message-received'}`}>
                                <p className={`message-text ${message.sender === selectedLink[0] ? 'text-sent' : 'text-received'}`}>
                                {message.text}
                                </p>
                            </div>
                            ))
                        ) : (
                            <div 
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: 'white',
                            }}>
                                No Link Selected. Please select a link in the graph to chat.
                            </div>
                        )
                    }
                    <div ref={messagesEndRef} /> {/* Invisible element at the end of your messages */}

                </div>
                <div style={{display: 'flex'}}>
                    <TextField
                        label="Type a message"
                        fullWidth
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        margin="normal"
                    />
                    <Button style={{
                        alignSelf: 'center',
                    }}
                    color="primary" endIcon={<SendIcon />} type="submit">
                    </Button>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    marginTop: '10px',
                }}>
                    <Button style={{
                        alignSelf: 'center',
                        backgroundColor: 'red',
                        color: 'white',
                        width: '100%',
                    }}
                    onClick={() => {
                        if (selectedLink[0])
                            removeLinkHandler(selectedLink[0], selectedLink[1]);
                    }}
                    startIcon={<RemoveCircleOutlineIcon />}>
                        Remove Link
                    </Button>
                </div>
            </div>

            ) : (<div></div>)
            }
        </Box>
    );
};

export default ChatComponent;
