# Connect4 AI: Deep Q-Learning

## Website
[https://connect4-ai-liard.vercel.app/](https://connect4-ai-liard.vercel.app/)

## Preview
![Preview of project UI](preview.gif)

## Description
This is a 3D web application enabling users to play Connect4 against an AI trained through self-play using deep Q-learning. The AI, having learned strategies from over 300,000 self-play games, is served through a backend system utilizing TensorFlow, which the web app consults to determine the AI's moves.

## Running the Project Locally

### 1. Prerequisites

- Python3 (3.11.7)
- pip3 (23.2.1)
- Node.js (v20.10.0)
- npm (10.3.0)

### 2. Clone the Repository
```bash
git clone https://github.com/fjcollyer/Connect4-AI-Deep-Q-Learning.git &&
cd Connect4-AI-Deep-Q-Learning
```

### 3. Run the API that serves the Deep Q-Learning Model
```bash
cd api &&
pip3 install -r requirements.txt &&
python3 app.py
```

### 4. Run the UI
```bash
cd ui &&
npm i &&
npm run dev
```

### 5. Note
By default the API will run on http://127.0.0.1:8080. If it runs on a different port you must update the code in "ui/src/Game.js" to use the correct URL.

## Training the model

### 1. Set hyperparameters and parameters
In "api/train/main.py" there is a Config class that contains most of the important hyperparameters and parameters.

### 2. Run the training script 
```bash
cd api &&
python3 -m train.main
```
This will generate "api/agents/" where the model is periodically saved to.

### 3. Run final evaluation of the model  
```bash
python3 -m train.sim_vs_random
```
This plays the saved models from 'api/agents/' against an opponent that makes random moves. When done it will plot the performance of the different iterations of the model and save it to '2024learning_progression.png'.