import './App.css'
import { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from './components/ui/button'

function App() {
  const [name, setName] = useState('')
  const [seconds, setSeconds] = useState(10)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined

    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prevCount) => prevCount - 1)
      }, 1000)
    } else if (seconds === 0) {
      setIsRunning(false)
    }

    return () => clearInterval(interval)
  }, [isRunning, seconds])

  const handleTimer = () => {
    setSeconds(3)
    setIsRunning(true)
  }
  console.log(name);
  

  return (
    <div>
      <Input type="text" onChange={e => setName(e.target.value)} />
      <p className='name'>{name.trim() ? `your name - ${name}` : ''}</p>
      <Button disabled={!name.trim() || seconds === null} onClick={handleTimer}>Start</Button>
      <h2 className='seconds'>{seconds > 0 ? `${seconds} seconds left`: 'Time is up'}</h2>
    </div>
  )
}

export default App
