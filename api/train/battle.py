import numpy as np
import torch
from dqn_agent import DQNAgent

from .main import Config
from .connect4 import Connect4


def play_game(agent, enemy):
    game = Connect4(Config)
    game.reset(starting_player='agent')
    players = {'agent': agent, 'enemy': enemy}

    while True:
        current_player = game.player
        valid_actions = game.get_valid_actions()
        action = players[current_player].get_action(
            game.board, 0.0)  # no exploration

        if action not in valid_actions:
            # current player loses if invalid move
            return 'enemy' if current_player == 'agent' else 'agent'

        result = game.make_move(action)
        if result:  # returns either 'agent', 'enemy', or 'draw'
            return result


def main():
    AGENT_MODEL_PATH = "./agents_saved/model_99999.pt"
    ENEMY_MODEL_PATH = "./agents_saved/model_99999_4kernal.pt"
    config = Config()

    agent = DQNAgent(config)
    enemy = DQNAgent(config)

    agent.dqn_net.load_state_dict(torch.load(
        AGENT_MODEL_PATH, map_location=config.DEVICE))
    enemy.dqn_net.load_state_dict(torch.load(
        ENEMY_MODEL_PATH, map_location=config.DEVICE))

    agent.dqn_net.eval()
    enemy.dqn_net.eval()

    agent_wins = 0
    enemy_wins = 0
    draws = 0

    # 1000 games with agent starting first
    for _ in range(1000):
        result = play_game(agent, enemy)
        if result == 'agent':
            agent_wins += 1
        elif result == 'enemy':
            enemy_wins += 1
        else:
            draws += 1

    # 1000 games with enemy starting first
    for _ in range(1000):
        result = play_game(enemy, agent)
        if result == 'agent':
            enemy_wins += 1
        elif result == 'enemy':
            agent_wins += 1
        else:
            draws += 1

    print("Agent Wins:", agent_wins)
    print("Enemy Wins:", enemy_wins)
    print("Draws:", draws)


if __name__ == "__main__":
    main()
