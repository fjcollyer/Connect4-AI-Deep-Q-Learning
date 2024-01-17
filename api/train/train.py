# train.py
import copy
import datetime
import random
import sys
import time
import numpy as np
import torch
from torch.utils.tensorboard import SummaryWriter

from .dqn_agent import DQNAgent
from .connect4 import Connect4


class Trainer:
    def __init__(self, config):
        print("config.DEVICE: " + str(config.DEVICE))
        self.config = config
        self.env = Connect4(config=config)
        self.agent = DQNAgent(config)

        self.enemies = [copy.deepcopy(self.agent)
                        for _ in range(self.config.NUM_ENEMIES)]
        self.all_past_enemies = [copy.deepcopy(self.agent)]

        self.agent_moved_first_vs_enemies = [
            0 for _ in range(self.config.NUM_ENEMIES)]
        self.agent_results_vs_enemies = [
            {'wins': 0, 'losses': 0, 'draws': 0} for _ in range(self.config.NUM_ENEMIES)]

        self.epsilon = self.config.EPSILON_START
        self.total_moves = 0
        current_time = datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        self.writer = SummaryWriter(f'runs/{current_time}')

    def play_game(self, enemy_index, first_player):
        self.env.reset(first_player)

        random_starting_moves = random.randint(
            0, self.config.RANDOM_STARTING_MOVES) * 2
        moves = 0

        delayed_buffer_update = None

        if first_player == 'agent':
            self.agent_moved_first_vs_enemies[enemy_index] += 1

        winner = False
        while not winner:
            # Decide epsilon
            if moves < random_starting_moves:
                agent_epsilon = 1
                enemy_epsilon = 1
            else:
                agent_epsilon = self.epsilon
                enemy_epsilon = self.epsilon

            # Get action
            if self.env.player == 'agent':
                cur_player = 'agent'
                action = self.agent.get_action(self.env.board, agent_epsilon)
            else:
                cur_player = 'enemy'
                action = self.enemies[enemy_index].get_action(
                    -self.env.board, enemy_epsilon)

            state = copy.deepcopy(self.env.board)
            # Make move can return: agent, enemy, draw, False
            winner = self.env.make_move(action)
            self.total_moves += 1
            next_state = copy.deepcopy(self.env.board)

            done = True if winner else False

            # Update agent's buffer
            viz = self.config.VIZUALIZE
            if cur_player == 'agent':
                if winner == 'agent':
                    # Agent won, apply win reward
                    self.visualize_transition(
                        state, action, self.config.REWARD_WIN, next_state, done) if viz else None
                    self.agent.buffer.append(
                        (state, action, self.config.REWARD_WIN, next_state, done))
                elif winner == 'enemy':
                    # Agent lost by making an invalid move, apply lose reward
                    self.visualize_transition(
                        state, action, self.config.REWARD_LOSE, next_state, done) if viz else None
                    self.agent.buffer.append(
                        (state, action, self.config.REWARD_LOSE, next_state, done))
                elif winner == 'draw':
                    # Agent drew, apply draw reward
                    self.visualize_transition(
                        state, action, self.config.REWARD_DRAW, next_state, done) if viz else None
                    self.agent.buffer.append(
                        (state, action, self.config.REWARD_DRAW, next_state, done))
                elif winner == False:
                    # Delay buffer update until after enemy's move
                    delayed_buffer_update = (state, action)

            elif cur_player == 'enemy':
                if delayed_buffer_update:
                    if winner == 'enemy':
                        # Enemy won, apply lose reward for agent
                        self.visualize_transition(
                            *delayed_buffer_update, self.config.REWARD_LOSE, next_state, done) if viz else None
                        self.agent.buffer.append(
                            (*delayed_buffer_update, self.config.REWARD_LOSE, next_state, done))
                    elif winner == 'agent':
                        # Enemy lost by making an invalid move, no need to update agent's buffer
                        pass
                    elif winner == 'draw':
                        # Game resulted in a draw after enemy's move, apply draw reward for agent
                        self.visualize_transition(
                            *delayed_buffer_update, self.config.REWARD_DRAW, next_state, done) if viz else None
                        self.agent.buffer.append(
                            (*delayed_buffer_update, self.config.REWARD_DRAW, next_state, done))
                    elif winner == False:
                        # Game is not over after enemy's move, apply step reward for agent
                        self.visualize_transition(
                            *delayed_buffer_update, self.config.REWARD_STEP, next_state, done) if viz else None
                        self.agent.buffer.append(
                            (*delayed_buffer_update, self.config.REWARD_STEP, next_state, done))

                    delayed_buffer_update = None

        return winner

    def train(self):
        for episode in range(self.config.EPISODES):
            enemy_index = episode % self.config.NUM_ENEMIES
            first_player = 'agent' if (
                episode // self.config.NUM_ENEMIES) % 2 == 0 else 'enemy'

            winner = self.play_game(enemy_index, first_player)

            # Track stats for evaluation
            if winner == 'agent':
                self.agent_results_vs_enemies[enemy_index]['wins'] += 1
            elif winner == 'enemy':
                self.agent_results_vs_enemies[enemy_index]['losses'] += 1
            elif winner == 'draw':
                self.agent_results_vs_enemies[enemy_index]['draws'] += 1

            # Update model
            if episode > 0 and episode % self.config.UPDATE_MODEL_FREQUENCY == 0:
                loss = self.agent.update()
                if loss is not None:
                    self.writer.add_scalar('Loss', loss, episode)

            # Update target network
            if episode > 0 and episode % self.config.UPDATE_TARGET_NETWORK_FREQUENCY == 0:
                self.agent.update_target_network()

            # Hold torunament
            if episode > 0 and episode % self.config.TOURNAMENT_FREQUENCY == 0 and len(self.all_past_enemies) >= self.config.TOURNAMENT_MIN_TOTAL_ENEMIES and self.config.TOURNAMENT_ENABLED:
                # randomly select past enemies and hold tournament
                count_enemies = self.config.TOURNAMENT_COUNT_ENEMIES if len(
                    self.all_past_enemies) >= self.config.TOURNAMENT_COUNT_ENEMIES else len(self.all_past_enemies)
                tournament_enemies = random.sample(
                    self.all_past_enemies, count_enemies)
                tournament_results = self.hold_tournament(tournament_enemies)
                print(f"\nTournament results: {tournament_results}")
                # Select the best 4 enemies
                sorted_indices = sorted(range(len(
                    tournament_results)), key=lambda x: tournament_results[x]['losses'], reverse=True)
                # Print the best 4 enemies
                print(f"\nBest {self.config.NUM_ENEMIES} enemies:")
                for i in range(self.config.NUM_ENEMIES):
                    print(
                        f"Agent result VS Enemy {i}: {tournament_results[sorted_indices[i]]}")
                self.enemies = [tournament_enemies[i]
                                for i in sorted_indices[:self.config.NUM_ENEMIES]]

                # Reset stats
                self.agent_results_vs_enemies = [
                    {'wins': 0, 'losses': 0, 'draws': 0} for _ in range(self.config.NUM_ENEMIES)]
                self.agent_moved_first_vs_enemies = [
                    0 for _ in range(self.config.NUM_ENEMIES)]
                self.total_moves = 0

            # Evaluate agent (not if tournament was held)
            if episode > 0 and episode % self.config.EVALUATE_FREQUENCY == 0 and episode % self.config.TOURNAMENT_FREQUENCY != 0:
                avarage_moves = self.total_moves / self.config.EVALUATE_FREQUENCY
                print(
                    f"\nEvaluation time! Episode: {episode} - Epsilon: {self.epsilon:.2f}")
                print(f"Avarage moves per game: {avarage_moves:.2f}")
                for i, result in enumerate(self.agent_results_vs_enemies):
                    print(
                        f"Agent stats vs enemy {i}: W: {result['wins']} - L: {result['losses']} - D: {result['draws']} - moved first: {self.agent_moved_first_vs_enemies[i]}")
                # Check if agent is good enough
                if all(result['wins'] >= result['losses'] for result in self.agent_results_vs_enemies):
                    self.enemies = self.enemies[1:] + \
                        [copy.deepcopy(self.agent)]
                    print(f"\n*** Evaluation successful! ***")
                    # Keep track of all past enemies for tournament
                    if self.config.TOURNAMENT_ENABLED:
                        self.all_past_enemies.append(copy.deepcopy(self.agent))
                        print(
                            f"Total number of enemies: {len(self.all_past_enemies)}\n")
                # Reset stats
                self.agent_results_vs_enemies = [
                    {'wins': 0, 'losses': 0, 'draws': 0} for _ in range(self.config.NUM_ENEMIES)]
                self.agent_moved_first_vs_enemies = [
                    0 for _ in range(self.config.NUM_ENEMIES)]
                self.total_moves = 0

            # Save model
            if episode > 0 and episode % self.config.SAVE_MODEL_FREQUENCY == 0:
                torch.save(self.agent.dqn_net.state_dict(),
                           self.config.SAVE_FOLDER + f"model_{episode}.pt")

            # Decay epsilon
            if self.epsilon > self.config.EPSILON_END:
                self.epsilon *= self.config.EPSILON_DECAY_RATE
                if self.epsilon < self.config.EPSILON_END:
                    self.epsilon = self.config.EPSILON_END

        print(f"\nFinal model saved. Episode: {self.config.EPISODES}")
        torch.save(self.agent.dqn_net.state_dict(),
                   self.config.SAVE_FOLDER + f"model_{episode}.pt")

    def hold_tournament(self, tournament_enemies):
        # Keep track of agent's wins, losses, and draws vs each enemy
        tournament_stats = [{'wins': 0, 'losses': 0, 'draws': 0}
                            for _ in range(len(tournament_enemies))]
        game = Connect4(config=self.config)
        torunament_epsilon = self.config.TOURNAMENT_EPSILON
        # Agent plays vs each of the 12 enemies - 50 times as first player, 50 times as second player
        for enemy_index in range(len(tournament_enemies)):
            # Agent moves first for 50 games and second for 50 games
            for game_num in range(self.config.TOURNAMENT_GAMES):
                winner = False
                if game_num < 50:
                    game.reset('agent')
                else:
                    game.reset('enemy')
                while not winner:
                    if game.player == 'agent':
                        action = self.agent.get_action(
                            game.board, torunament_epsilon)
                        if action not in game.get_valid_actions():
                            winner = 'enemy'
                    else:
                        action = tournament_enemies[enemy_index].get_action(
                            -game.board, torunament_epsilon)
                        if action not in game.get_valid_actions():
                            winner = 'agent'

                    if winner == False:
                        winner = game.make_move(action)

                # print()
                # print(winner)
                # print(game.board)
                # print()
                if winner == 'agent':
                    tournament_stats[enemy_index]['wins'] += 1
                elif winner == 'enemy':
                    tournament_stats[enemy_index]['losses'] += 1
                elif winner == 'draw':
                    tournament_stats[enemy_index]['draws'] += 1
        return tournament_stats

    def visualize_transition(self, state, action, reward, next_state, done):
        # Replace agent pieces with 'A' and opponent's pieces with 'E'
        visual_state = np.where(
            state == 1, 'A', np.where(state == -1, 'E', state))
        visual_next_state = np.where(
            next_state == 1, 'A', np.where(next_state == -1, 'E', next_state))

        print("\n--------------")
        print("State:\n", visual_state)
        print("Action:", action)
        print("Reward:", reward)
        print("Next State:\n", visual_next_state)
        print("Done:", done)
        print("--------------\n")
        time.sleep(1)  # Sleep for 1 second
