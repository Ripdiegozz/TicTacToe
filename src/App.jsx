import React, { useState } from 'react'
import confetti from 'canvas-confetti'
import './index.css'

const TURNS = { // Estado de los turnos (puede cambiarse a cualquier otro valor los strings)
  X: 'X',
  O: 'O'
}

// Combinaciones ganadoras
const WINNER_COMBOS = [
  // Horizontal
  [0, 1, 2], // 0
  [3, 4, 5], // 1
  [6, 7, 8], // 2
  // Vertical
  [0, 3, 6], // 3
  [1, 4, 7], // 4
  [2, 5, 8], // 5
  // Diagonal
  [0, 4, 8], // 6
  [2, 4, 6] // 7
]

// Componente Square (cuadrado donde va X o O / tambien se utiliza para mostrar el turno actual)
const Square = ({ children, isSelected, index, updateBoard }) => {
  // Clases del cuadrado, si esta seleccionado se agrega la clase is-selected (para mostrar el turno actual)
  const className = `square ${isSelected ? 'is-selected' : ''}`
  // funcion que se ejecuta cuando se hace click en un cuadrado
  const handleClick = () => {
    updateBoard(index)
  }

  return (
    <div className={className} onClick={() => handleClick()}>
      {children}
    </div>
  )
}

const App = () => {
  // Estados del tablero, se inicializa con un array de 9 posiciones con valor null, que representa el tablero vacio EN CASO DE QUE NO HAYA NADA EN LOCALSTORAGE
  const [board, setBoard] = useState(() => {
    const boardFromStorage = window.localStorage.getItem('board')
    if (boardFromStorage) {
      return JSON.parse(boardFromStorage)
    }

    return Array(9).fill(null)
  })
  // Estado del turno
  const [turn, setTurn] = useState(() => {
    const turnFromStorage = window.localStorage.getItem('turn')
    if (turnFromStorage) {
      return JSON.parse(turnFromStorage)
    }

    return TURNS.X
  })
  // Estado del ganador, null si no hay ganador (estado inicial), false si hay empate
  const [winner, setWinner] = useState(null)

  const updateBoard = (index) => {
    // No actualizamos la poscion del array si ya contiene algo (X o O)
    if (board[index] || winner) return

    // Crear copia del estado del tablero. Nunca se debe sobrescribir el array u objeto original del cual consumes data
    const newBoard = [...board]
    // rellenar la posicion del array con el valor del turno actual
    newBoard[index] = turn
    // Actualizar el estado del tablero
    setBoard(newBoard)
    console.log(board)

    // Cambiar el turno, si es X cambia a O y viceversa
    const newTurn = turn === TURNS.X ? TURNS.O : TURNS.X
    setTurn(newTurn)
    // Guardar partida en persistencia LocalStorage
    window.localStorage.setItem('board', JSON.stringify(newBoard))
    window.localStorage.setItem('turn', JSON.stringify(newTurn))
    // Verificar si hay ganador
    const newWinner = checkWinnerFrom(newBoard)
    // Si hay ganador actualizamos el estado del ganador
    if (newWinner) {
      // Lanzar confetti
      confetti()
      setWinner(newWinner) // Estado asincrono, no se actualiza inmediatamente, por lo que no se puede usar en la siguiente linea
    } else if (checkEndGame(newBoard)) { // Si no hay ganador y el juego esta bloqueado, se actualiza el estado del ganador a false (empate)
      setWinner(false)
    } // Ver si el juego esta bloqueado
  }

  // Funcion que se ejecuta cada vez que se actualiza el estado del tablero
  // Se ejecuta cada vez que se actualiza el estado del tablero
  const checkWinnerFrom = (boardToCheck) => {
    // revisamos todas las combinaciones ganadoras
    // para ver si X u O ganó
    for (const combo of WINNER_COMBOS) {
      const [a, b, c] = combo
      if (
        boardToCheck[a] &&
        boardToCheck[a] === boardToCheck[b] &&
        boardToCheck[a] === boardToCheck[c]
      ) {
        // si hay ganador
        const newBoard = Array(9).fill(null)
        window.localStorage.setItem('board', JSON.stringify(newBoard))
        const newTurn = TURNS.X
        window.localStorage.setItem('turn', JSON.stringify(newTurn))
        return boardToCheck[a]
      }
    }
    // si no hay ganador
    return null
  }

  // Reiniciar juego a valores iniciales

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setTurn(TURNS.X)
    setWinner(null)
  }

  const checkEndGame = (boardToCheck) => {
    // Si no hay ganador y el tablero esta lleno
    return !checkWinnerFrom(boardToCheck) && !boardToCheck.includes(null)
  }

  return (
    <main className='board'>
      <h1>Tic Tac Toe</h1>
      <section className='game'>
        {
          board.map((_, index) => {
            return (
              <Square key={index} index={index} updateBoard={updateBoard}>{board[index]}</Square>
            )
          })
        }
      </section>

      <section className='turn'>
        <Square isSelected={turn === TURNS.X}>
          {TURNS.X}
        </Square>
        <Square isSelected={turn === TURNS.O}>
          {TURNS.O}
        </Square>
      </section>

      {
        winner !== null && (
          <section className='winner'>
            <div className='text'>
              <h2>
                {
                  winner === false ? 'Empate' : 'Gano:'
                }
              </h2>
              <header className='win'>
                {winner && <Square>{winner}</Square>}
              </header>
              <footer>
                <button onClick={() => resetGame()}>Empezar de nuevo</button>
              </footer>
            </div>
          </section>
        )
      }

      <button onClick={() => resetGame()}> Reset Game </button>
    </main>
  )
}

export default App
