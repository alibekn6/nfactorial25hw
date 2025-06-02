import "./App.css";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "./components/ui/button";

function App() {
  const [name, setName] = useState("");
  const [seconds, setSeconds] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState("");


  const phrases = [
    "Push now — victory won't wait!",
    "One step closer!",
    "Do it now, thank yourself later.",
    "If it's tough, you're growing.",
    "Seconds matter — don't stall!",
    "Motivation: ON. Let's go!",
    "Every 'just a bit more' builds greatness.",
    "You're closer than you think.",
    "Crush it. Shock yourself.",
    "Don't quit. This moment counts."
  ]

  const getRandomPhrase = () => {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex]
  }



  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;

    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prevCount) => prevCount - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const handleTimer = () => {
    setSeconds(10);
    setIsRunning(true);
    setCurrentPhrase(getRandomPhrase());
  };

  const resetTimer = () => {
    setSeconds(-1);
    setIsRunning(false);
    setCurrentPhrase("")
  };


  return (
    <div className="container">
      <Input
        placeholder="Enter your name"
        type="text"
        onChange={(e) => {
          e.preventDefault();
          setName(e.target.value);
        }}
      />
      <Button
        className="startButton"
        disabled={!name.trim() || seconds === null}
        onClick={handleTimer}
      >
        Start
      </Button>
      <Button className="resetButton" onClick={resetTimer}>
        Reset
      </Button>

      <div>
        <p>{currentPhrase}</p>
      </div>
      
      <div className="message-container">
        <h1 className="seconds">
          {isRunning && seconds > 0 ? `${seconds} seconds left` : ""}
        </h1>
        <h1 className="seconds">
          {seconds === 0 ? `You did well ${name}  💪` : ""}
        </h1>
      </div>

    </div>
  );
}

export default App;
