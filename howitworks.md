# Technical Overview: Fundus Image Classification System

## Abstract

This document outlines the technical architecture and operational mechanics of the Fundus Image Classification System. This system leverages deep learning, specifically Convolutional Neural Networks (CNNs), to automate the detection of ocular diseases from retinal fundus images. By utilizing Transfer Learning with a ResNet-18 backbone, the model achieves high accuracy in distinguishing between Normal eyes, Cataracts, Glaucoma, and Diabetic Retinopathy.

---

## 1. Introduction

The automated analysis of medical imaging is a critical advancement in modern diagnostics. This project implements a robust pipeline for training, deploying, and consuming a deep learning model capable of classifying retinal diseases. The system is composed of three distinct layers:
1.  **Deep Learning Core**: A PyTorch-based training pipeline.
2.  **Inference Engine**: A FastAPI backend for real-time analysis.
3.  **User Interface**: A React-based frontend for accessible interaction.

---

## 2. High-Level Operation (Plain English)

To the end-user, the system functions as an "instant specialist."

### 2.1 The "Trained Eye" Analogy
Imagine a specialist who has spent years analyzing thousands of eye scans. Over time, they develop an intuition for the subtle visual cues—microscopic hemorrhages, optic nerve cupping, or clouding—that signal disease.

Our Artificial Intelligence (AI) mirrors this process. During its "training" phase, the model was exposed to thousands of labeled examples of healthy and diseased eyes. Through this exposure, it learned to recognize the unique visual signatures (feature maps) associated with each condition, effectively becoming a specialized digital diagnostician.

### 2.2 The Analysis Process
When a user uploads an image:
1.  **Deconstruction**: The AI breaks the image down into a grid of millions of pixels.
2.  **Pattern Matching**: It compares the pixel arrangements against the millions of patterns it memorized during training.
3.  **Probabilistic Scoring**: It calculates a "confidence score" for each possible condition. A result of "98% Glaucoma" indicates that the uploaded image shares 98% of its visual characteristics with the confirmed Glaucoma cases the model has studied.

---

## 3. Technical Architecture

The system is built upon a modern, scalable stack designed for performance and maintainability.

### 3.1 Model Architecture: ResNet-18
We utilize the **ResNet-18** (Residual Neural Network) architecture. This is an 18-layer deep Convolutional Neural Network (CNN) that solves the "vanishing gradient" problem common in deep networks by using **skip connections**.

*   **Convolutional Layers**: These layers act as feature extractors, identifying edges, textures, and shapes.
*   **Residual Blocks**: These blocks allow the network to learn identity mappings, ensuring that deeper layers can learn as effectively as shallower ones.
*   **Fully Connected Layer (Head)**: The final layer flattens the learned features and maps them to our 4 specific output classes.

### 3.2 Transfer Learning Strategy
Rather than training the network from scratch (tabula rasa), we employ **Transfer Learning**.
1.  **Pre-training**: The model is initialized with weights pre-trained on **ImageNet**, a massive dataset of 1.2 million everyday images. This gives the model a foundational understanding of visual structure (e.g., how to detect curves and gradients).
2.  **Fine-tuning**: We replace the final classification layer with a new linear layer adapted to our 4 classes. We then retrain the network on our specific medical dataset, allowing it to repurpose its general visual knowledge for the specific task of retinal disease detection.

---

## 4. Training Pipeline

The training process is orchestrated via `train.py` and involves several critical steps to ensure robustness and generalization.

### 4.1 Data Preprocessing & Augmentation
To prevent overfitting and improve model generalization, we apply rigorous data transformations:
*   **Normalization**: Pixel values are normalized using ImageNet mean `[0.485, 0.456, 0.406]` and standard deviation `[0.229, 0.224, 0.225]`.
*   **Augmentation (Train only)**:
    *   `RandomHorizontalFlip()`: Simulates different eye orientations.
    *   `RandomRotation(10)`: Accounts for slight variations in head positioning during scanning.
*   **Resizing**: All images are standardized to `224x224` pixels to match the ResNet-18 input requirement.

### 4.2 Optimization Configuration
*   **Loss Function**: `CrossEntropyLoss` is used to penalize the difference between the predicted probability distribution and the actual ground truth labels.
*   **Optimizer**: Stochastic Gradient Descent (SGD) with:
    *   **Learning Rate**: `0.001` (conservative to preserve pre-trained features).
    *   **Momentum**: `0.9` (to accelerate convergence in relevant directions).
*   **Scheduler**: `StepLR` decays the learning rate by a factor of `0.1` every 7 epochs, allowing the model to settle into a finer minimum as training progresses.

---

## 5. Inference Engine & Deployment

The trained model (`best_model.pth`) is served via a high-performance **FastAPI** backend.

### 5.1 The Prediction Flow
When a request hits the `/predict` endpoint:
1.  **Input Handling**: The image is received as a byte stream and converted to an RGB tensor.
2.  **Preprocessing**: The same normalization and resizing transforms used during validation are applied.
3.  **Forward Pass**:
    ```python
    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
    ```
    The model outputs raw logits, which are passed through a **Softmax** function to convert them into a probability distribution summing to 1.0.
4.  **Response**: The API returns the predicted class, the confidence score, and the full probability distribution for client-side visualization.

### 5.2 Frontend Integration
The frontend is a **React** application built with **Vite**. It handles:
*   **Image Upload**: Drag-and-drop interface for user convenience.
*   **State Management**: Real-time feedback during the asynchronous inference request.
*   **Visualization**: Displays the confidence score and probability breakdown using dynamic UI components.

---

## 6. Conclusion

This project demonstrates the efficacy of Transfer Learning in medical imaging. By adapting a general-purpose vision model (ResNet-18) to a specialized domain, we achieve high diagnostic accuracy with a relatively small dataset, providing a powerful tool for early disease detection.
