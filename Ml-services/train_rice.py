import torch
import torch.nn as nn
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import os

# -------- CONFIG --------
TRAIN_DIR = "datasets/rice/train"
VAL_DIR = "datasets/rice/val"
BATCH_SIZE = 8
EPOCHS = 8
IMG_SIZE = 224
MODEL_PATH = "rice_mobilenet.pth"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# -------- TRANSFORMS --------
train_tfms = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
])

val_tfms = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
])

# -------- DATASETS --------
train_ds = datasets.ImageFolder(TRAIN_DIR, transform=train_tfms)
val_ds = datasets.ImageFolder(VAL_DIR, transform=val_tfms)

train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE)

NUM_CLASSES = len(train_ds.classes)
print("Classes:", train_ds.classes)

# -------- MODEL --------
model = models.mobilenet_v2(pretrained=True)

# Freeze backbone
for param in model.features.parameters():
    param.requires_grad = False

# Replace classifier
model.classifier[1] = nn.Linear(
    model.classifier[1].in_features,
    NUM_CLASSES
)

model = model.to(DEVICE)

# -------- TRAIN SETUP --------
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.classifier.parameters(), lr=0.001)

# -------- TRAIN LOOP --------
for epoch in range(EPOCHS):
    model.train()
    train_loss = 0

    for imgs, labels in train_loader:
        imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)

        optimizer.zero_grad()
        outputs = model(imgs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        train_loss += loss.item()

    print(f"Epoch {epoch+1}/{EPOCHS} - Loss: {train_loss:.4f}")

# -------- SAVE MODEL --------
torch.save({
    "model_state": model.state_dict(),
    "classes": train_ds.classes
}, MODEL_PATH)

print("✅ Model trained & saved as", MODEL_PATH)
