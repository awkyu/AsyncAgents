const PanelToggleButton = ({ onClick }) => {
    return (
        <button onClick={onClick} style={{
            position: 'fixed',
            right: '20px',
            bottom: '20px',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            textAlign: 'center',
            lineHeight: '50px', // To center the "i" vertically
            border: 'none',
            background: '#007aff',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer'
        }}>
            {"i"}
        </button>
    );
};

export default PanelToggleButton;