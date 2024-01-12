import './App.css';

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import ForceGraph3DComponent from './components/ForceGraph3DComponent';
import TabbedChatComponent from './components/TabbedSidePanel';
import NodesTable from './components/NodesTable';
import StyledSpeedDial from './components/StyledSpeedDial';
import InfoDialog from './components/InfoDialog';
import ConnectNodesAlert from './components/ConnectNodesAlert';
import NodeCreationDialog from './components/NodeCreationDialog';


const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });


const App = () => {
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [openDialog, setOpenDialog] = React.useState(false);
    const [openNodeCreationDialog, setOpenNodeCreationDialog] = React.useState(false);
    const [editNode, setEditNode] = React.useState(false);
    const [editNodeParams, setEditNodeParams] = React.useState({});

    const togglePanel = () => {
        setIsPanelOpen(!isPanelOpen);
    };
    
    // state management for socket connection
    const socketRef = useRef(null);

    const [messagesLog, setMessagesLog] = useState([]);
    const [messagesChat, setMessagesChat] = useState([]);
    const [nodeInbox, setNodeInbox] = useState([]);
    const [errorLog, setErrorLog] = useState([]);

    const [incomingMessages, setIncomingMessages] = useState([]);
    const [updateGraphLinks, setUpdateGraphLinks] = useState(false);

    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedLink, setSelectedLink] = useState([null, null]);
    const [nodeRunning, setNodeRunning] = useState({});
    const [nodeStatus, setNodeStatus] = useState({});
    const [selectedFocusedNode, setSelectedFocusedNode] = useState(null);

    const [connectNodes, setConnectNodes] = useState(false);
    const connectNodePrevious = useRef(null);

    const [availableAgentBases, setAvailableAgentBases] = useState([]);
    const [agentBaseParams, setAgentBaseParams] = useState({});

    useEffect(() => {
        // Connect to Socket.IO server
        socketRef.current = io(`${process.env.REACT_APP_API_URL}`);

        socketRef.current.on('graph_data', (data) => {
            console.log('Graph Data:', data);
            setGraphData(({ nodes, links }) => {
                if (nodes.length === 0 && links.length === 0) {
                    return data;
                } else {
                    return { nodes, links };
                }
            });
            setNodeRunning(data.nodes.reduce((obj, node) => {
                obj[node.id] = node.running;
                return obj;
            }
            , {}));
            setNodeStatus(data.nodes.reduce((obj, node) => {
                obj[node.id] = node.status;
                return obj;
            }
            , {}));
        });

        socketRef.current.on('graph_data_updated', (data) => {
            console.log('Graph Data Updated:', data);
            setGraphData(({ nodes, links }) => {
                const newNodes = data.new.nodes;
                const newLinks = data.new.links;
                const changedNodes = data.changed.nodes;
                const changedLinks = data.changed.links;
                const deletedNodes = data.deleted.nodes;
                const deletedLinks = data.deleted.links;

                // Add new nodes to existing nodes
                const updatedNodes = [...nodes, ...newNodes];

                // Remove deleted nodes from existing nodes
                const filteredNodes = updatedNodes.filter(node => !deletedNodes.some(deletedNode => deletedNode.id === node.id));

                // Update properties of changed nodes in existing nodes
                const updatedChangedNodes = filteredNodes.map(node => {
                    const changedNode = changedNodes.find(changedNode => changedNode.id === node.id);
                    if (changedNode) {
                        return { ...node, ...changedNode };
                    }
                    return node;
                });

                // Add new links to existing links
                const updatedLinks = [...links, ...newLinks];
                // console.log('Added Updated Links:', updatedLinks);

                // Remove deleted links from existing links
                const filteredLinks = updatedLinks.filter(link => !deletedLinks.some(deletedLink => deletedLink.id === link.id));
                // console.log('Deleted Updated Links:', filteredLinks);

                // Update properties of changed nodes in existing nodes
                const updatedChangedLinks = filteredLinks.map(link => {
                    const changedLink = changedLinks.find(changedLink => changedLink.id === link.id);
                    if (changedLink) {
                        return { ...link, ...changedLink };
                    }
                    return link;
                });

                console.log('Final Updated Nodes:', updatedChangedNodes);
                console.log('Final Updated Links:', updatedChangedLinks);
                return { nodes: updatedChangedNodes, links: updatedChangedLinks };
            });

            setNodeRunning(nodeRunning => {
                const updatedNodeStatuses = { ...nodeRunning, ...data.new.nodes.reduce((obj, node) => {
                    obj[node.id] = node.running;
                    return obj;
                }
                , {}) };
                return updatedNodeStatuses;
            });

            setNodeStatus(nodeStatus => {
                const updatedNodeStatuses = { ...nodeStatus, ...data.new.nodes.reduce((obj, node) => {
                    obj[node.id] = node.status;
                    return obj;
                }
                , {}) };
                return updatedNodeStatuses;
            });

            // setNodeRunning(data.new.nodes.reduce((obj, node) => {
            //     obj[node.id] = node.running;
            //     return obj;
            // }
            // , {}));
            // setNodeStatus(data.new.nodes.reduce((obj, node) => {
            //     obj[node.id] = node.status;
            //     return obj;
            // }
            // , {}));
        });

        socketRef.current.on('available_agents_instantiations', (data) => {
            console.log('Available Agent Types:', data);
            setAgentBaseParams(data);
            setAvailableAgentBases(Object.keys(data));
        });

        socketRef.current.on('run_status_updated', (data) => {
            setNodeRunning(nodeRunning => {
                const updatedNodeStatuses = { ...nodeRunning, ...data };
                return updatedNodeStatuses;
            });
        });

        socketRef.current.on('status_updated', (data) => {
            setNodeStatus(nodeStatus => {
                const updatedNodeStatuses = { ...nodeStatus, ...data };
                return updatedNodeStatuses;
            });
        });

        // Connection monitoring
        socketRef.current.on('connect', () => {
            console.log('WebSocket Connected');
        });
        socketRef.current.on('disconnect', () => {
            console.log('WebSocket Disconnected');
            setGraphData({ nodes: [], links: [] }); // Set nodes and links to an empty array
            setMessagesChat([]);
            setMessagesLog([]);
            setSelectedNode(null);
            setSelectedLink([null, null]);
        });
        socketRef.current.on('connect_error', (error) => {
            console.error('Connection Error:', error);
            setGraphData({ nodes: [], links: [] }); // Set nodes and links to an empty array
        });

        // Clean up on unmount
        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        socketRef.current.on('new_message', (data) => {          
            setMessagesChat((messagesChat) => {
                if (selectedLink[0] === data.sender && selectedLink[1] === data.recipient) {
                    console.log('Adding Message to Chat Log1:', data, selectedLink)
                    return [...messagesChat, data];
                } else if (selectedLink[0] === data.recipient && selectedLink[1] === data.sender) {
                    console.log('Adding Message to Chat Log2:', data, selectedLink)
                    return [...messagesChat, data];
                } else {
                    return messagesChat;
                }
            });
            setMessagesLog((messagesLog) => {
                if (selectedNode === data.sender || selectedNode === data.recipient ) {
                    return [...messagesLog, data];
                } else {
                    return messagesLog;
                }
            });
            setIncomingMessages((incomingMessages) => {
                return [...incomingMessages, data]
            });
            setUpdateGraphLinks(true);
            setNodeInbox((nodeInbox) => {
                if (selectedNode && !selectedNode.includes('user') && selectedNode === data.sender) {
                    const updatedInbox = [...nodeInbox];
                    updatedInbox.shift();
                    return updatedInbox;
                }
                return nodeInbox;
            });
        });

        socketRef.current.on('inbox_updated', (data) => {
            if (selectedNode && data[selectedNode]) {
                setNodeInbox(
                    data[selectedNode]
                )
            }
        });

        socketRef.current.on('error_log_updated', (data) => {
            if (selectedNode && data[selectedNode]) {
                setErrorLog(data[selectedNode])
            }
        });

        // Clean up on unmount
        return () => {
            socketRef.current.off('new_message');
            socketRef.current.off('inbox_updated');
            socketRef.current.off('error_log_updated');
        };
    }, [selectedNode, selectedLink]);

    useEffect(() => {
        setUpdateGraphLinks(false);
    }, [incomingMessages]);

    const getNodeChatLog = (nodeId) => {
        console.log('Getting Chat Log for Node:', nodeId);
        socketRef.current.emit('node_chat', nodeId);
        socketRef.current.on('node_chat', (data) => {
            console.log('Node Chat Log:', data);
            setMessagesLog(data);
        });

        socketRef.current.emit('node_inbox', nodeId);
        socketRef.current.on('node_inbox', (data) => {
            console.log('Node Inbox:', data);
            setNodeInbox(data);
        });

        socketRef.current.emit('node_error_log', nodeId);
        socketRef.current.on('node_error_log', (data) => {
            console.log('Node Error Log:', data);
            setErrorLog(data);
        });

        setSelectedNode(nodeId);
        setSelectedLink([null, null]);
        setMessagesChat([]);
    };

    const setNodeLinkNull = () => {
        setSelectedNode(null);
        setSelectedLink([null, null]);
    };

    const getLinkConversation = (sourceId, targetId) => {
        console.log('Getting Conversation for Link:', sourceId, targetId);
        socketRef.current.emit('link_chat', [ sourceId, targetId ]);
        socketRef.current.on('link_chat', (data) => {
            console.log('Link Conversation:', data);
            setMessagesChat(data);
        });
        setSelectedLink([ sourceId, targetId ]);
        setSelectedNode(null);
        setMessagesLog([]);
        setNodeInbox([]);
        setErrorLog([]);
    }

    const handleSendMessage = (text) => {
        console.log('Sending Message:', text);
        if (selectedLink[0])
            socketRef.current.emit('send_message', { sender: selectedLink[0], recipient: selectedLink[1], message: text });
    };

    const handleToggleNodeStatus = (nodeId) => {
        console.log('Toggling Node Status:', nodeId);
        socketRef.current.emit('toggle_node_status', nodeId);
    }

    const handleToggleNodeStatusAll = (on_off) => {
        console.log('Toggling Node Status All');
        socketRef.current.emit('toggle_node_status_all', on_off);
    }

    const connectNodesHandler = (sourceId, targetId) => {
        console.log('Connecting Nodes:', sourceId, targetId);
        socketRef.current.emit('connect_nodes', { source: sourceId, target: targetId });
    }

    const removeLinkHandler = (sourceId, targetId) => {
        console.log('Removing Link:', sourceId, targetId);
        socketRef.current.emit('remove_link', { source: sourceId, target: targetId });
        setSelectedLink([null, null]);
    }

    const removeNodeHandler = (nodeId) => {
        console.log('Removing Node:', nodeId);
        socketRef.current.emit('remove_node', nodeId);
        setSelectedNode(null);
    }

    const handleNodeCreation = (agentBase, name, description, prompt) => {
        console.log('Creating Node:', agentBase, name, description, prompt);
        socketRef.current.emit('create_node', { agentBase: agentBase, name: name, description: description, prompt: prompt });
        setOpenNodeCreationDialog(false);
    }

    const getEditNodeParams = (nodeId) => {
        console.log('Getting Node Params:', nodeId);
        socketRef.current.emit('get_edit_node_params', nodeId);
        socketRef.current.on('get_edit_node_params', (data) => {
            console.log('Node Params:', data);
            setEditNodeParams(data);
            setEditNode(true);
            setOpenNodeCreationDialog(true);
        });
    }

    const handleEditNode = (nodeId, agentBase, name, description, prompt) => {
        console.log('Editing Node:', nodeId, agentBase, name, description, prompt);
        socketRef.current.emit('edit_node', { id: nodeId, agentBase: agentBase, name: name, description: description, prompt: prompt });
        setOpenNodeCreationDialog(false);
    }

    const handleCopyNode = (nodeId) => {
        console.log('Copying Node:', nodeId);
        socketRef.current.emit('copy_node', nodeId);
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <div className='scroll-hidden'
            style={{
                display: 'flex',
                flexDirection: 'row',
                height: '100%',
                width: '100%',
                backgroundColor: '#1e1e1e',
                position: 'absolute',
                overflow: 'hidden',
                left: '0px',
                bottom: '0px',
                // backgroundColor: '#000000'
            }}>
                <div 
                    className='scroll-hidden'
                    id="container"
                    style={{
                        // height: '100%',
                        // width: '100%',
                    }
                }>
                    {/* <ForceGraph2DComponent graphData={graphData} /> */}
                    <ForceGraph3DComponent 
                        graphData={graphData} 
                        nodeRunning={nodeRunning} 
                        getNodeChatLog={getNodeChatLog} 
                        getLinkConversation={getLinkConversation} 
                        selectedNode={selectedNode} 
                        selectedLink={selectedLink} 
                        incomingMessages={incomingMessages} 
                        setIncomingMessages={setIncomingMessages} 
                        updateGraphLinks={updateGraphLinks} 
                        setNodeLinkNull={setNodeLinkNull} 
                        selectedFocusedNode={selectedFocusedNode} 
                        connectNodes={connectNodes}
                        connectNodePrevious={connectNodePrevious}
                        connectNodesHandler={connectNodesHandler}
                    />
                </div>
                <div className='scroll-hidden'
                style={{ width: isPanelOpen ? '25vw' : '0vw' }}>
                    <TabbedChatComponent 
                        onSendMessage={handleSendMessage} 
                        messagesChat={messagesChat} 
                        messagesLog={messagesLog} 
                        nodeInbox={nodeInbox} 
                        errorLog={errorLog} 
                        isOpen={isPanelOpen} 
                        selectedNode={selectedNode} 
                        selectedLink={selectedLink} 
                        nodeRunning={nodeRunning} 
                        handleToggleNodeStatus={handleToggleNodeStatus} 
                        nodeStatus={nodeStatus} 
                        removeLinkHandler={removeLinkHandler} 
                        setSelectedFocusedNode={setSelectedFocusedNode}
                        removeNodeHandler={removeNodeHandler}
                        getEditNodeParams={getEditNodeParams}
                        handleCopyNode={handleCopyNode}
                    />
                    <StyledSpeedDial 
                        isPanelOpen={isPanelOpen} 
                        togglePanel={togglePanel} 
                        handleToggleNodeStatusAll={handleToggleNodeStatusAll} 
                        openDialog={openDialog} 
                        setOpenDialog={setOpenDialog} 
                        connectNodes={connectNodes} 
                        setConnectNodes={setConnectNodes} 
                        connectNodePrevious={connectNodePrevious} 
                        setOpenNodeCreationDialog={setOpenNodeCreationDialog}
                    />
                </div>
                <div className='scroll-hidden'>
                    <NodesTable 
                        nodes={graphData.nodes} 
                        nodeRunning={nodeRunning} 
                        handleToggleNodeStatus={handleToggleNodeStatus} 
                        nodeStatus={nodeStatus} 
                        setSelectedFocusedNode={setSelectedFocusedNode} 
                        selectedNode={selectedNode}
                        setSelectedNode={setSelectedNode}
                        handleCopyNode={handleCopyNode}
                        removeNodeHandler={removeNodeHandler}
                    />
                </div>
                <InfoDialog open={openDialog} setOpen={setOpenDialog} />
                <ConnectNodesAlert open={connectNodes} connectNodePrevious={connectNodePrevious} />
                <NodeCreationDialog 
                    open={openNodeCreationDialog} 
                    setOpen={setOpenNodeCreationDialog} 
                    handleNodeCreation={handleNodeCreation} 
                    availableAgentBases={availableAgentBases} 
                    agentBaseParams={agentBaseParams} 
                    editNode={editNode}
                    setEditNode={setEditNode}
                    editNodeParams={editNodeParams}
                    handleEditNode={handleEditNode}
                />
            </div>
        </ThemeProvider>

    );
};

export default App;
