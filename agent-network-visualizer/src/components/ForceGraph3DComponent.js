import '../App.css';

import React, { useRef, useEffect, useState } from 'react';
import { ForceGraph3D } from 'react-force-graph';
import * as THREE from 'three';
// import { UnrealBloomPass } from '//unpkg.com/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';


const ForceGraph3DComponent = ({ graphData, nodeRunning, getNodeChatLog=()=>{}, getLinkConversation=()=>{}, 
    selectedNode, selectedLink, incomingMessages, setIncomingMessages, updateGraphLinks, setNodeLinkNull, 
    selectedFocusedNode, connectNodes, connectNodePrevious, connectNodesHandler }) => {
    const fgRef = useRef(); // Create a ref

    const [linkUnread, setLinkUnread] = useState({});
    const linkRef = useRef({});
    const nodeRef = useRef({});

    function onWindowResize(){
        if (!fgRef.current) return;
        const camera = fgRef.current.camera();
        const renderer = fgRef.current.renderer();

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    
        renderer.setSize( window.innerWidth, window.innerHeight );
    
    }

    window.addEventListener( 'resize', onWindowResize, false );

    useEffect(() => {
        if (!fgRef.current) return;

        const darkMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );
        const materials = {};
    
        const fragmentShader = `
            uniform sampler2D baseTexture;
            uniform sampler2D bloomTexture;
            varying vec2 vUv;
            void main() {
                gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
            }
        `;
    
        const vertexShader = `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
        `;
    
        const BLOOM_SCENE = 1;
    
        const bloomLayer = new THREE.Layers();
        bloomLayer.set( BLOOM_SCENE );
    
        const params = {
            threshold: 0,
            strength: 0.8,
            radius: 0.3,
            exposure: 1
        };

        // Access to the internal Three.js objects
        const fg = fgRef.current;
        const scene = fg.scene();
        const camera = fg.camera();
        const renderer = fg.renderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.toneMapping = THREE.ReinhardToneMapping;
        // document.body.appendChild( renderer.domElement );
        const renderScene = new RenderPass( scene, camera );

        const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
        bloomPass.threshold = params.threshold;
        bloomPass.strength = params.strength;
        bloomPass.radius = params.radius;

        const bloomComposer = new EffectComposer( renderer );
        bloomComposer.renderToScreen = false;
        bloomComposer.addPass( renderScene );
        bloomComposer.addPass( bloomPass );

        const mixPass = new ShaderPass(
            new THREE.ShaderMaterial( {
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: bloomComposer.renderTarget2.texture }
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                defines: {}
            } ), 'baseTexture'
        );
        mixPass.needsSwap = true;
        const outputPass = new OutputPass();

        const finalComposer = new EffectComposer( renderer );
        finalComposer.addPass( renderScene );
        finalComposer.addPass( mixPass );
        finalComposer.addPass( outputPass );
    
    function render() {
        const selectedNodeObject = selectedNode ? scene.getObjectByName(selectedNode) : null;
        const selectedLinkObject = selectedLink[0] ? scene.getObjectByName(`${selectedLink[0]}_${selectedLink[1]}`) : null;

        scene.traverse(obj => {
            obj.layers.disable(BLOOM_SCENE);
            
        });

        if (selectedLinkObject) {
            selectedLinkObject.layers.enable(BLOOM_SCENE);
        } else if (selectedNodeObject) {
            selectedNodeObject.layers.enable(BLOOM_SCENE);
        }

        scene.traverse( darkenNonBloomed );
        bloomComposer.render();
        scene.traverse( restoreMaterial );
        // render the entire scene, then render bloom scene on top
        finalComposer.render();
    }
    
    function darkenNonBloomed( obj ) {
        if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {
            materials[ obj.uuid ] = obj.material;
            obj.material = darkMaterial;
        }
    }
    
    function restoreMaterial( obj ) {
        if ( materials[ obj.uuid ] ) {
            obj.material = materials[ obj.uuid ];
            delete materials[ obj.uuid ];
        }
    }
    
    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    animate();
    }, [fgRef, selectedLink, selectedNode]); // Run effect when fgRef is assigned

    useEffect(() => {
        setIncomingMessages((incomingMessages) => {
            // // Logic to change linkUnread to true if incoming messages correspond to that link
            // if (incomingMessages) {
            //     // Iterate through the incoming messages
            //     incomingMessages.forEach(message => {
            //         console.log(message);
            //         // Check if the message corresponds to a link
            //         const linkId = `${message.sender}_${message.recipient}`;
            //         setLinkUnread((linkUnread) => {return { ...linkUnread, [linkId]: true }});
            //     });
            // }

            if (!fgRef.current) return;

            // console.log(incomingMessages);
            if (incomingMessages) {
                incomingMessages.forEach(message => {
                    const linkId = `${message.sender}_${message.recipient}`;
                    // console.log(linkId, linkRef, linkRef.current[linkId]);
                    fgRef.current.emitParticle(linkRef.current[linkId])
                });
            }

            // Clear the incoming messages
            return [];
        });

    }, [updateGraphLinks, setIncomingMessages, linkRef]);

    useEffect(() => {
        if (incomingMessages) {
            // Iterate through the incoming messages
            incomingMessages.forEach(message => {
                // console.log(message);
                // Check if the message corresponds to a link
                const linkId = `${message.sender}_${message.recipient}`;
                setLinkUnread((linkUnread) => {return { ...linkUnread, [linkId]: true }});
            });
        }
    }, [incomingMessages])
    
    useEffect(() => {
        if (!fgRef.current || !selectedFocusedNode || !nodeRef.current || !nodeRef.current[selectedFocusedNode]) return;

        const node = nodeRef.current[selectedFocusedNode];
        // Aim at node from outside it
        const distance = 120;
        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

        fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
        );

    }, [selectedFocusedNode])

    return (
        <ForceGraph3D className="scroll-hidden"
            ref={fgRef} // Assign the ref to the ForceGraph3D component
            width={window.innerWidth}
            height={window.innerHeight}
            backgroundColor="#000003"
            graphData={graphData}
            linkColor={(link) => {
                link.__lineObj.name = link.id;
                linkRef.current[link.id] = link;
                if (linkUnread[link.id]) {
                    return '#C98CA7'; // Change to bright green color
                } else {
                    return '#ffffff';
                }
            }}
            linkCurvature="curvature"
            linkCurveRotation={(d) => d.rotation ? d.rotation : 0}
            // linkDirectionalParticles={5}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={0.01}
            linkDirectionalParticleColor={() => '#C98CA7'}

            linkWidth={1}
            // 3D-specific props and callbacks
            nodeLabel="id"
            nodeAutoColorBy="type"
            nodeThreeObject={(node) => {
                nodeRef.current[node.id] = node;
                const originalColor = node.color;
                var mesh = new THREE.Mesh(
                    new THREE.SphereGeometry(3, 30, 30),
                    new THREE.MeshBasicMaterial({ color: node.type === 'User' ? '#52AA5E' : '#42F2F7', transparent: true, opacity: nodeRunning[node.id] ? 0.9: 0.05 })
                )
                if (node.type !== 'User') {
                    // var ai_type_mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 30, 30),
                    //     new THREE.MeshBasicMaterial({ color: originalColor, transparent: true, opacity: 1 }))
                    // var ai_type_mesh2 = new THREE.Mesh(new THREE.SphereGeometry(1, 30, 30),
                    //     new THREE.MeshBasicMaterial({ color: originalColor, transparent: true, opacity: 1 }))
                    // ai_type_mesh.position.y = 3;
                    // ai_type_mesh2.position.y = -3;
                    // mesh.add(ai_type_mesh);
                    // mesh.add(ai_type_mesh2);

                    var ai_type_mesh = new THREE.Mesh(new THREE.TorusGeometry( 3, 1, 16, 100 ),
                        new THREE.MeshBasicMaterial({ color: originalColor, transparent: true, opacity: 0.8 }))
                    // var ai_type_mesh2 = new THREE.Mesh(new THREE.TorusGeometry( 3, 1, 16, 100 ),
                    //     new THREE.MeshBasicMaterial({ color: originalColor, transparent: true, opacity: 0.7 }))
                    // ai_type_mesh.rotateY(Math.PI / 2);
                    mesh.add(ai_type_mesh);
                    // mesh.add(ai_type_mesh2);
                }
                mesh.name = node.id;
                return mesh;
            }}
            linkDirectionalArrowLength={4}
            linkDirectionalArrowRelPos={1}
            linkDirectionalArrowResolution={4}

            linkLabel={(link) => {

                return `${link.source.id} > ${link.target.id}`
            }}      
            onLinkClick={(link) => {
                getLinkConversation(link.source.id, link.target.id);
                setLinkUnread({ ...linkUnread, [link.id]: false });
                // console.log(link);
            }}  
            onNodeClick={(node) => {
                getNodeChatLog(node.id);
                if (connectNodes) {
                    if (connectNodePrevious.current) {
                        connectNodesHandler(connectNodePrevious.current, node.id);
                        connectNodePrevious.current = null;
                    } else {
                        connectNodePrevious.current = node.id;
                    }
                }
            }}            
            onBackgroundClick={setNodeLinkNull}
        />
    );
};

export default ForceGraph3DComponent;






