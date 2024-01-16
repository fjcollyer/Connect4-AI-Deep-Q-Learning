import './style.css'
import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'

// Local imports
import LoadingScreen from './LoadingScreen.jsx'
import Experience from './Experience.jsx'
import useStore from './store/store.js'

// Importing SVGs
// import MuteIcon from './svgs/mute.svg';
// import UnmuteIcon from './svgs/unmute.svg';

// Audio
const music = new Audio('./audio/background.mp3');
music.volume = 0.2;
music.loop = true;

export default function App() {
  // Global state
  const setStartPressed = useStore(state => state.setStartPressed);
  const muted = useStore(state => state.muted);
  const setMuted = useStore(state => state.setMuted);

  // Loading screen stuff
  const [start, setStart] = useState(false);
  useEffect(() => {
    if (start) {
      music.play();
      setStartPressed(true);
    }
  }, [start]);

  // FOV stuff
  const [fov, setFov] = useState(45);
  useEffect(() => {
    if (window.innerWidth < 1200 && window.innerWidth > 1000) {
      setFov(55);
    } else if (window.innerWidth < 1000) {
      setFov(60);
    }
  }, []);

  // Mute button
  const toggleMute = () => {
    if (muted) {
      music.muted = false;
    } else {
      music.muted = true;
    }
    setMuted(!muted);
  }

  return <>
    <button className="mute-button" onClick={toggleMute}>
      {muted ? <img src="/svgs/mute.svg" alt="Unmute" className="svg-icon" />
        : <img src="/svgs/unmute.svg" alt="Mute" className="svg-icon" />}
    </button>

    <Canvas
      className="r3f"
      camera={{
        fov: fov,
        near: 0.1,
        far: 200,
        position: [0, 2.7, 10]
      }}
    >
      <Suspense fallback={null}>
        <Experience />
      </Suspense>
    </Canvas>
    <LoadingScreen started={start} onStarted={() => setStart(true)} />
  </>
}