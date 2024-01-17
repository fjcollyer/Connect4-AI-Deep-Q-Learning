# sim_vs_random.py
import os
import torch
import matplotlib.pyplot as plt
from collections import defaultdict
import random

from .main import Config
from .dqn_agent import DQNAgent
from .connect4 import Connect4

EPISODES = 500


def create_agent(model_path, config):
    agent = DQNAgent(config)
    agent.dqn_net.load_state_dict(torch.load(model_path))
    return agent


def run_simulation(agent, config, agent_moves_first=True):
    game = Connect4(config=config)
    wins = 0
    invalid_moves = 0
    total_moves = 0  # track total moves for all games
    starting_player = 'agent' if agent_moves_first else 'enemy'
    for episode in range(EPISODES):
        game.reset(starting_player)

        winner = None
        moves_count = 0  # track moves for this game
        while not winner:
            moves_count += 1
            if game.player == 'agent':
                action = agent.get_action(game.board, 0.0)
                if action not in game.get_valid_actions():
                    invalid_moves += 1
                    winner = 'enemy'
                    continue
            else:  # Random opponent's turn
                action = random.choice(game.get_valid_actions())

            winner = game.make_move(action)

        if winner == 'agent':
            wins += 1

        total_moves += moves_count

    avg_moves_per_game = total_moves / EPISODES if EPISODES else 0
    return wins / EPISODES, invalid_moves / EPISODES, avg_moves_per_game


def run_simulations():
    data = defaultdict(lambda: [])
    print(f"Running simulations for the trained agent.")
    model_files = [f for f in os.listdir(Config.SAVE_FOLDER) if 'model_' in f]
    for model_file in sorted(model_files, key=lambda x: int(x.split('model_')[1].split('.pt')[0])):
        print(model_file)
        episodes = int(model_file.split('model_')[1].split('.pt')[0])
        agent = create_agent(Config.SAVE_FOLDER + model_file, Config)
        for agent_moves_first, label in [(True, 'first'), (False, 'second')]:
            win_rate, invalid_move_rate, avg_moves = run_simulation(
                agent, Config, agent_moves_first)
            data_point = {"episode_num": episodes, "win_rate": win_rate,
                          "invalid_move_rate": invalid_move_rate, "avg_moves": avg_moves}
            for key in data_point.keys():
                if key != 'episode_num':
                    data[key + '_when_moving_' +
                         label].append((episodes, data_point[key]))
    plot_rates(data)
    print("Done")


def plot_rates(data):
    fig, axs = plt.subplots(3, 2, figsize=(15, 15))

    labels = ['when_moving_first', 'when_moving_second']
    for i, label in enumerate(labels):
        for key, subplot in zip(['win_rate', 'invalid_move_rate', 'avg_moves'], axs[:, i]):
            data[key + '_' + label].sort(key=lambda x: x[0])
            episodes, rates = zip(*data[key + '_' + label])
            subplot.plot(episodes, rates, marker='o',
                         label=f'Agent {label.replace("_", " ").title()}')

    for i, ylabel in enumerate(['Win Rate', 'Invalid Move Rate', 'Average Moves']):
        axs[i, 0].set_title('Agent Learning Progression When Moving First')
        axs[i, 1].set_title('Agent Learning Progression When Moving Second')
        axs[i, 0].set_xlabel('Episodes')
        axs[i, 1].set_xlabel('Episodes')
        axs[i, 0].set_ylabel(ylabel)
        axs[i, 1].set_ylabel(ylabel)
        axs[i, 0].legend()
        axs[i, 1].legend()
        axs[i, 0].grid(True)
        axs[i, 1].grid(True)

    plt.tight_layout()
    plt.savefig('2024learning_progression.png')
    plt.show()


if __name__ == "__main__":
    run_simulations()
