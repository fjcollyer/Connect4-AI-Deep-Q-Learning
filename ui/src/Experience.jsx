import { PresentationControls, Environment, Cylinder } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { useRef, useEffect, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'

// Local imports
import useStore from './store/store.js'
import Robot from './components/Robot.jsx'
import Connect4Board from './components/Connect4board.jsx'
import Island from './components/Island.jsx'
import Game from './Game';
import Screen from './components//screen/Screen.jsx';
import Twitter from './components/Twitter.jsx'
import Linkedin from './components/Linkedin.jsx'
import Github from './components/Github.jsx'
import Skybox from './components/Skybox.jsx'

export default function Experience() {
    //
    // Global states
    //
    const debugMode = useStore(state => state.debugMode);
    const startPressed = useStore(state => state.startPressed);
    const introDone = useStore(state => state.introDone);
    const setRobotAnimation = useStore(state => state.setRobotAnimation);
    const usersTurn = useStore(state => state.usersTurn);
    const setUsersTurn = useStore(state => state.setUsersTurn);
    const winner = useStore(state => state.winner);
    const setWinner = useStore(state => state.setWinner);
    const restartGame = useStore(state => state.restartGame);
    const setRestartGame = useStore(state => state.setRestartGame);

    //
    // Refs
    //
    const { camera } = useThree();
    const robotRef = useRef();
    const screenRef = useRef();

    //
    // Local states
    //
    const [cameraTargetPosition, setCameraTargetPosition] = useState(new THREE.Vector3(0, 0.6, 6));
    const [cameraLookAtTargetPosition, setCameraLookAtTargetPosition] = useState(new THREE.Vector3(0.6, 0, 0));
    const [cameraLookAtCurrentPosition, setCameraLookAtCurrentPosition] = useState(new THREE.Vector3(0, 0, 0));
    const [robotTargetPosition, setRobotTargetPosition] = useState(new THREE.Vector3(0, 0, 0));
    const [robotTargetRotation, setRobotTargetRotation] = useState(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)));
    const [screenTargetPosition, setScreenTargetPosition] = useState(new THREE.Vector3(1.8, 3, 2));
    const [screenTargetRotation, setScreenTargetRotation] = useState(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)));


    //
    // On mount
    //
    useEffect(() => {
        makeAIMove();
    }, []);

    //
    // On intro done
    //
    useEffect(() => {
        if (introDone) {
            // Camera
            setCameraTargetPosition(new THREE.Vector3(-0.5, 2.7, 9));
            setCameraLookAtTargetPosition(new THREE.Vector3(-0.4, 0, 0));

            // Robot
            setRobotTargetPosition(new THREE.Vector3(-0.2, 0, 0.3));
            setRobotTargetRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)));
            setRobotAnimation("walking");
            setTimeout(() => {
                setRobotAnimation("iddle");
            }, 5000);

            // Screen
            setScreenTargetPosition(new THREE.Vector3(-4, 5.8, 0));
            setScreenTargetRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 4, 0)));
        }
    }, [introDone]);

    //
    // On restart game
    //
    useEffect(() => {
        if (restartGame) {
            setRestartGame(false);
            game.board = game.recreateBoard();
            // Remove all cylinders
            setCylinders([]);
            // Reset users turn
            setUsersTurn(true);
            setWinner(false);
        }
    }, [restartGame]);

    // 
    // Objects move towards their target positions and rotations
    //
    let lastFrameTime = Date.now();
    useFrame(() => {
        if (!startPressed) {
            return;
        }
        const currentFrameTime = Date.now();
        const deltaTime = (currentFrameTime - lastFrameTime) / 1000;
        lastFrameTime = currentFrameTime;
        const changeFactor = deltaTime / 1.2

        // Camera
        if (camera) {
            camera.position.lerp(cameraTargetPosition, changeFactor);
            // use the current camera look at and the target camera look at to then use lerp
            const newLookAt = new THREE.Vector3();
            newLookAt.lerpVectors(cameraLookAtCurrentPosition, cameraLookAtTargetPosition, changeFactor);
            camera.lookAt(newLookAt);
            setCameraLookAtCurrentPosition(newLookAt);
        }

        //Robot
        if (robotRef.current) {
            robotRef.current.position.lerp(robotTargetPosition, changeFactor);
            robotRef.current.quaternion.slerp(robotTargetRotation, changeFactor);
        }
        // Screen
        if (screenRef.current) {
            screenRef.current.position.lerp(screenTargetPosition, changeFactor);
            screenRef.current.quaternion.slerp(screenTargetRotation, changeFactor);
        }
    });

    //
    // Game logic
    //
    const [game, setGame] = useState(() => new Game());
    const [cylinders, setCylinders] = useState([]);
    const basePosition = { x: -1.05, y: 3, z: -1.2 };
    const handleClickConnect4 = (e) => {
        e.stopPropagation();

        if (!introDone) {
            return;
        }

        if (!usersTurn) {
            return;
        } else {
            setUsersTurn(false);
        }

        const mesh = e.eventObject;
        const meshName = mesh.name;

        // Extracting column number from the mesh name (e.g., "connect4Background1")
        const columnNumber = parseInt(meshName[meshName.length - 1])

        // Check if the user made a valid move
        const validMove = game.makeUserMove(columnNumber)
        if (validMove === false) {
            console.log("Invalid move from user!");
            setUsersTurn(true);
            return;
        } else {
            // Calculate the new position based on the column number and put it in the scene
            if (!isNaN(columnNumber)) {
                // Calculate the new position based on the column number
                const newPosition = {
                    x: basePosition.x + (columnNumber * 0.41),
                    y: basePosition.y, // Initial y position
                    z: basePosition.z
                };
                // Add the new cylinder to the state
                setCylinders(cylinders => [...cylinders, {
                    position: [newPosition.x, newPosition.y, newPosition.z],
                    color: 'yellow'
                }]);

            }
        }
        // Check if the user won or if it's a draw
        const didUserWin = game.checkWin(game.board)
        if (didUserWin) {
            setWinner("user");
            game.recreateBoard();
            return;
        }
        const didDraw = game.checkDraw(game.board)
        if (didDraw) {
            setWinner("draw");
            game.recreateBoard();
            return;
        }


        // Then make the AI move after a 1 second delay
        makeAIMove();
    };

    const makeAIMove = () => {
        setTimeout(async () => {
            try {
                const aiMoveColumn = await game.makeAIMove();
                if (aiMoveColumn === false) {
                    console.log("Invalid move from AI!");
                    return;
                } else {
                    // Calculate the new position based on the column number and put it in the scene
                    if (!isNaN(aiMoveColumn)) {
                        // Calculate the new position based on the column number
                        const newPosition = {
                            x: basePosition.x + (aiMoveColumn * 0.41),
                            y: basePosition.y,
                            z: basePosition.z
                        };
                        // Add the new cylinder to the state
                        setCylinders(cylinders => [...cylinders, {
                            position: [newPosition.x, newPosition.y, newPosition.z],
                            color: 'red'
                        }]);
                    }
                }
                // Check if the AI won or if it's a draw
                const didAIWin = game.checkWin(game.board)
                if (didAIWin) {
                    setWinner("ai");
                    game.recreateBoard();
                    return;
                }
                const didDraw2 = game.checkDraw(game.board)
                if (didDraw2) {
                    setWinner("draw");
                    game.recreateBoard();
                    return;
                }
                setTimeout(() => {
                    setUsersTurn(true);
                }, 500);
            } catch (error) {
                console.log("Error making AI move!, error: ", error);
            }
        }, 500);
    }

    return <>

        {/* Stats */}
        {debugMode && <Perf position="top-left" />}

        {/* Effects */}
        <EffectComposer disableNormalPass>
            <Bloom
                mipmapBlur
                intensity={0.05}
            />
        </EffectComposer>

        {/* Lighing */}
        <Environment preset="city" />
        <ambientLight intensity={2} />

        <PresentationControls
            global
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 8, Math.PI / 8]} // Full vertical rotation
            azimuth={[-Math.PI / 4, Math.PI / 4]} // Full horizontal rotation
            config={{ mass: 2, tension: 400 }}
            snap={{ mass: 4, tension: 400 }}
        >
            <Physics debug={debugMode} gravity={[0, -9.81, 0]}>
                {/* Test Objects */}
                {cylinders.map((cylinder, index) => (
                    <RigidBody key={index} type="dynamic" colliders="cuboid">
                        <Cylinder
                            args={[0.167, 0.167, 0.13]}
                            rotation={[Math.PI / 2, 0, 0]}
                            position={cylinder.position}
                            material-color={cylinder.color}
                        />
                    </RigidBody>
                ))}

                {/* Objects */}
                <group
                    scale={[0.6, 0.6, 0.6]}
                    position={[0, -1, 0]}
                >
                    {/* Skybox */}
                    <Skybox
                        position={[0, -30, 100]}
                        rotation={[Math.PI / 2, 0, 0.6]}
                    />

                    {/* Robot */}
                    <group ref={robotRef}>
                        <Robot />
                    </group>

                    {/* Screen */}
                    <group ref={screenRef}
                        position={[4, 5, 2]}
                    >
                        <Screen />
                    </group>

                    <Connect4Board
                        scale={[0.04, 0.04, 0.04]}
                        rotation={[Math.PI / 2, 0, 0]}
                        position={[0.3, 4.38, - 2]}
                        onClick={handleClickConnect4}
                    />

                    <Island
                        scale={[0.007, 0.007, 0.007]}
                        rotation={[Math.PI * 3 / 2, 0, 0]}
                        position={[0, 0, 0]}
                    />
                    {/* Physics to mimic island floor */}
                    <RigidBody type="fixed" colliders="cuboid">
                        <CuboidCollider args={[5, 0.1, 5]}
                            position={[0, -0.08, 0]}
                        />
                    </RigidBody>

                    {/* Social media icons */}
                    <Twitter
                        onClick={() => window.open("https://twitter.com/fjcollyer", "_blank")}
                        scale={[0.2, 0.2, 0.2]}
                        position={[-0.8, 0.1, 2.9]}
                        rotation={[-Math.PI / 6, -Math.PI / 6, -Math.PI / 8]}
                    />
                    <Github
                        onClick={() => window.open("https://github.com/fjcollyer", "_blank")}
                        scale={[0.2, 0.2, 0.2]}
                        position={[-1.9, -0.05, 3.4]}
                        rotation={[-Math.PI / 4, Math.PI / 4, 0.4]}
                    />
                    <Linkedin
                        onClick={() => window.open("https://www.linkedin.com/in/fjcollyer/", "_blank")}
                        scale={[0.32, 0.32, 0.32]}
                        position={[0.3, 0.1, 3.82]}
                        rotation={[-Math.PI / 6, 0, 0]}
                    />
                </group>
            </Physics >
        </PresentationControls >
    </>
}