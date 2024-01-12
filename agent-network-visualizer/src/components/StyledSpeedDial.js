import React from 'react';

import { SpeedDial, SpeedDialIcon, SpeedDialAction } from '@mui/material';
import { styled } from '@mui/material/styles';

import WebStoriesIcon from '@mui/icons-material/WebStories';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import ShareIcon from '@mui/icons-material/Share';
import GitHubIcon from '@mui/icons-material/GitHub';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import StopCircleIcon from '@mui/icons-material/StopCircle';
// import FullscreenIcon from '@mui/icons-material/Fullscreen';
// import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';


const CustomSpeedDial = styled(SpeedDial)(({ theme }) => ({
    position: 'absolute',
    '&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft': {
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
    '&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight': {
      top: theme.spacing(2),
      left: theme.spacing(2),
    },
}));



const StyledSpeedDial = ({ isPanelOpen, togglePanel, handleToggleNodeStatusAll, openDialog, setOpenDialog, connectNodes, 
    setConnectNodes, connectNodePrevious, setOpenNodeCreationDialog }) => {

    const handleConnectNodes = () => {
        setConnectNodes(!connectNodes);
        if (!connectNodes) {
            connectNodePrevious.current = null;
        }
    };

    const actions = [
        { icon: <WebStoriesIcon style={{color: isPanelOpen ? '#1976D2' : 'gray'}} />, name: 'Open Side Panel', onClick: togglePanel },
        { 
            icon: <ShareIcon style={{color: connectNodes ? '#1976D2' : 'gray'}} />, 
            name: 'Connect Nodes', 
            onClick: handleConnectNodes,
        },
        { icon: <AddIcon />, name: 'Add Node', onClick: () => { setOpenNodeCreationDialog(true) } },
        // { icon: <FullscreenIcon />, name: (fullScreen ? 'Exit Full Screen' : 'Enter Full Screen') , onClick: (fullScreen ? exitFullScreen : enterFullScreen)},
        { icon: <StopCircleIcon />, name: 'Stop All Nodes', onClick: () => { handleToggleNodeStatusAll(false) } },
        { icon: <PlayCircleFilledWhiteIcon />, name: 'Start All Nodes', onClick: () => { handleToggleNodeStatusAll(true) }},
        { icon: <GitHubIcon />, name: 'GitHub', onClick: () => {window.open("https://github.com/awkyu/AsyncAgents/tree/main")} },
        { icon: <InfoIcon style={{color: openDialog ? '#1976D2' : 'gray'}} />, name: 'What is this?', onClick: () => { setOpenDialog(true) } },
    ];  

return (
    <CustomSpeedDial
        ariaLabel="SpeedDial playground example"
        icon={<SpeedDialIcon />}
        direction={'left'}
    >
        {actions.map((action) => (
            <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
            // tooltipOpen={true}
            open={true}
            />
        ))}
    </CustomSpeedDial>
);
}


export default StyledSpeedDial;