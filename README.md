## Tic-Tac-Toe Application

**Note:**
This project uses Create React App (CRA), not Vite

The client is started using:
npm start

rather than:
npm run dev

**Installation and Setup**
1. Open a terminal and navigate to the project folder:
cd tic-tac-toe

2. In the project folder, run:
cd server
npm install
node index.js

3. Open a second terminal and navigate to the project folder again:
cd tic-tac-toe
cd client
npm install
npm start

4. Once both the server and client are running, open:
http://localhost:3000

The game state is stored on the server in boardHistory.json. After each move by X or O, the current board state is saved to
the file.