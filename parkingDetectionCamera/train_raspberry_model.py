import torch
from ultralytics import YOLO
import os
base_dir = os.getcwd()
dataset_yaml = base_dir+'/new_dataset/dataset.yaml'
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"Using device: {device}")
model = YOLO('parking_detection_model.pt')

# Train the model
model.train(
    data=dataset_yaml, 
    epochs=50, 
    batch=128,  
    imgsz=320,
    lr0=0.0001, 
    project='runs/partial_retrain',
    name='parking_detection_yolo',
    patience=10,
    save_period=5,
    device=device,
)

model = YOLO(base_dir+'/runs/partial_retrain/parking_detection_yolo/weights/best.pt')
model.export(format='onnx', imgsz=(320, 320))
model.export(format='ncnn', imgsz=(320, 320))