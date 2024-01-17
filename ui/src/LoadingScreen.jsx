import React, { useState, useEffect } from 'react';
import { useProgress } from "@react-three/drei";

export default function LoadingScreen({ started, onStarted }) {
  const { progress } = useProgress();
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    if (started) {
      // Set a timeout equal to the CSS transition duration in style.css on .started
      const timer = setTimeout(() => {
        setIsHidden(true);
      }, 1000); // Match the CSS transition duration in style.css on .started
      return () => clearTimeout(timer);
    }
  }, [started]);

  const loadingOuterClass = `loader-outer ${started ? "started" : "not-started"} ${progress === 100 ? "loading-completed" : "loading-not-completed"} ${isHidden ? "hidden" : ""}`;

  const handleButtonClick = () => {
    if (progress === 100) {
      onStarted(); // This will set `started` to true
    } else {
      console.log("Loading not complete");
    }
  };

  return (
    <div className={loadingOuterClass}>
      <div className="loader-container">
        <button id="loader-startButton" onClick={handleButtonClick}>
          {progress < 100 ? Math.floor(progress) + "%" : "Start"}
        </button>
      </div>
    </div>
  );
};