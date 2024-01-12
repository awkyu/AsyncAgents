import React, { useState } from 'react';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';


function SimpleDialog({ onClose, open }) {
  
    const handleClose = () => {
      onClose();
    };
  
    // const handleListItemClick = (value) => {
    //   onClose(value);
    // };
  
    return (
      <Dialog onClose={handleClose} open={open}>
        <div style={{borderRadius: '10px'}}>
            <DialogTitle style={{ color: '#ffffff', borderRadius: '10px 10px 0px 0px'}}>What is this?</DialogTitle>
            <Typography 
            variant="subtitle1" 
            component="div" 
            style={{
                padding: '10px',
                margin: '0px 20px 20px 20px',
                textAlign: 'justify',
                textJustify: 'inter-word',
                backgroundColor: '#222222',
                color: '#ffffff',
                borderRadius: '10px 10px 0px 0px',
            }}>
                This is a 3D interactive graph of AI agents communicating with each other. 
                Agents are represented as nodes, and their communication channels are represented as edges.
                Click on a node to see its details. Click on an edge to see the messages being sent between the two nodes. 
                Green nodes are user nodes, and blue nodes are AI nodes. Rings around AI nodes indicate their Agent type.            
            </Typography>
        </div>
      </Dialog>
    );
  }

const InfoDialog = ({ open, setOpen }) => { 
    // const [open, setOpen] = React.useState(false);
    // const [selectedValue, setSelectedValue] = React.useState(emails[1]);

    // const handleClickOpen = () => {
    //     setOpen(true);
    // };

    const handleClose = () => {
        setOpen(false);
        // setSelectedValue(value);
    };

    return (
    <div>
        {/* <Typography variant="subtitle1" component="div">
            Selected: {selectedValue}
        </Typography>
            <br />
        <Button variant="outlined" onClick={handleClickOpen}>
            Open simple dialog
            </Button> */}
        <SimpleDialog
            open={open}
            onClose={handleClose}
        />
    </div>
    );
}


export default InfoDialog;
