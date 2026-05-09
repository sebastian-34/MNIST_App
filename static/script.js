const loadButton = document.getElementById('loadButton');
const predictButton = document.getElementById('predictButton');
const imageCanvas = document.getElementById('imageCanvas');
const indexText = document.getElementById('indexText');
const labelText = document.getElementById('labelText');
const predictionResult = document.getElementById('predictionResult');
const emojiDisplay = document.getElementById('emojiDisplay');
const accuracyText = document.getElementById('accuracyText');
const ctx = imageCanvas.getContext('2d');

// Set canvas size (28x28 pixels * scale factor for large display)
const pixelSize = 10; // Each MNIST pixel becomes 10x10 pixels on canvas

let currentImageData = null;
let currentImageIndex = null;
let currentTrueLabel = null;

loadButton.addEventListener('click', async () => {
    loadButton.disabled = true;
    loadButton.textContent = 'Loading...';
    predictButton.disabled = true;
    
    try {
        const response = await fetch('/image');
        const data = await response.json();
        
        currentImageData = data.image;
        currentImageIndex = data.index;
        currentTrueLabel = data.label;
        
        displayImage(data.image, data.label);
        predictButton.disabled = false;
        
        // Reset prediction display
        predictionResult.innerHTML = '<p>Click "Send Image" to get prediction</p>';
        emojiDisplay.textContent = '';
        accuracyText.textContent = '';
        accuracyText.className = 'accuracy-text';
    } catch (error) {
        console.error('Error fetching image:', error);
        labelText.textContent = 'Error loading image';
        predictButton.disabled = true;
    } finally {
        loadButton.disabled = false;
        loadButton.textContent = 'Load Random Image';
    }
});

predictButton.addEventListener('click', async () => {
    if (currentImageIndex === null) return;
    
    predictButton.disabled = true;
    predictButton.textContent = 'Predicting...';
    
    try {
        const response = await fetch(`/predict?index=${currentImageIndex}`);
        const data = await response.json();
        
        displayPrediction(data.prediction, data.true_label);
    } catch (error) {
        console.error('Error getting prediction:', error);
        predictionResult.innerHTML = '<p>Error getting prediction</p>';
    } finally {
        predictButton.disabled = false;
        predictButton.textContent = 'Send Image';
    }
});

function displayImage(imageData, label) {
    const canvasSize = 28 * pixelSize;
    imageCanvas.width = canvasSize;
    imageCanvas.height = canvasSize;
    
    // Draw the image
    for (let y = 0; y < 28; y++) {
        for (let x = 0; x < 28; x++) {
            const pixelValue = imageData[y][x];
            const grayscale = Math.floor(pixelValue * 255);
            
            ctx.fillStyle = `rgb(${grayscale}, ${grayscale}, ${grayscale})`;
            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
    }
    
    indexText.textContent = `Index: ${currentImageIndex}`;
    labelText.textContent = `True Label: ${label}`;
}

function displayPrediction(prediction, trueLabel) {
    const isCorrect = prediction === trueLabel;
    
    // Display the predicted number
    predictionResult.innerHTML = `
        <p>Predicted Digit:</p>
        <div class="prediction-number">${prediction}</div>
    `;
    
    // Display emoji based on correctness
    if (isCorrect) {
        emojiDisplay.textContent = '😊';
        accuracyText.textContent = `✓ Correct! (True: ${trueLabel})`;
        accuracyText.className = 'accuracy-text correct';
    } else {
        emojiDisplay.textContent = '😞';
        accuracyText.textContent = `✗ Incorrect (True: ${trueLabel})`;
        accuracyText.className = 'accuracy-text incorrect';
    }
}

// Load an image when the page first loads
window.addEventListener('load', () => {
    loadButton.click();
});
