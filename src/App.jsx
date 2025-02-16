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
  const [theme, setTheme] = useState(localStorage.getItem('theme') ? localStorage.getItem('theme') : "dark");

  const handleThemeChange = (themeNew) => {
    if (themeNew === "light") {
      setTheme("light");
      localStorage.setItem('theme', 'light');
    } else if (themeNew === "dark") {
      setTheme("dark");
      localStorage.setItem('theme', 'dark');
    }
  }

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute('data-theme', 'light');
    } else if (theme === "dark") {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  },[theme])

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
      document.querySelector('.edit-card').classList.remove('edit-card-anim');
      handleResize(229, 60);
      setWindowMode("default");
      setIsEditMode(false);
      moveWindow(Position.TopCenter);
      setTime(value);
    } else {
      document.querySelector('.edit-card').classList.add('edit-card-anim');
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

  const alertEditMode = () => {
    document.getElementById("editButton").classList.add('button-indic-anim');
    setTimeout(() => {
      document.getElementById("editButton").classList.remove('button-indic-anim');
    }, 300);
  }

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
    <div className="minimal">{formatTime(time)}</div>

    <div className="notch-wrapper">
      <div className={isActive ? "notch hide" : "notch"}>
        {isEnded ? <button className="button" id="editButton" onClick={resizeEdit}><PencilSimple size={24} weight="fill" className="button-icon" /></button> : <button className="button" onClick={handleResetClick}><ClockClockwise size={24} weight="fill" className="button-icon" /></button>}
        <div className="timer-card"><div className="timer-text">{isEditMode ? formatTime(value) : formatTime(time)}</div></div>
        <button className="button" onClick={isEditMode ? alertEditMode : handlePlayPauseClick}>{isActive ? <Pause size={24} weight="fill" className="button-icon" /> : <Play size={24} weight="fill" className="button-icon" />}</button>
      </div>
    </div>

    <div className="edit-card">
      <div className="edit-switch-menu">
        <div className={mode == "timer" ? "edit-switch-item-active" : "edit-switch-item"} onClick={() => {handleModeChange("timer")}}>Timer</div>
        <div className={mode == "appearance" ? "edit-switch-item-active" : "edit-switch-item"} onClick={() => {handleModeChange("appearance")}}>Appearance</div>
        {/* <div className={mode == "sounds" ? "edit-switch-item-active" : "edit-switch-item"} onClick={() => {handleModeChange("sounds")}}>Sounds</div> */}
      </div>

    {mode == "timer" ? (<div className="edit-timer-option">
        <div className="edit-time-wrapper">
          <div className="edit-time">{formatTime(value)}</div>
          <div className="edit-time-tip">Ok you got this ✨</div>
        </div>

        <input type="range" min="300" max="3600" step={5*60} value={value} onChange={(e) => setValue(e.target.value)} class="slider" id="myRange" />
      </div> ) : mode == "appearance" ? ( <div className="edit-appearance-option-wrapper">
        <div className="edit-appearance-option-light" onClick={() => {handleThemeChange("light")}}>{formatTime(time)}</div>
        <div className="edit-appearance-option-dark" onClick={() => {handleThemeChange("dark")}}>{formatTime(time)}</div> 
      </div> ) : null}
    </div>
    </>

  );
}

export default App;
