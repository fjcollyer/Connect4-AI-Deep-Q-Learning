# Connect4 AI: Deep Q-Learning

## Website
https://connect4-ai-liard.vercel.app/

## Preview
![Preview of project UI](preview.gif)

## Running the Project Locally

To run Connect4 AI: Deep Q-Learning locally, follow these steps:

### 1. Prerequisites

Before running the project, ensure you have the following installed:
- Python 3
- pip3
- Node.js and npm

### 2. Clone the Repository
```bash
- git clone https://github.com/fjcollyer/Connect4-AI-Deep-Q-Learning.git
- cd Connect4-AI-Deep-Q-Learning
```

### 3. Run the API that serves the Deep Q-Learning Model
```bash
- cd api
- pip3 install -r requirements.txt
- python3 app.py
```

### 4. Run the UI
```bash
- cd ui
- npm i
- npm run dev
```

### 5. Note
By default the API will run on http://127.0.0.1:8080. If if runs on a differnet port you must update the code in "ui/src/Game.js" to use the correct URL.

## Training the model
To train a new version of the model, follow these steps:

### 1. Set hyperparameters and paramaters
In "api/train/main.py" there is a Config class that contains most of the important hyperparamaters and paramaters.

### 2. Run the training script
```bash
- cd api
- python3 -m train.main
```
This will generate "api/agents/" where the model is periodically saved to.

### 3. Run final evaluation of the model
```bash
- python3 -m train.sim_vs_random
```
This play the saved models from "api/agents/" against an opponent that makes random moves. When done it will plot the performance of the differant itterations of the model and save it to "2024learning_progression.png". 