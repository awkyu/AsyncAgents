import '../App.css';

import React, { useState } from 'react';

const NameTag = ({ selectedNode }) => {
    const [hovered, setHovered] = useState(false);

    const handleMouseEnter = () => {
        setHovered(true);
    };

    const handleMouseLeave = () => {
        setHovered(false);
    };

    return (
        <div
            className={'scroll-hidden'}
            style={hovered ? {
                backgroundColor: '#007aff',
                color: 'white',
                padding: '8px 10px',
                // borderRadius: '10px',
                overflow: 'auto',
                display: 'inline-block',
                whiteSpace: 'nowrap',
                maxWidth: '95%',
                lineHeight: '1.4',
                borderRadius: '18px',
                marginBottom: '0px',
            } : {
                backgroundColor: '#007aff',
                color: 'white',
                padding: '8px 10px',
                // borderRadius: '10px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                // maxWidth: '95%',
                lineHeight: '1.4',
                borderRadius: '18px',
                marginBottom: '0px',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* {hovered ? selectedNode : selectedNode.substring(0, 10) + '...'} */}
            {selectedNode}
        </div>
    );
};

export default NameTag;
