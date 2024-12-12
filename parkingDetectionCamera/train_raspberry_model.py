import torch
from ultralytics import YOLO
import os
base_dir = os.getcwd()
dataset_yaml = base_dir+'/new_dataset/dataset.yaml'
initial_dataset_yaml = base_dir+'/dataset/data.yaml'
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"Using device: {device}")
model = YOLO('parking_detection_model_yolo11.pt')

# Train the model
model.train(
    data=dataset_yaml, 
    epochs=90, 
    batch=128,  
    imgsz=320,
    lr0=0.0001, 
    project='runs/partial_retrain',
    name='finetuning_yolov11',
    patience=10,
    save_period=5,
    device=device,
)
model.train(
    data=dataset_yaml, 
    epochs=30, 
    batch=128,  
    imgsz=320,
    lr0=0.0001, 
    project='runs/partial_retrain',
    name='calibration_yolov11',
    patience=10,
    save_period=5,
    device=device,
)
model = YOLO(base_dir+'/runs/partial_retrain/calibration_yolov11/weights/best.pt')
model.export(format='onnx', imgsz=(320, 320))
model.export(format='ncnn', imgsz=(320, 320))