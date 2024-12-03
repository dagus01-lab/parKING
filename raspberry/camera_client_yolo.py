import time
import cv2
import os
import pickle
import zlib
import socket
from ultralytics import YOLO

server_ip = '192.168.1.102'
server_port = 12345
client_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

model = YOLO('parking_detection.onnx')

cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 320)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 320)

save_dir = 'unsure_images'
os.makedirs(save_dir, exist_ok=True)

threshold = 0.3

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Perform inference
    results = model(frame, imgsz=(320,320))
    annotated_frame = results[0].plot()
    _, frame_encoded = cv2.imencode('.jpg', annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
    data = zlib.compress(pickle.dumps(frame_encoded))
    client_socket.sendto(data, (server_ip, server_port))
    for pred in results[0].boxes.data: 
        conf = float(pred[4])  
        if conf < threshold:
            image_path = os.path.join(save_dir, f'image_{int(time.time())}.jpg')
            annotation_path = os.path.join(save_dir, f'image_{int(time.time())}.pkl')
            cv2.imwrite(image_path, frame)
            
            with open(annotation_path, 'wb') as f:
                pickle.dump(results[0].boxes.xyxy.numpy(), f)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()