# main.py
import cProfile
import pstats
import os
import shutil
import time
import torch

from .train import Trainer


class Config:
    EPISODES = 100000
    SAVE_MODEL_FREQUENCY = 3000
    SAVE_FOLDER = './agents/'

    # Epsilon
    EPSILON_START = 1.0
    EPSILON_END = 0.01
    EPSILON_DECAY_RATE = 0.9999
    # random_starting_moves = random.randint(0, self.config.RANDOM_STARTING_MOVES) * 2
    RANDOM_STARTING_MOVES = 0

    # Update model & target network
    TAU = 0.001
    UPDATE_MODEL_FREQUENCY = 5
    UPDATE_TARGET_NETWORK_FREQUENCY = 1

    # Evaluation
    EVALUATE_FREQUENCY = 800
    NUM_ENEMIES = 4

    # Tournament - currently not used
    TOURNAMENT_ENABLED = False
    TOURNAMENT_FREQUENCY = 10000000000  # Huge number to disable tournament
    TOURNAMENT_EPSILON = 0
    TOURNAMENT_GAMES = 100
    TOURNAMENT_MIN_TOTAL_ENEMIES = 6
    TOURNAMENT_COUNT_ENEMIES = 12

    # Replay buffer
    BUFFER_SIZE = 200000
    BATCH_SIZE = 512

    GAMMA = 1
    LEARNING_RATE = 0.0001
    # WEIGHT_DECAY = 0.01

    # We are running this on Google Cloud Run which supports CPU
    DEVICE = torch.device("cpu")

    # Rewards
    REWARD_WIN = 1
    REWARD_LOSE = -1
    REWARD_DRAW = -0.25
    REWARD_STEP = 0

    # Connect4
    ROWS = 6
    COLUMNS = 7
    WINNING_LENGTH = 4

    # Debug
    VIZUALIZE = False


def main():
    start = time.time()

    # Delete and recreate ./agents at each run
    if os.path.exists(Config.SAVE_FOLDER) and Config.SAVE_FOLDER == "./agents/":
        shutil.rmtree(Config.SAVE_FOLDER)
    os.makedirs(Config.SAVE_FOLDER)

    # Train
    trainer = Trainer(Config)
    trainer.train()

    end = time.time()
    print(f'Time taken: {end - start} seconds')


if __name__ == '__main__':
    profiler = cProfile.Profile()
    profiler.enable()
    main()
    profiler.disable()
    stats = pstats.Stats(profiler).sort_stats('cumulative')
    stats.print_stats(10)
