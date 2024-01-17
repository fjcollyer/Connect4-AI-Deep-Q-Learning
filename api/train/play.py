import random
import sys
import time
import torch
import numpy as np
import os
import matplotlib.pyplot as plt

from .main import Config, Trainer
from .connect4 import Connect4
from .dqn_agent import DQNAgent


def get_latest_saved_model_path():
    files = [file for file in os.listdir(
        Config.SAVE_FOLDER) if file.endswith(".pt")]
    files.sort(key=lambda x: int(x.split("_")[1].split(".")[0]))
    return os.path.join(Config.SAVE_FOLDER, files[-1])


def draw_board(board, q_values=None):
    plt.imshow(board, cmap="coolwarm", origin="upper")
    plt.colorbar()
    plt.xticks(np.arange(Config.COLUMNS), np.arange(1, Config.COLUMNS + 1))

    # If q_values are provided, display them above each column.
    if q_values is not None:
        for idx, value in enumerate(q_values):
            plt.text(idx, -1.2, f"{value:.3f}", horizontalalignment='center',
                     verticalalignment='center', color='black', fontweight='bold')

    plt.show(block=False)
    plt.pause(0.1)
    plt.clf()


def play_game(mode):
    latest_model_path = get_latest_saved_model_path()
    print("Loading model from:", latest_model_path)

    config = Config()
    env = Connect4(config=config)
    agent = DQNAgent(config)
    agent.dqn_net.load_state_dict(torch.load(latest_model_path))

    if mode in ["me1", "me2"]:
        if mode == "me1":
            env.player = 'enemy'
        else:  # mode == "me2"
            env.player = 'agent'

        print(
            f"You are playing against the AI! You are 'enemy' (represented by -1), AI is 'agent' (represented by 1). You are {'moving first' if mode == 'me1' else 'moving second'}.")
        winner = False
        while not winner:
            draw_board(env.board, agent.get_q_values(-env.board))

            if env.player == 'enemy':
                action = int(input(
                    f"Enter the column number (1-{config.COLUMNS}) where you want to drop your piece: ")) - 1
            else:
                # Obtain the Q-values for the current state
                q_values = agent.get_q_values(-env.board)
                # Display the Q-values for each column
                for idx, value in enumerate(q_values):
                    print(f"Column {idx + 1}: Q-value = {value:.4f}")

                # Confirmation step
                confirm = input(
                    "Press 'y' to let the agent make its move: ").lower()
                while confirm != 'y':
                    confirm = input(
                        "Press 'y' to let the agent make its move: ").lower()

                # Get the action based on the Q-values
                action = np.argmax(q_values)

            winner = env.make_move(action)
    elif mode == "self":
        env.reset(starting_player='agent')
        winner = False
        while not winner:
            draw_board(env.board)
            if env.player == 'agent':
                action = agent.get_action(env.board, 0)
            else:
                # Flip the board to represent the enemy's perspective
                action = agent.get_action(-env.board, 0)

            if action not in env.get_valid_actions():
                print("Invalid action!")
            winner = env.make_move(action)
            time.sleep(1)
    elif mode == "random":
        starting_player = 'agent' if random.randint(0, 1) == 0 else 'enemy'
        env.reset(starting_player=starting_player)
        print(
            f"Random mode activated. {'Agent' if starting_player == 'agent' else 'Enemy'} is moving first.")

        winner = False
        while not winner:
            draw_board(env.board)
            valid_actions = env.get_valid_actions()
            if env.player == 'agent':
                action = agent.get_action(env.board, 0)
            else:  # Random legal move for the enemy
                action = random.choice(valid_actions)

            if action not in valid_actions:
                print("Invalid action!")
            winner = env.make_move(action)
            time.sleep(1)

    draw_board(env.board)
    print("Game Over! Winner is:", winner)
    print(env.board)
    time.sleep(4)


if __name__ == '__main__':
    if len(sys.argv) != 2 or sys.argv[1] not in ["me1", "me2", "self", "random"]:
        print("Usage: python play.py <me1/me2/self/random>")
        sys.exit(1)

    mode = sys.argv[1]
    play_game(mode)
