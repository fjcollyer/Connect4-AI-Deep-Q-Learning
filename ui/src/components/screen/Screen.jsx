import React, { useState, useEffect, useRef } from 'react'
import { Text } from '@react-three/drei'

// Local imports
import useStore from '../../store/store.js'
import ScreenModel from './ScreenModel.jsx'
import { useFrame } from '@react-three/fiber';

// Audio
const droneAudio = new Audio('./audio/drone.mp3');
droneAudio.volume = 0.035;
droneAudio.loop = true;

export default function Screen(props) {

  //
  // Global state
  // 
  const startPressed = useStore(state => state.startPressed);
  const introDone = useStore(state => state.introDone);
  const setIntroDone = useStore(state => state.setIntroDone);
  const usersTurn = useStore(state => state.usersTurn);
  const winner = useStore(state => state.winner);
  const setRestartGame = useStore(state => state.setRestartGame);
  const muted = useStore(state => state.muted);

  //
  // Refs
  // 
  const mainTextRef = useRef();
  const nextTextRef = useRef();

  //
  // Local state
  //
  const [mainTextSize, setMainTextSize] = useState(0.14);
  const [mainTextColor, setMainTextColor] = useState("cyan");
  const [nextTextSize, setNextTextSize] = useState(0.16);
  const [nextTextColor, setNextTextColor] = useState("white");

  const screenTexts = [
    "Hi, I am Connect4AI,\na Deep Q-Learning AI",
    "I trained by playing\n300,000 games\nagainst myself",
    "How to play:\n\nPress start then\nmake a move by\nclicking on the board",
  ]

  const [screenText, setScreenText] = useState({ text: screenTexts[0], index: 0 })
  const [nextText, setNextText] = useState("Next\n1 / " + screenTexts.length)

  const handleScreenTextChange = () => {

    if (!introDone) {
      if (screenText.index < screenTexts.length - 1) {
        const newIndex = screenText.index + 1;
        setScreenText({ text: screenTexts[newIndex], index: newIndex });

        if (newIndex === screenTexts.length - 1) {
          setNextText("Start");
        } else {
          setNextText("Next\n" + (newIndex + 1) + " / " + screenTexts.length);
        }
      } else {
        setScreenText({ text: "", index: screenTexts.length });
        setNextText("");
        setIntroDone(true);
      }
      return;
    }

    if (winner) {
      setScreenText({ text: "Restarting game...", index: screenTexts.length });
      setNextText("");
      setRestartGame(true);
      return;
    }
  }

  const handlePointerEnterNextText = (e) => {
    // set cursor to pointer
    setNextTextColor("cyan");
  }

  const handlePointerExitNextText = (e) => {
    // set cursor to default
    setNextTextColor("white");
  }

  //
  // On start pressed
  //
  useEffect(() => {
    if (!startPressed) {
      return;
    }
    if (!/iPhone/.test(navigator.userAgent)) {
      droneAudio.play();
    }
  }, [startPressed])

  //
  // On intro done
  // 
  useEffect(() => {
    if (!introDone) {
      return;
    }
    // Scale up text
    setMainTextSize(0.3);
    // Fade out drone audio
    const fadeOutInterval = setInterval(() => {
      droneAudio.volume -= 0.001; // Adjust the decrement rate as needed

      if (droneAudio.volume <= 0.001) {
        droneAudio.pause();
        clearInterval(fadeOutInterval);
      }
    }, 100);
  }, [introDone])

  //
  // On varios game state
  //
  useEffect(() => {
    if (!introDone) {
      return;
    }

    if (winner) {
      setNextText("RESTART");
      if (winner === "draw") {
        setScreenText({ text: "DRAW!", index: screenTexts.length + 1 });
        setMainTextColor("green");
      } else if (winner === "ai") {
        setScreenText({ text: "YOU LOSE!", index: screenTexts.length + 1 });
        setMainTextColor("red");
      } else if (winner === "user") {
        setScreenText({ text: "YOU WIN!", index: screenTexts.length + 1 });
        setMainTextColor("green");
      }
      return;
    }

    if (!winner) {
      setMainTextColor("cyan");
      setNextTextColor("white");
      setNextText("");
      if (usersTurn) {
        setScreenText({ text: "Your turn!", index: screenTexts.length + 1 });
      } else {
        setScreenText({ text: "AI thinking...", index: screenTexts.length + 1 });
      }
    }
  }, [usersTurn, introDone, winner])

  //
  // On muted
  // 
  useEffect(() => {
    if (muted) {
      droneAudio.muted = true;
    } else {
      droneAudio.muted = false;
    }
  }, [muted])


  //
  // Use frame to make next text pulse
  //
  const scaleIncrement = 0.0012; // Increase this for a faster pulsing effect
  const maxScale = 1.1;
  const minScale = 0.9;
  const maxScaleAfterIntro = 1.8;
  const minScaleAfterIntro = 1.6;
  const [growing, setGrowing] = useState(true);
  useFrame(() => {
    // Retrieve current scale
    const currentScaleX = nextTextRef.current.scale.x;
    const currentScaleY = nextTextRef.current.scale.y;

    // Update scale for both x and y
    if (growing) {
      if (introDone) {
        nextTextRef.current.scale.x = Math.min(currentScaleX + scaleIncrement, maxScaleAfterIntro);
        nextTextRef.current.scale.y = Math.min(currentScaleY + scaleIncrement, maxScaleAfterIntro);
        if (nextTextRef.current.scale.x >= maxScaleAfterIntro && nextTextRef.current.scale.y >= maxScaleAfterIntro) {
          setGrowing(false);
        }
      } else {
        nextTextRef.current.scale.x = Math.min(currentScaleX + scaleIncrement, maxScale);
        nextTextRef.current.scale.y = Math.min(currentScaleY + scaleIncrement, maxScale);
        if (nextTextRef.current.scale.x >= maxScale && nextTextRef.current.scale.y >= maxScale) {
          setGrowing(false);
        }
      }
    } else {
      if (introDone) {
        nextTextRef.current.scale.x = Math.max(currentScaleX - scaleIncrement, minScaleAfterIntro);
        nextTextRef.current.scale.y = Math.max(currentScaleY - scaleIncrement, minScaleAfterIntro);
        if (nextTextRef.current.scale.x <= minScaleAfterIntro && nextTextRef.current.scale.y <= minScaleAfterIntro) {
          setGrowing(true);
        }
      } else {
        nextTextRef.current.scale.x = Math.max(currentScaleX - scaleIncrement, minScale);
        nextTextRef.current.scale.y = Math.max(currentScaleY - scaleIncrement, minScale);
        if (nextTextRef.current.scale.x <= minScale && nextTextRef.current.scale.y <= minScale) {
          setGrowing(true);
        }
      }
    }
  });

  return (
    <group {...props}>
      <ScreenModel
        scale={[0.14, 0.14, 0.14]}
        rotation={[0, - Math.PI / 8, 0]}
      />
      <group
        position={[0, -1.1, 0.1]}
        rotation={[0, - Math.PI / 8, 0]}
      >
        <Text
          ref={mainTextRef}
          color={mainTextColor}
          fontSize={mainTextSize}
          textAlign='center'
          position={[0, 0.1, 0]}
        >
          {screenText.text}
        </Text>
        <Text
          ref={nextTextRef}
          onClick={handleScreenTextChange}
          color={nextTextColor}
          fontSize={nextTextSize}
          position={[0, -0.45, 0]}
          onPointerEnter={handlePointerEnterNextText}
          onPointerLeave={handlePointerExitNextText}
        >
          {nextText}
        </Text>
      </group>
    </group >
  )
}