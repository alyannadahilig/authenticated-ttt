import { useEffect, useState } from 'react';

//makes a single square on the game board for less repetitive code later
function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

//shows the tictactoe board and displays user;s square clicks
function Board({ xIsNext, squares, onPlay }) {

  //places player's move when a square is clicked
  function handleClick(i) {

    //don't do anything if there's already a winner or if the square is already occupied
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    //copy of the current board's state
    const nextSquares = squares.slice();

    //place the current player's symbol
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }

    //send updated board 
    onPlay(nextSquares);
  }

  //assigns a winner to 'winner' if someone has won
  const winner = calculateWinner(squares);

  let status;

  if (winner) { //if there is a winner, let status display winner
    status = 'Winner: ' + winner;
  } else { //otherwise, display which symbol has a next move
    status = 'Next player: ' + getNextPlayer(squares);
  }

  return (
    <>
      <div className="status">{status}</div>

      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadGame();
  }, []);

  function loadGame() {
    fetch("/game", {
      credentials: "include"
    })
      .then((response) => {
        if (!response.ok) {
          return;
        }
  
        setLoggedIn(true);
        return response.json();
      })
      .then((data) => {
        if (data) {
          setHistory(data.history);
          setCurrentMove(data.currentMove);
        }
      });
  }

  function createAccount() {
    fetch("/register", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then((response) => response.text())
      .then((data) => {
        alert(data);
      });
  }
  
  function handleLogin() {
    fetch("/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then((response) => response.text())
      .then((data) => {
        alert(data);
  
        if (data === "Logged in") {
          setLoggedIn(true);
          loadGame();
        }
      });
  }

  const currentSquares = history[currentMove];

  //checkks whose turn it is by counting number of Xs and Os
  const nextPlayer = getNextPlayer(currentSquares);
  const xIsNext = nextPlayer === 'X';

  //saves a new board state after each move
  function handlePlay(nextSquares) {
  const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
  const nextMove = nextHistory.length - 1;

  setHistory(nextHistory);
  setCurrentMove(nextMove);

  fetch("/game", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      history: nextHistory,
      currentMove: nextMove,
    }),
  });
}

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

//resets the game back to empty board
function resetGame() {
  fetch("/reset", {
    method: "POST",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      setHistory(data.history);
      setCurrentMove(data.currentMove);
    });
}

  //creates the history of buttons clicked
  const moves = history.map((squares, move) => {
    let description;

    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }

    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  if (!loggedIn) {
    return (
      <div>
        <h1>Login to Play Tic-Tac-Toe</h1>
  
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br>
        </br>

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
  
        <br>
        </br>
        <br>
        </br>

        <button onClick={createAccount}>Create Account</button>
        <p>or</p>
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <button onClick={resetGame}>Reset Game</button> 
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

//counts the amountof Xs and Os to determine whos goes next
function getNextPlayer(squares) {
  let xCount = 0;
  let oCount = 0;

  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === 'X') {
      xCount++;
    }

    if (squares[i] === 'O') {
      oCount++;
    }
  }

  //if X has played the same number of moves as O, or fewer moves than O, then X goes next, otherwise it's O's turn
  if (xCount <= oCount) {
    return 'X';
  } else {
    return 'O';
  }
}

//a winner method that checks all rows, columns, and diagonals for a win
function calculateWinner(squares) {

  //winning rows
  if (squares[0] && squares[0] === squares[1] && squares[1] === squares[2]) {
    return squares[0];
  }
  if (squares[3] && squares[3] === squares[4] && squares[4] === squares[5]) {
    return squares[3];
  }
  if (squares[6] && squares[6] === squares[7] && squares[7] === squares[8]) {
    return squares[6];
  }

  //winning columns
  if (squares[0] && squares[0] === squares[3] && squares[3] === squares[6]) {
    return squares[0];
  }
  if (squares[1] && squares[1] === squares[4] && squares[4] === squares[7]) {
    return squares[1];
  }
  if (squares[2] && squares[2] === squares[5] && squares[5] === squares[8]) {
    return squares[2];
  }

  //winning diagonals
  if (squares[0] && squares[0] === squares[4] && squares[4] === squares[8]) {
    return squares[0];
  }
  if (squares[2] && squares[2] === squares[4] && squares[4] === squares[6]) {
    return squares[2];
  }

  //no winner!
  return null;
}
