import axios from "axios";

export default class Game {
  constructor() {
    this.board = this.recreateBoard();
    this.userPlayer = -1;
    this.aiPlayer = 1;
  }

  recreateBoard() {
    let board = [];
    for (let row = 0; row < 6; row++) {
      board[row] = [];
      for (let col = 0; col < 7; col++) {
        board[row][col] = 0;
      }
    }
    return board;
  }

  // Function to make a move
  makeUserMove(col) {
    // Find the first empty row in the column
    let row = -1;
    for (let i = 5; i >= 0; i--) {
      if (this.board[i][col] === 0) {
        row = i;
        break;
      }
    }
    // If the column is full, return false
    if (row === -1) {
      return false;
    }
    // Else, make the move and return true
    this.board[row][col] = this.userPlayer;
    return true;
  }

  // Function to make AI move, we need to call an API to get the move
  async makeAIMove() {
    try {
      // Make the API call to get the AI move
      const response = await axios.post('https://connect4-app-service-kooxolstma-uc.a.run.app/get_q_values', {
        state: this.board
      });

      const qValues = response.data.q_values;
      // Index of the maximum value in the array is the column number
      const maxIndex = qValues.indexOf(Math.max(...qValues));
      const aiMoveColumn = maxIndex;

      // Now proceed with making the move as before
      let row = -1;
      for (let i = 5; i >= 0; i--) {
        if (this.board[i][aiMoveColumn] === 0) {
          row = i;
          break;
        }
      }
      if (row === -1) {
        console.log("Invalid move: Column is full");
        return false; // Column is full
      }
      this.board[row][aiMoveColumn] = this.aiPlayer;
      return aiMoveColumn;
    } catch (error) {
      console.log("Error making AI move:", error);
      return false;
    }
  }

  // Functions to check for win or draw
  checkWin(board) {
    return this.checkHorizontalWin(board) || this.checkVerticalWin(board) || this.checkDiagonalWin(board);
  }

  checkDraw(board) {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        if (board[row][col] === 0) {
          return false;
        }
      }
    }
    return true;
  }

  checkHorizontalWin(board) {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        let cellValue = board[row][col];
        if (cellValue !== 0 &&
          cellValue === board[row][col + 1] &&
          cellValue === board[row][col + 2] &&
          cellValue === board[row][col + 3]) {
          return true;
        }
      }
    }
    return false;
  }

  checkVerticalWin(board) {
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 3; row++) {
        let cellValue = board[row][col];
        if (cellValue !== 0 &&
          cellValue === board[row + 1][col] &&
          cellValue === board[row + 2][col] &&
          cellValue === board[row + 3][col]) {
          return true;
        }
      }
    }
    return false;
  }

  checkDiagonalWin(board) {
    // Check from top-left to bottom-right
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        let cellValue = board[row][col];
        if (cellValue !== 0 &&
          cellValue === board[row + 1][col + 1] &&
          cellValue === board[row + 2][col + 2] &&
          cellValue === board[row + 3][col + 3]) {
          return true;
        }
      }
    }

    // Check from top-right to bottom-left
    for (let row = 0; row < 3; row++) {
      for (let col = 3; col < 7; col++) {
        let cellValue = board[row][col];
        if (cellValue !== 0 &&
          cellValue === board[row + 1][col - 1] &&
          cellValue === board[row + 2][col - 2] &&
          cellValue === board[row + 3][col - 3]) {
          return true;
        }
      }
    }

    return false;
  }

}
