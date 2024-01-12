import React from 'react';
import { ForceGraph2D } from 'react-force-graph';

const ForceGraph2DComponent = ({ graphData }) => {
    return (
        <ForceGraph2D
            graphData={graphData}
            // Add additional props and callbacks here
            nodeLabel="id"
            linkDirectionalArrowLength={6}
            linkDirectionalArrowRelPos={1}
            nodeAutoColorBy="group"
        />
    );
};

export default ForceGraph2DComponent;
