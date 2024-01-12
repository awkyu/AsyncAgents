import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';

import { 
    Button, Dialog, ListItemText, ListItem, List, Divider, NativeSelect,
    AppBar, Toolbar, IconButton, Typography, MenuItem, InputLabel,
    Slide, Box, Stepper, Step, StepLabel, FormControl, Select, InputBase,
    TextField, Alert, Snackbar,
} from '@mui/material';

import AdbIcon from '@mui/icons-material/Adb';
import ArticleIcon from '@mui/icons-material/Article';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';


const steps = ['Select Agent Base', 'Customize the Agent', 'Create Agent'];

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
        zIndex: 1,
        color: '#fff',
        width: 50,
        height: 50,
        display: 'flex',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        ...(ownerState.active && {
        backgroundImage:
            'linear-gradient( 136deg, #C98CA7 25%, #101935 100%)',
            // 'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
        }),
        ...(ownerState.completed && {
        backgroundImage:
            // 'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
            'linear-gradient( 136deg, #1976D2 25%, #101935 100%)',
        }),
    }));

  
function ColorlibStepIcon(props) {
    const { active, completed, className } = props;
  
    const icons = {
      1: <AdbIcon />,
      2: <ArticleIcon />,
      3: <AddCircleIcon />,
    };
  
    return (
      <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
        {icons[String(props.icon)]}
      </ColorlibStepIconRoot>
    );
  }
  
  ColorlibStepIcon.propTypes = {
    /**
     * Whether this step is active.
     * @default false
     */
    active: PropTypes.bool,
    className: PropTypes.string,
    /**
     * Mark the step as completed. Is passed to child components.
     * @default false
     */
    completed: PropTypes.bool,
    /**
     * The label displayed in the step icon.
     */
    icon: PropTypes.node,
  };

function HorizontalLinearStepper({ activeStep }) {
    
    return (
        <Stepper activeStep={activeStep} sx={{
            background: 'transparent',
            color: 'black',
            padding: '0px',
            margin: '0px',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        
        }}>
            {steps.map((label, index) => {
                const stepProps = {};
                const labelProps = {};

                if (index === activeStep) {
                    stepProps.active = true;
                }
                return (
                    <Step key={label} {...stepProps} >
                        <StepLabel StepIconComponent={ColorlibStepIcon} ><Typography sx={{color: '#ffffff'}}>{label}</Typography></StepLabel>
                    </Step>
                );
            })}
        </Stepper>
    );
}


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function NodeCreationDialog({ open, setOpen, availableAgentBases, handleNodeCreation, agentBaseParams,
    editNode, setEditNode, editNodeParams, handleEditNode, 
}) {
    // const [open, setOpen] = React.useState(false);
    const [activeStep, setActiveStep] = React.useState(0);

    const [agentBase, setAgentBase] = React.useState('');
    const [agentParams, setAgentParams] = React.useState({});
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [prompt, setPrompt] = React.useState('');

    const [snackbar0Open, setSnackbar0Open] = React.useState(false);
    const [snackbar1Open, setSnackbar1Open] = React.useState(false);


    React.useEffect (() => {
        if (agentBase !== '' && !editNode) {
            setAgentParams(agentBaseParams[agentBase]);
            setName(agentBaseParams[agentBase].name)
            setPrompt(agentBaseParams[agentBase].system_prompt)
            setDescription(agentBaseParams[agentBase].description)
        }
    }, [agentBase]);

    React.useEffect (() => {
        if (editNode) {
            setActiveStep(1);
            setAgentBase(editNodeParams.base);
            setName(editNodeParams.name);
            setDescription(editNodeParams.description);
            setPrompt(editNodeParams.prompt);
        }
    }, [editNode, editNodeParams]);

    const handleNextButton = () => { 
        console.log(activeStep)
        // if (activeStep === steps.length - 1) {
        //     setActiveStep(activeStep);
        //     return
        // }
        if (activeStep === 0 && agentBase === '') {
            setSnackbar0Open(true);
            setActiveStep(activeStep);
            return
        }
        if (activeStep === 1 && agentBase !== 'User' && (name === '' || description === '' || prompt === '')) {
            setSnackbar1Open(true);
            setActiveStep(activeStep);
            return
        }
        if (activeStep === 2) {
            if (editNode) {
                console.log("Editing Node")
                handleEditNode(editNodeParams.id, agentBase, name, description, prompt);
            } else {
                console.log("Creating Node")
                handleNodeCreation(agentBase, name, description, prompt);
            }

            setOpen(false);
            setActiveStep(0);
            setAgentBase('');
            setAgentParams({});
            setName('');
            setDescription('');
            setPrompt('');
            return
        }

        setActiveStep(activeStep + 1);
    }

    const handleBackButton = () => {
        setActiveStep((activeStep) => {
            if (activeStep === 0) return activeStep;
            if (activeStep === 1 && editNode) return activeStep;
            return activeStep - 1
        });
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditNode(false);
        setActiveStep(0);
        setAgentBase('');
        setAgentParams({});
        setName('');
        setDescription('');
        setPrompt('');
    };

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={handleClose}
            TransitionComponent={Transition}
        >
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton
                    edge="start"
                    color="inherit"
                    onClick={handleClose}
                    aria-label="close"
                    >
                    <CloseIcon />
                    </IconButton>
                    <HorizontalLinearStepper activeStep={activeStep} />
                    {/* <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                    Sound
                    </Typography>
                    <Button autoFocus color="inherit" onClick={handleClose}>
                    save
                    </Button> */}
                </Toolbar>
            </AppBar>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                // flexDirection: 'row',
                // justifyContent: 'space-between',
                // alignItems: 'center',
                padding: '5%',
                backgroundColor: '#333333',
                height: '100%',
                margin: '0px',
            }}>
                <div style={{
                    width: '100%',
                    height: '90%',
                }}>
                    {activeStep === 0 ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '100%',
                            height: '100%',
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: '50%',
                                marginRight: '10px',
                                marginTop: '10%',
                            }}>
                                <Typography sx={{color: '#ffffff', marginBottom: '10px'}} align={'left'}>Select an Agent Base to Instantiate</Typography>
                                <Typography sx={{color: '#ffffff', marginBottom: '10px'}} align={'left'} variant='caption'>Users have no customization and are just proxies for interaction. All other agents are AI agents.</Typography>
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: '50%',
                                marginLeft: '10px',
                                marginTop: '10%',
                            }}>
                                <FormControl sx={{ m: 1 }} variant="standard">
                                    <InputLabel id="agent-type-select">Agent Base</InputLabel>
                                    <Select
                                        id="agent-type-select"
                                        value={agentBase}
                                        label="Agent Base"
                                        onChange={(e) => setAgentBase(e.target.value)}
                                        // input={<BootstrapInput />}
                                    >
                                        {/* <option aria-label="None" value="" /> */}
                                        {availableAgentBases.map((agentType, index) => {
                                            return (
                                                <MenuItem key={index} value={agentType}>{agentType}</MenuItem>
                                                // <option key={index} value={agentType}>{agentType}</option>
                                            )
                                        })}

                                    </Select>
                                </FormControl>
                            </div>
                            <Snackbar open={snackbar0Open} autoHideDuration={6000} onClose={() => setSnackbar0Open(false)}>
                                <Alert severity="error" sx={{ width: '100%' }}>
                                You must choose an Agent Base to continue.
                                </Alert>
                            </Snackbar>
                        </div>
                    ) : (activeStep === 1 ? (
                        <div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: '100%',
                                height: '100%',
                                overflow: 'auto',

                            }}>
                                <Typography sx={{color: '#ffffff' }} align={'left'}>Agent Name/Type</Typography>
                                <TextField
                                    // id="description"
                                    label="Name"
                                    variant="standard"
                                    multiline
                                    // focused
                                    maxRows={4}
                                    disabled={agentParams.name === 'User' || (editNode && name === 'User')}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <Typography sx={{color: '#ffffff', marginTop: '30px'}} align={'left'}>Agent Description</Typography>
                                <TextField
                                    // id="description"
                                    label="Description"
                                    variant="standard"
                                    multiline
                                    // focused
                                    maxRows={2}
                                    disabled={agentParams.description === null || (editNode && description === null)}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                <Typography sx={{color: '#ffffff', marginTop: '30px'}} align={'left'}>System Prompt</Typography>
                                <TextField
                                    // id="prompt"
                                    label="Prompt"
                                    multiline
                                    // focused
                                    maxRows={6}
                                    variant="standard"
                                    disabled={agentParams.system_prompt === null || (editNode && prompt === null)}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />
                            </div>
                            <Snackbar open={snackbar1Open} autoHideDuration={6000} onClose={() => setSnackbar1Open(false)}>
                                <Alert severity="error" sx={{ width: '100%' }}>
                                You must fill in all fields to continue.
                                </Alert>
                            </Snackbar>
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            height: '100%',
                        
                        }}>
                            <Typography sx={{color: '#ffffff', marginBottom: '10px'}} align={'left'}>Summary</Typography>
                            <Typography sx={{color: '#ffffff', marginBottom: '10px'}} align={'left'} variant='caption'>Agent Name/Type: {name}</Typography>
                            <Typography sx={{color: '#ffffff', marginBottom: '10px'}} align={'left'} variant='caption'>Agent Base: {agentBase}</Typography>
                            <Typography sx={{color: '#ffffff', marginBottom: '10px'}} align={'left'} variant='caption'>Description: {description}</Typography>
                            <Typography sx={{color: '#ffffff', marginBottom: '10px'}} align={'left'} variant='caption'>Prompt: {prompt}</Typography>
                        </div>
                    ))}


                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                    height: '10%',
                }}>
                    <Button sx={{
                        border: '1px solid #1976D2',
                        borderRadius: '10px',   
                                     
                    }}
                    disabled={activeStep === 0 || (activeStep === 1 && editNode)}
                    onClick={handleBackButton}
                    >
                        Back
                    </Button>
                    <Button sx={{
                        border: '1px solid #1976D2',
                        borderRadius: '10px',      
                    }}
                    onClick={handleNextButton}>
                        {activeStep === steps.length - 1 ? 'Create/Update' : 'Next'}
                    </Button>
                </div>

            </Box>

        </Dialog>
    );
}


export default NodeCreationDialog;