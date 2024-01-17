import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
import random
import numpy as np
from collections import deque

class DQN(nn.Module):
    def __init__(self, input_shape, num_actions):
        super(DQN, self).__init__()

        # Two channels (AI and opponent) and two convolutional layers
        self.conv1 = nn.Conv2d(input_shape[0], 64, kernel_size=3, stride=1, padding=1)
        self.conv2 = nn.Conv2d(64, 128, kernel_size=3, stride=1, padding=1)

        self.fc1 = nn.Linear(128 * input_shape[1] * input_shape[2], 512)
        self.dropout = nn.Dropout(0.5)
        self.fc2 = nn.Linear(512, num_actions)

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = F.relu(self.conv2(x))
        x = x.view(x.size(0), -1)
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        return x

class DQNAgent:
    def __init__(self, config):
        self.config = config

        # Adjusted for 2 channels
        self.dqn_net = DQN((2, self.config.ROWS, self.config.COLUMNS), self.config.COLUMNS).to(self.config.DEVICE)
        self.target_net = DQN((2, self.config.ROWS, self.config.COLUMNS), self.config.COLUMNS).to(self.config.DEVICE)
        self.target_net.load_state_dict(self.dqn_net.state_dict())
        
        self.optimizer = optim.Adam(self.dqn_net.parameters(), lr=self.config.LEARNING_RATE)
        self.loss_fn = nn.SmoothL1Loss()

        self.buffer = deque(maxlen=self.config.BUFFER_SIZE)
        self.batch_size = self.config.BATCH_SIZE
        self.gamma = self.config.GAMMA

    def preprocess_state(self, state):
        """ Convert the 2D state into a 3D tensor with two channels """
        agent_channel = (state == 1).astype(np.float32)
        opponent_channel = (state == -1).astype(np.float32)
        
        return np.stack([agent_channel, opponent_channel], axis=0)

    def get_action(self, state, epsilon):
        preprocessed_state = self.preprocess_state(state)
        
        if np.random.random() < epsilon:
            return np.random.choice(self.config.COLUMNS)
        else:
            state_tensor = torch.tensor(preprocessed_state, dtype=torch.float).unsqueeze(0).to(self.config.DEVICE)
            q_values = self.dqn_net(state_tensor)
            return torch.argmax(q_values).item()

    def get_q_values(self, state):
        """Get Q-values for the given state."""
        preprocessed_state = self.preprocess_state(state)
        state_tensor = torch.tensor(preprocessed_state, dtype=torch.float).unsqueeze(0).to(self.config.DEVICE)
        q_values = self.dqn_net(state_tensor).detach().cpu().numpy()[0]
        return q_values

    def update(self):
        if len(self.buffer) < self.batch_size:
            return

        batch = random.sample(self.buffer, self.batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)

        states = [self.preprocess_state(s) for s in states]
        states_tensor = torch.tensor(np.array(states), dtype=torch.float).to(self.config.DEVICE)
        
        next_states = [self.preprocess_state(s) for s in next_states]
        next_states_tensor = torch.tensor(np.array(next_states), dtype=torch.float).to(self.config.DEVICE)

        actions_tensor = torch.tensor(np.array(actions), dtype=torch.long).to(self.config.DEVICE)
        rewards_tensor = torch.tensor(np.array(rewards), dtype=torch.float).to(self.config.DEVICE)
        dones_tensor = torch.tensor(np.array(dones), dtype=torch.float).to(self.config.DEVICE)

        q_values = self.dqn_net(states_tensor)
        next_q_values_online = self.dqn_net(next_states_tensor)
        next_q_values_target = self.target_net(next_states_tensor)

        q_value = q_values.gather(1, actions_tensor.unsqueeze(1)).squeeze(1)
        best_action_next_state = torch.argmax(next_q_values_online, dim=1)
        next_q_value = next_q_values_target.gather(1, best_action_next_state.unsqueeze(1)).squeeze(1)

        expected_q_value = rewards_tensor + self.gamma * next_q_value * (1 - dones_tensor)
        loss = self.loss_fn(q_value, expected_q_value.detach())

        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        return loss.item()

    def update_target_network(self):
        tau = self.config.TAU
        for target_param, param in zip(self.target_net.parameters(), self.dqn_net.parameters()):
            target_param.data.copy_(tau * param.data + (1.0 - tau) * target_param.data)