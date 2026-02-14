import { useState, useEffect, useCallback } from 'react'
import './App.css'

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SPEED = 150

function App() {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }])
  const [food, setFood] = useState({ x: 15, y: 15 })
  const [direction, setDirection] = useState({ x: 0, y: 0 })
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snakeHighScore') || '0')
  })

  const generateFood = useCallback(() => {
    let newFood
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [snake])

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }])
    setFood(generateFood())
    setDirection({ x: 0, y: 0 })
    setGameStarted(false)
    setGameOver(false)
    setScore(0)
  }, [generateFood])

  const startGame = useCallback(() => {
    setGameStarted(true)
    setDirection({ x: 1, y: 0 })
  }, [])

  useEffect(() => {
    if (!gameStarted || gameOver || direction.x === 0 && direction.y === 0) return

    const moveSnake = setInterval(() => {
      setSnake(prev => {
        const head = prev[0]
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y
        }

        // 撞墙检测
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || 
            newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true)
          return prev
        }

        // 撞自己检测
        if (prev.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true)
          return prev
        }

        const newSnake = [newHead, ...prev]

        // 吃食物
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => {
            const newScore = s + 10
            if (newScore > highScore) {
              setHighScore(newScore)
              localStorage.setItem('snakeHighScore', newScore.toString())
            }
            return newScore
          })
          setFood(generateFood())
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }, INITIAL_SPEED)

    return () => clearInterval(moveSnake)
  }, [gameStarted, gameOver, direction, food, highScore, generateFood])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted) return
      
      const keyMap = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 }
      }

      const newDir = keyMap[e.key]
      if (newDir) {
        // 防止直接反向
        if ((newDir.x !== -direction.x || newDir.y !== -direction.y) ||
            (direction.x === 0 && direction.y === 0)) {
          setDirection(newDir)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameStarted, direction])

  return (
    <div className="game-container">
      <h1>🐍 贪吃蛇</h1>
      
      <div className="score-board">
        <div className="score">分数: {score}</div>
        <div className="high-score">最高分: {highScore}</div>
      </div>

      <div 
        className="game-board"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`
        }}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`snake-segment ${index === 0 ? 'head' : ''}`}
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE
            }}
          />
        ))}
        <div
          className="food"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE
          }}
        />
      </div>

      <div className="controls">
        {!gameStarted && !gameOver && (
          <button className="btn start" onClick={startGame}>
            开始游戏
          </button>
        )}
        {gameOver && (
          <div className="game-over">
            <p>游戏结束！</p>
            <button className="btn restart" onClick={resetGame}>
              重新开始
            </button>
          </div>
        )}
        {gameStarted && !gameOver && (
          <p className="hint">使用方向键或 WASD 控制</p>
        )}
      </div>
    </div>
  )
}

export default App
