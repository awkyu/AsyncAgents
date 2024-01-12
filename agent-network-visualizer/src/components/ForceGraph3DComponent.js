import '../App.css';

import React, { useRef, useEffect } from 'react';
import { ForceGraph3D } from 'react-force-graph';
import * as THREE from 'three';
// import { UnrealBloomPass } from '//unpkg.com/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import Stats from "three/examples/jsm/libs/stats.module.js";


const ForceGraph3DComponent = ({ graphData, getNodeChatLog=()=>{}, getLinkConversation=()=>{}, selectedNode, selectedLink }) => {
    const fgRef = useRef(); // Create a ref

    useEffect(() => {
        if (!fgRef.current) return;
        const bloomPass = new UnrealBloomPass();
        bloomPass.strength = 0.25;
        bloomPass.radius = 0.4;
        bloomPass.threshold = 0.1;
        fgRef.current.postProcessingComposer().addPass(bloomPass);
    }, []);

    return (
        <ForceGraph3D className="scroll-hidden"
            ref={fgRef} // Assign the ref to the ForceGraph3D component
            backgroundColor="#000003"
            graphData={graphData}
            linkColor={(link) => {
                if (link.source.id === selectedLink[0] && link.target.id === selectedLink[1]) {
                    return 0x00ffff;
                } else {
                    return 0xffffff;
                }
            }}
            linkCurvature="curvature"
            linkCurveRotation={(d) => d.rotation ? d.rotation : 0}
            linkWidth={(link) => {
                if (link.source.id === selectedLink[0] && link.target.id === selectedLink[1]) {
                    return 3;
                } else {
                    return 1.5;
                }}
            }
            // 3D-specific props and callbacks
            nodeLabel="id"
            nodeAutoColorBy="type"
            nodeThreeObject={(node) => {
                var mesh = new THREE.Mesh(
                    node.type === 'user' ? new THREE.OctahedronGeometry(8, 0) : new THREE.SphereGeometry(5, 10, 10),
                    // node.type === 'user' ? new THREE.BoxGeometry( 10, 10, 10, ) : new THREE.SphereGeometry(5, 10, 10),
                    new THREE.MeshBasicMaterial({ color: node.color, transparent: true, opacity: 0.8 })
                )
                if (node.id === selectedNode) {
                    // wireframe
                    var geo = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry
                    var mat = new THREE.LineBasicMaterial( { color: 0x00fffff } ); 
                    var wireframe = new THREE.LineSegments( geo, mat );
                    wireframe.scale.multiplyScalar(1.2);
                    wireframe.name = node.id+"_wireframe";
                    mesh.add( wireframe );
                } 
                if (node.type === 'user') {
                    // wireframe
                    var geo = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry
                    var mat = new THREE.LineBasicMaterial( { color: 0x000000 } );
                    var wireframe = new THREE.LineSegments( geo, mat );
                    wireframe.name = node.id+"_wireframe";
                    mesh.add( wireframe );
                }

                // // wireframe
                // var geo = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry
                // var mat = new THREE.LineBasicMaterial( { color: node.id === selectedNode ? 0xffffff : 0x000000 } );
                // var wireframe = new THREE.LineSegments( geo, mat );
                // wireframe.name = node.id+"_wireframe";
                // mesh.add( wireframe );

                mesh.name = node.id;
                return mesh;
            }}
            linkDirectionalArrowLength={10}
            linkDirectionalArrowRelPos={1}
            linkLabel={(link) => (
                `${link.source.id} > ${link.target.id}`
            )}      
            onLinkClick={(link) => {
                link.__lineObj.name = link.id;
                getLinkConversation(link.source.id, link.target.id);
                console.log(link);
            }}  
            onNodeClick={(node) => {
                getNodeChatLog(node.id);
            }}
            // Additional 3D properties like nodeThreeObject, linkWidth, etc.
            
        />
    );
};

export default ForceGraph3DComponent;






