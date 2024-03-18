import './style.css'
import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
import { Analytics } from "@vercel/analytics/react"

// Local imports
import LoadingScreen from './LoadingScreen.jsx'
import Experience from './Experience.jsx'
import useStore from './store/store.js'

// Audio
const music = new Audio('./audio/background.mp3');
music.volume = 0.2;
music.loop = true;


export default function App() {
  // Global state
  const setStartPressed = useStore(state => state.setStartPressed);
  const muted = useStore(state => state.muted);
  const setMuted = useStore(state => state.setMuted);
  const setDebugMode = useStore(state => state.setDebugMode);

  // Debug mode
  useEffect(() => {
    const handleHashChange = () => {
      setDebugMode(window.location.hash === '#debug');
      console.log('Debug mode:', window.location.hash === '#debug');
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

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
    <Analytics />

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