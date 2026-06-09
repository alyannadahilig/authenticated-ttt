## Installation and Setup

**Note:** This project uses Create React App (CRA), not Vite.

### 1. Open a terminal and navigate to the server folder

```bash
cd tic-tac-toe/server
npm install
node index.js
```

### 2. Open the application

Visit:

```txt
http://localhost:3001
```

### Game Persistence

User accounts are stored in:

```txt
users.json
```

Game state is stored in:

```txt
boardHistory.json
```

After each move, the game is automatically saved and restored when the user logs in again or refreshes the page.
