import os
from flask import Flask, request, jsonify
import numpy as np
import torch

from train.dqn_agent import DQNAgent
from train.main import Config

app = Flask(__name__)

# Loading the trained model
MODEL_PATH = "./train/agents_saved/model_299999.pt"

agent = None
config = Config()
agent = DQNAgent(config)
agent.dqn_net.load_state_dict(torch.load(
    MODEL_PATH, map_location=config.DEVICE))
agent.dqn_net.eval()


def handle_cors(response):
    """
    Add CORS headers to the given response.
    """
    origin = request.headers.get('Origin', '')
    response.headers.add('Access-Control-Allow-Origin', origin)
    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods',
                         'GET,PUT,POST,DELETE,OPTIONS')
    return response


@app.route("/get_action", methods=["POST", "OPTIONS"])
def get_action():
    if request.method == "OPTIONS":
        return handle_cors(jsonify({}))

    state = request.json['state']
    epsilon = request.json.get('epsilon', 0.1)
    action = agent.get_action(np.array(state), epsilon)
    response = jsonify({'action': action})
    return handle_cors(response)


@app.route("/get_q_values", methods=["POST", "OPTIONS"])
def get_q_values():
    if request.method == "OPTIONS":
        return handle_cors(jsonify({}))

    state = request.json['state']
    q_values = agent.get_q_values(np.array(state))
    response = jsonify({'q_values': q_values.tolist()})
    return handle_cors(response)


if __name__ == "__main__":
    port = int(os.environ.get('PORT', 8080))
    app.run(debug=False, host='0.0.0.0', port=port)
