import requests
import json

# Base URL of your deployed service or localhost if running locally
BASE_URL = "http://127.0.0.1:8080"


def test_get_action(state, epsilon=0.1):
    endpoint = "/get_action"
    payload = {
        "state": state,
        "epsilon": epsilon
    }
    response = requests.post(BASE_URL + endpoint, json=payload)
    if response.status_code == 200:
        return response.json()
    else:
        print("Error:", response.status_code, response.text)
        return None


def test_get_q_values(state):
    endpoint = "/get_q_values"
    payload = {
        "state": state
    }
    response = requests.post(BASE_URL + endpoint, json=payload)
    if response.status_code == 200:
        return response.json()
    else:
        print("Error:", response.status_code, response.text)
        return None


if __name__ == "__main__":
    # Sample Connect4 board state
    sample_state = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, -1, 0, 0],
        [0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, -1, 0, 0],
        [0, 0, 0, 1, -1, 0, 0],
        [0, 0, 0, 1, -1, 0, 0]
    ]

    print("Testing /get_action endpoint...")
    action_result = test_get_action(sample_state)
    if action_result:
        print("Received action:", action_result["action"])

    print("\nTesting /get_q_values endpoint...")
    q_values_result = test_get_q_values(sample_state)
    if q_values_result:
        print("Received Q-values:", q_values_result["q_values"])
