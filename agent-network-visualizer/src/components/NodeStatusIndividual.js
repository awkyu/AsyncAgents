import React, { useEffect, useRef } from 'react';
import { List, ListItem, ListItemText, Paper, Divider, Tooltip, IconButton } from '@mui/material';
import NameTag from './NameTag';
import StyledSwitch from './StyledNodeSwitch';

import FilterCenterFocusIcon from '@mui/icons-material/FilterCenterFocus';
import EditIcon from '@mui/icons-material/Edit';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';


const NodeStatusIndividual = ({ errorLog, selectedNode, nodeRunning, handleToggleNodeStatus, nodeStatus, 
    isOpen, setSelectedFocusedNode, removeNodeHandler, getEditNodeParams, handleCopyNode 
}) => {

    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [errorLog]); // Dependency array ensures this runs when messages update

    const handleToggle = () => {
        handleToggleNodeStatus(selectedNode);
    }

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
                        
                        <Divider style={{marginTop: '10px'}}>Node Status</Divider>

                        <div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '10px',
                                alignItems: 'center',
                            }}>                                
                                <div>
                                    {nodeStatus[selectedNode]}
                                </div>
                                <div>
                                    { isOpen ?
                                    <StyledSwitch 
                                        checked={nodeRunning[selectedNode]}
                                        onChange={handleToggle}
                                    />
                                    : null }
                                </div>
                            </div>

                            <div>

                            </div>
                        </div>

                        <Divider style={{marginTop: '10px'}}>Node Actions</Divider>

                        <div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                // marginTop: '10px',
                            }}>                                
                                <div>
                                    Edit Node
                                </div>
                                <div>
                                    <Tooltip title="Edit Node">
                                        <IconButton onClick={() => {
                                            // setSelectedFocusedNode(node.id);
                                            getEditNodeParams(selectedNode);
                                        }}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                // marginTop: '10px',
                            }}>                                
                                <div>
                                    Copy Node
                                </div>
                                <div>
                                    <Tooltip title="Copy Node">
                                        <IconButton onClick={() => {
                                            // setSelectedFocusedNode(node.id);
                                            // getEditNodeParams(selectedNode);
                                            handleCopyNode(selectedNode);
                                        }}>
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                // marginTop: '10px',
                            }}>                                
                                <div>
                                    Delete Node
                                </div>
                                <div>
                                    <Tooltip title="Remove Node">
                                        <IconButton onClick={() => {
                                            // setSelectedFocusedNode(node.id);
                                            removeNodeHandler(selectedNode);
                                        }}>
                                            <RemoveCircleOutlineIcon />
                                        </IconButton>
                                    </Tooltip>
                                    
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                // marginTop: '10px',
                            }}>                                
                                <div>
                                    Focus Node
                                </div>
                                <div>
                                    <Tooltip title="Focus on Node">
                                        <IconButton onClick={() => {
                                            setSelectedFocusedNode(selectedNode);
                                        }}>
                                            <FilterCenterFocusIcon />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>

                        <Divider style={{marginTop: '10px', marginBottom: '10px'}}>Info Logs</Divider>

                        <div className="scroll-hidden" style={{
                            height: '35vh', 
                            overflow: 'auto', 
                        }}>
                            <List>
                                {errorLog.map((message, index) => (
                                    <Paper style={{ marginTop: 10, elevation: 10 }}>
                                        <ListItem key={index}>
                                            <ListItemText
                                                primary={`${message.error}`}
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
                        No Node selected. Please select a node from the graph to see node details.
                    </div>
                )
            }

        </div>
    );
};

export default NodeStatusIndividual;
