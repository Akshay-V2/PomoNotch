import { use, useEffect, useRef, useState } from "react";
import { moveWindow, Position } from '@tauri-apps/plugin-positioner';
import { invoke } from "@tauri-apps/api/core";

import { Play, PencilSimple, Pause, ClockClockwise } from "@phosphor-icons/react";
import "./App.css";

function App() {

  // sounds
  let timerEndSFX = new Audio('/timerEnd.mp3');
  // let switchSFX = new Audio('/switch.mp3');

  //theme
  // const [theme, setTheme] = useState(localStorage.getItem('theme') ? localStorage.getItem('theme') : "dark");

  // const handleThemeChange = (themeNew) => {
  //   if (themeNew === "light") {
  //     setTheme("light");
  //     localStorage.setItem('theme', 'light');
  //   } else if (themeNew === "dark") {
  //     setTheme("dark");
  //     localStorage.setItem('theme', 'dark');
  //   }
  // }

  // useEffect(() => {
  //   if (theme === "light") {
  //     document.documentElement.setAttribute('data-theme', 'light');
  //   } else if (theme === "dark") {
  //     document.documentElement.setAttribute('data-theme', 'dark');
  //   }
  // },[theme])

  // slider
  const [value, setValue] = useState("1800"); // slider value

  // Window Managament

  const handleResize = (width, height) => {
    invoke('resize_window', { width: width, height: height }).catch((error) => {
      console.error("Failed to invoke resize_window:", error);
    });
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const [windowMode, setWindowMode] = useState("default");

  useEffect(() => {
    moveWindow(Position.TopCenter);
  }, [isEditMode]);

  const resizeEdit = () => {
    if (windowMode === "edit") {
      handleResize(229, 60);
      setWindowMode("default");
      setIsEditMode(false);
      moveWindow(Position.TopCenter);
      setTime(value);
    } else {
      handleResize(501, 390);
      setWindowMode("edit");
      setIsEditMode(true);
      moveWindow(Position.TopCenter);
      setTime(value);
    }
  }

  // mode management
  const [mode, setMode] = useState("timer");

  const handleModeChange = (modeNew) => {
    setMode(modeNew);
  }

  // timer
  const [time, setTime] = useState(30 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isEnded, setIsEnded] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && time > 0) {
      setIsEnded(false);
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            setIsActive(false);
            setTime(30 * 60);
            timerEndSFX.play();
            return 0;
          }
          return prevTime - 1;
        })
      }, 1000)
    } else if ((!isActive && intervalRef.current) || time === 0) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, time]);

  const handlePlayPauseClick = () => {
    setIsActive(!isActive);
  };

  const handleResetClick = () => {
    setIsEnded(true);
    setIsActive(false);
    setTime(30 * 60);
  };
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <>
    </>

  );
}

export default App;
