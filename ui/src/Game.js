import axios from "axios";

export default class Game {
  constructor() {
    this.board = [];
    this.recreateBoard();
    this.userPlayer = -1;
    this.aiPlayer = 1;
    // Use environment variable for API URL, adjusted for Vite
    this.api_endpoint = import.meta.env.VITE_API_URL + "/get_q_values";
    this.fallback_api_endpoint = "http://http://127.0.0.1:8080" + "/get_q_values"
  }

  recreateBoard() {
    for (let row = 0; row < 6; row++) {
      this.board[row] = [];
      for (let col = 0; col < 7; col++) {
        this.board[row][col] = 0;
      }
    }
  }

  async wakeUpAiAPI() {
    try {
      let endpoint = this.api_endpoint;
      // If no API URL is set and we are in development mode try localhost
      if (!endpoint && import.meta.env.DEV) {
        endpoint = this.fallback_api_endpoint;
        console.log("No API URL set, using: " + endpoint);
      }

      // Make the API call to wake up the AI API
      const response = await axios.post(endpoint, {
        state: this.board
      });
      console.log("AI API woke up:", response.data);
      return true
    } catch (error) {
      console.log("Error waking up AI API:", error);
      return false;
    }
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

  // Function to make AI move
  async makeAIMove() {
    try {

      let endpoint = this.api_endpoint;
      // If no API URL is set and we are in development mode try localhost
      if (!endpoint && import.meta.env.DEV) {
        endpoint = this.fallback_api_endpoint
        console.log("No API URL set, using: " + endpoint);
      }

      // Make the API call to get the AI move
      const response = await axios.post(endpoint, {
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
  checkWin() {
    return this.checkHorizontalWin() || this.checkVerticalWin() || this.checkDiagonalWin();
  }

  checkDraw() {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        if (this.board[row][col] === 0) {
          return false;
        }
      }
    }
    return true;
  }

  checkHorizontalWin() {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        let cellValue = this.board[row][col];
        if (cellValue !== 0 &&
          cellValue === this.board[row][col + 1] &&
          cellValue === this.board[row][col + 2] &&
          cellValue === this.board[row][col + 3]) {
          return true;
        }
      }
    }
    return false;
  }

  checkVerticalWin() {
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 3; row++) {
        let cellValue = this.board[row][col];
        if (cellValue !== 0 &&
          cellValue === this.board[row + 1][col] &&
          cellValue === this.board[row + 2][col] &&
          cellValue === this.board[row + 3][col]) {
          return true;
        }
      }
    }
    return false;
  }

  checkDiagonalWin() {
    // Check from top-left to bottom-right
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        let cellValue = this.board[row][col];
        if (cellValue !== 0 &&
          cellValue === this.board[row + 1][col + 1] &&
          cellValue === this.board[row + 2][col + 2] &&
          cellValue === this.board[row + 3][col + 3]) {
          return true;
        }
      }
    }

    // Check from top-right to bottom-left
    for (let row = 0; row < 3; row++) {
      for (let col = 3; col < 7; col++) {
        let cellValue = this.board[row][col];
        if (cellValue !== 0 &&
          cellValue === this.board[row + 1][col - 1] &&
          cellValue === this.board[row + 2][col - 2] &&
          cellValue === this.board[row + 3][col - 3]) {
          return true;
        }
      }
    }

    return false;
  }

}
