import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Paper } from '@mui/material';
import ChatComponent from './ChatComponent';
import ChatLogComponent from './ChatLogComponent';
import NodeStatusIndividual from './NodeStatusIndividual';


const TabbedChatComponent = ({ onSendMessage, messagesChat, messagesLog, errorLog, nodeInbox, 
    isOpen, selectedNode, selectedLink, nodeRunning, handleToggleNodeStatus, nodeStatus, removeLinkHandler, 
    setSelectedFocusedNode, removeNodeHandler, getEditNodeParams, handleCopyNode
}) => {
    const [selectedTab, setSelectedTab] = useState(0);

    useEffect(() => {
        setSelectedTab((selectedTab) => {
            if (selectedNode) {
                if (selectedTab === 0) {
                    return 1;
                }
                return selectedTab;
            } else if (selectedLink) {
                return 0;
            } else {
                return selectedTab;
            }
        })
    }, [selectedNode, selectedLink]);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    return (
        <Paper style={{
            height: '94vh',
            position: 'fixed', 
            left: '2%', 
            top: '2%', 
            bottom: '2%', 
            width: isOpen ? '25%': '0px',
            // backgroundColor: '#eeeeee' 
            }}>
            <Tabs
                orientation="horizontal"
                variant="fullWidth"
                value={selectedTab}
                onChange={handleTabChange}
                style={{ borderBottom: 1, borderColor: 'divider' }}
                height="100%"
            >
                <Tab label="Link Chat" />
                <Tab label="Node Chat" />
                <Tab label="Node Status" />
            </Tabs>

            {selectedTab === 0 && isOpen && (
                <Box p={3}>
                    <ChatComponent onSendMessage={onSendMessage} messages={messagesChat} isOpen={isOpen} selectedLink={selectedLink} removeLinkHandler={removeLinkHandler} />
                </Box>
            )}
            {selectedTab === 1 && isOpen && (
                <Box p={3}>
                    <ChatLogComponent messages={messagesLog} selectedNode={selectedNode} nodeInbox={nodeInbox} isOpen={isOpen} />
                </Box>
            )}
            {selectedTab === 2 && isOpen && (
                <Box p={3}>
                    <NodeStatusIndividual 
                        errorLog={errorLog} 
                        selectedNode={selectedNode} 
                        nodeRunning={nodeRunning} 
                        handleToggleNodeStatus={handleToggleNodeStatus} 
                        nodeStatus={nodeStatus} 
                        nodeInbox={nodeInbox} 
                        isOpen={isOpen} 
                        setSelectedFocusedNode={setSelectedFocusedNode} 
                        removeNodeHandler={removeNodeHandler} 
                        getEditNodeParams={getEditNodeParams}
                        handleCopyNode={handleCopyNode}
                    />
                </Box>
            )}
        </Paper>
    );
};

export default TabbedChatComponent;
