import React, { useState, useEffect, useRef } from 'react';
import { List, ListItem, ListItemText, Paper, Divider } from '@mui/material';
import NameTag from './NameTag';


const ChatLogComponent = ({ messages, selectedNode, nodeInbox, isOpen }) => {

    const nodeInboxEndRef = useRef(null);
    const scrollToBottomInbox = () => {
        nodeInboxEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottomInbox();
    }, [nodeInbox]); // Dependency array ensures this runs when messages update


    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]); // Dependency array ensures this runs when messages update

    return (
        <div 
            className="scroll-hidden"
            style={{ 
                height: '80vh', 
                
            }}>
            {
                selectedNode ? (
                    <div>

                        {isOpen ? <NameTag selectedNode={selectedNode} /> : null}
                        
                        <Divider style={{marginTop: '10px'}}>Node Inbox</Divider>

                        <div className="scroll-hidden" style={{
                            height: '30vh', 
                            overflow: 'auto', 
                        }}>
                            <List>
                                <div ref={nodeInboxEndRef} /> {/* Invisible element at the end of your messages */}
                                {nodeInbox.map((message, index) => (
                                    <Paper style={{ marginTop: 10, elevation: 10 }}>
                                        <ListItem key={index}>
                                            <ListItemText
                                                primary={`${message.message}`}
                                                secondary={`${message.sender}`}
                                            />
                                        </ListItem>
                                    </Paper>
                                ))}
                            </List>
                        </div>

                        <Divider style={{marginTop: '10px', marginBottom: '10px'}}>Chat Log</Divider>

                        <div className="scroll-hidden" style={{
                            height: '35vh', 
                            overflow: 'auto', 
                        }}>
                            <List>
                                {messages.map((message, index) => (
                                    <Paper style={{ marginTop: 10, elevation: 10 }}>
                                        <ListItem key={index}>
                                            <ListItemText
                                                primary={`[${message.sender} --> ${message.recipient}]: ${message.text}`}
                                                secondary={new Date(message.timestamp).toLocaleString()}
                                            />
                                        </ListItem>
                                    </Paper>
                                ))}
                                <div ref={messagesEndRef} /> {/* Invisible element at the end of your messages */}
                            </List>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                    }}>
                        No Node selected. Please select a node from the graph to see its chat log.
                    </div>
                )
            }

        </div>
    );
};

export default ChatLogComponent;
