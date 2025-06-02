import "./App.css";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "./components/ui/button";
import { Progress } from "@/components/ui/progress";
import confetti from 'canvas-confetti';

function App() {
  const [name, setName] = useState("");
  const [seconds, setSeconds] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [currentPhrase, setCurrentPhrase] = useState("");
  const [progress, setProgress] = useState(100);

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
    "Don't quit. This moment counts.",
  ];

  const durations = [10, 20, 30];

  const getRandomPhrase = () => {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
  };

  const triggerConfetti = () => {
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;

    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prevCount) => prevCount - 1);
        setProgress((seconds / selectedDuration) * 100);
      }, 1000);
    } else if (seconds === 0) {
      setIsRunning(false);
      triggerConfetti();
      setProgress(0);
    }

    return () => clearInterval(interval);
  }, [isRunning, seconds, selectedDuration]);

  const handleTimer = () => {
    setSeconds(selectedDuration);
    setIsRunning(true);
    setCurrentPhrase(getRandomPhrase());
    setProgress(100);
  };

  const resetTimer = () => {
    setSeconds(-1);
    setIsRunning(false);
    setCurrentPhrase("");
    setProgress(100);
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
      <div className="duration-select">
        <div className="duration-options">
          {durations.map((duration) => (
            <button
              key={duration}
              className={`duration-option ${
                selectedDuration === duration ? "active" : ""
              }`}
              onClick={() => setSelectedDuration(duration)}
            >{duration} s</button>
          ))}
        </div>
      </div>

      <Button
        className="startButton"
        disabled={!name.trim() || seconds > 0}
        onClick={handleTimer}
      >
        Start
      </Button>
      <Button className="resetButton" onClick={resetTimer}>
        Reset
      </Button>

      <div>
        <p className="currentPhrase">{currentPhrase}</p>
      </div>

      <div className="message-container">
        <h1 className="seconds">
          {isRunning && seconds > 0 ? `${name}, ${seconds} seconds left` : ""}
        </h1>
        <h1 className="seconds">
          {seconds === 0 ? `You did well ${name}  💪` : ""}
        </h1>
        {isRunning && seconds > 0 && (
          <Progress value={progress} className="w-full mt-4" />
        )}
      </div>
    </div>
  );
}

export default App;
