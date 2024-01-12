import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';


const ConnectNodesAlert = ({ open, connectNodePrevious }) => {

    return (
        <Collapse in={open}>
            <Alert variant="filled" severity="info" open={open}
                sx={{ mb: 2, position: 'absolute', top: '20px', left: "35%", right: "35%", color: '#ffffff', backgroundColor: '#1976D2' }}
            >
                {`Select two nodes to connect them! ${connectNodePrevious.current ? `First node selected: ${connectNodePrevious.current}` : ''}`}
            </Alert>
        </Collapse>
    );
}


export default ConnectNodesAlert;