# connect4.py
import numpy as np
from scipy.signal import convolve2d

class Connect4:
    def __init__(self, config=None):
        self.rows = config.ROWS
        self.columns = config.COLUMNS
        self.win_length = config.WINNING_LENGTH
        self.reset(starting_player='agent')

    def reset(self, starting_player):
        self.board = np.zeros((self.rows, self.columns), dtype=int)
        self.player = starting_player

    def get_valid_actions(self):
        return [c for c in range(self.columns) if self.board[0][c] == 0]

    def make_move(self, column):
        if column not in self.get_valid_actions():
            return 'enemy' if self.player == 'agent' else 'agent'

        for row in reversed(range(self.rows)):
            if self.board[row][column] == 0:
                self.board[row][column] = 1 if self.player == 'agent' else -1
                break

        if self.is_terminal():
            return self.player
        elif np.all(self.board != 0):  
            return 'draw'

        self.player = 'agent' if self.player == 'enemy' else 'enemy'
        return False

    def is_terminal(self):
        window_length = self.win_length
        horizontal_kernel = np.ones((1, window_length), dtype=int)
        vertical_kernel = np.transpose(horizontal_kernel)
        diag1_kernel = np.eye(window_length, dtype=int)
        diag2_kernel = np.fliplr(diag1_kernel)
        detection_kernels = [horizontal_kernel, vertical_kernel, diag1_kernel, diag2_kernel]
        for player_id in [1, -1]:
            for kernel in detection_kernels:
                if (convolve2d(self.board == player_id, kernel, mode="valid") == window_length).any():
                    return True
        return False