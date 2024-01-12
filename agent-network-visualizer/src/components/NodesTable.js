import React, { useState } from 'react';
import {
    Accordion, AccordionSummary, AccordionDetails,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, Typography,
    TablePagination, Box, Avatar, Tooltip, IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterCenterFocusIcon from '@mui/icons-material/FilterCenterFocus';
import EditIcon from '@mui/icons-material/Edit';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StyledSwitch from './StyledNodeSwitch';



function NodesTable({ nodes, nodeRunning, handleToggleNodeStatus, nodeStatus, setSelectedFocusedNode, selectedNode, setSelectedNode, handleCopyNode, removeNodeHandler }) {
    const [expanded, setExpanded] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleAccordionChange = () => {
        setExpanded(!expanded);
    };

    // const selectedNodeRow = nodes.find(node => node.id === selectedNode);

    return (
        <Accordion expanded={expanded} onChange={handleAccordionChange} sx={{ position: 'fixed', top: 10, right: 10, maxWidth: '30%', maxHeight: '80%' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>All Nodes Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table" size="small" sx={{ tableLayout: 'fixed' }}>
                        <TableHead>
                            <TableRow sx={{ background: "#222222" }}>
                                <TableCell sx={{ width: '25%' }}>Name</TableCell>
                                <TableCell sx={{ width: '10%' }}>Type</TableCell> {/* Adjusted width */}
                                <TableCell sx={{ width: '15%' }}>Status</TableCell>
                                <TableCell sx={{ width: '50%' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>

                            {/* {selectedNodeRow ? (
                            <TableRow key={0} sx={{ border: '0px', padding: '0px', margin: '0px', background: '#cccccc' }} onClick={() => {setSelectedNode(selectedNodeRow.id)}}>
                                <TableCell component="th" scope="row" >
                                    <Box sx={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        <Tooltip title={selectedNodeRow.id}>
                                            {selectedNodeRow.id}
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                                <TableCell >
                                    <Tooltip title={selectedNodeRow.type}>
                                        <Avatar sx={{ bgcolor: selectedNodeRow.color, height: '25px', width: '25px' }}>{ selectedNodeRow.type === 'user' ? 'U' : 'AI' }</Avatar>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>{nodeStatus[selectedNodeRow.id]}</TableCell>
                                <TableCell align="center" sx={{ display: 'flex', justifyContent: 'center', maxWidth: '30%'}}>
                                        <StyledSwitch checked={nodeRunning[selectedNodeRow.id]} onChange={() => {
                                            handleToggleNodeStatus(selectedNodeRow.id);
                                        }} />
                                        <Tooltip title="Focus">
                                            <IconButton onClick={() => {
                                                setSelectedFocusedNode(selectedNodeRow.id);
                                            }}>
                                                <FilterCenterFocusIcon />
                                            </IconButton>
                                        </Tooltip>
                                </TableCell>
                            </TableRow>
                            ) : null } */}


                            {nodes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((node, index) => {
                                // if (node.id === selectedNode) {
                                //     return null;
                                // }
                                return (
                                    <TableRow key={index} sx={{ border: '0px', padding: '0px', margin: '0px', background: `${node.id === selectedNode ? '#999999' : '#333333' }` }} onClick={() => {setSelectedNode(node.id)}}>
                                        <TableCell component="th" scope="row" >
                                            <Box sx={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                <Tooltip title={node.id}>
                                                    {node.id}
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                        <TableCell >
                                            <Tooltip title={node.type}>
                                                <Avatar sx={{ bgcolor: node.color, height: '25px', width: '25px' }}>{ node.type === 'user' ? 'U' : 'AI' }</Avatar>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>{nodeStatus[node.id]}</TableCell>
                                        <TableCell align="center" sx={{ display: 'flex', justifyContent: 'left', maxWidth: '30%'}}>
                                                <StyledSwitch checked={nodeRunning[node.id]} onChange={() => {
                                                    handleToggleNodeStatus(node.id);
                                                }} />
                                                <Tooltip title="Copy">
                                                    <IconButton onClick={() => {
                                                        handleCopyNode(node.id);
                                                    }}>
                                                        <ContentCopyIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton onClick={() => {
                                                        removeNodeHandler(node.id);
                                                    }}>
                                                        <RemoveCircleOutlineIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Focus">
                                                    <IconButton onClick={() => {
                                                        setSelectedFocusedNode(node.id);
                                                    }}>
                                                        <FilterCenterFocusIcon />
                                                    </IconButton>
                                                </Tooltip>
                                        </TableCell>
                                    </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={nodes.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableContainer>
            </AccordionDetails>
        </Accordion>
    );
}

export default NodesTable;


