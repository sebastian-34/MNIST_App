from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI
from torchvision import datasets
from torchvision.transforms import ToTensor
import torch
import torch.nn as nn
import os
import random

# Create data directory if it doesn't exist
os.makedirs("./data", exist_ok=True)

# Download and load MNIST dataset
print("Downloading MNIST dataset...")
train_data = datasets.MNIST(
    root="./data",
    train=True,
    download=True,
    transform=ToTensor()
)

test_data = datasets.MNIST(
    root="./data",
    train=False,
    download=True,
    transform=ToTensor()
)

print(f"Training set size: {len(train_data)}")
print(f"Test set size: {len(test_data)}")
print("MNIST dataset downloaded and loaded successfully!")

# Define and load the model
model = nn.Sequential(
    nn.Flatten(),
    nn.Linear(784, 128),
    nn.ReLU(),
    nn.Linear(128, 64),
    nn.ReLU(),
    nn.Linear(64, 10)
)

# Load the saved weights
model.load_state_dict(torch.load("model.pth"))
model.eval()


app = FastAPI()

@app.get("/image")
def get_image():
    """Return a random image from the test set as a list of lists with its index"""
    random_idx = random.randint(0, len(test_data) - 1)
    image_tensor, label = test_data[random_idx]
    
    # Convert tensor to list of lists
    image_list = image_tensor.squeeze(0).tolist()
    
    return {
        "image": image_list,
        "index": random_idx,
        "label": int(label)
    }

@app.get("/predict")
def predict(index: int):
    """Get an image from the test set at the given index and return the model's prediction"""
    # Get the image from test set
    image_tensor, true_label = test_data[index]
    
    # Add batch dimension and make prediction
    with torch.no_grad():
        output = model(image_tensor.unsqueeze(0))
        prediction = output.argmax(dim=1).item()
    
    return {
        "index": index,
        "prediction": prediction,
        "true_label": int(true_label)
    }

app.mount("/", StaticFiles(directory="static", html=True), name="static")