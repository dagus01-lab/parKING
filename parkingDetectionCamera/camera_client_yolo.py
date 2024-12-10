import time
import cv2
import os
import pickle
import zlib
import socket
import numpy as np
import requests
from ultralytics import YOLO

def is_frame_similar(frame1, frame2, threshold=5):
    if frame1 is None or frame2 is None:
        return False
    gray1 = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)
    diff = cv2.absdiff(gray1, gray2)
    mean_diff = np.mean(diff)
    return mean_diff < threshold

def write_labels_images(results: list, save_dir: str):
    image_path = os.path.join(save_dir, f'image_{int(time.time())}.jpg')
    annotation_path = os.path.join(save_dir, f'image_{int(time.time())}.txt')
    cv2.imwrite(image_path, frame)
    
    with open(annotation_path, "w") as f:
        for result in results:
            # Iterate over detected objects
            for obj in result.boxes:
                class_id = int(obj.cls)  # Class ID
                x_center, y_center, width, height = obj.xywhn[0].tolist()  # Normalized bbox
                f.write(f"{class_id} {x_center} {y_center} {width} {height}\n")

            # Check if segmentation is enabled
            if hasattr(result, 'masks') and result.masks is not None:
                for obj, mask in zip(result.boxes, result.masks):
                    class_id = int(obj.cls)  # Class ID
                    # Get polygon vertices from mask
                    polygons = mask.xy  # List of polygons for the mask
                    for poly in polygons:
                        polygon_str = " ".join(map(str, poly.flatten().tolist()))
                        f.write(f"{class_id} {polygon_str}\n")

    print(f"Annotations saved for image {image_path} to {annotation_path}")

def update_results_to_server(server_url:str, estimations: dict):
    parkLot={
        "id": 10,
        "name": "test",
        "updateDateTime": time.time(),
        "totalParkings": 2,
        "availableParkings": 0,
        "occupiedParkings":0,
        "coordinate": {
            "latitude":44.48761404106161,
            "longitude": 11.32700949374767
        }
    }
    parkLot["occupiedParkings"]=estimations["occupied"]
    parkLot["availableParkings"]=estimations["available"]
    parkLot["totalParkings"]=estimations["available"]+estimations["occupied"]
    parkLot["updateDateTime"]=time.time()
    requests.put(server_url,json=parkLot)

parkompass_server_url="http://192.168.1.2:3000/api/parkingLots"
camera_server_ip = '192.168.1.102'
camera_server_port = 12345
client_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

save_dir = 'unsure_images'
os.makedirs(save_dir, exist_ok=True)
prev_frame = None
threshold = 0.3
if __name__ == '__main__':
    model = YOLO('parking_detection.onnx')

    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 320)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 320)
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if not is_frame_similar(frame, prev_frame):
            # If the current frame is different from the previous one, perform inference
            results = model(frame, imgsz=(320,320), iou=0.8,confidence=0.5)
            annotated_frame = results[0].plot()
            _, frame_encoded = cv2.imencode('.jpg', annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            data = zlib.compress(pickle.dumps(frame_encoded))
            client_socket.sendto(data, (camera_server_ip, camera_server_port))
            for pred in results[0].boxes.data: 
                conf = float(pred[4])  
                if conf < threshold:
                    write_labels_images(results, save_dir)
        prev_frame = frame.copy()
        estimations = {
            "occupied": sum(1 for result in results if int(result.cls) == 1),
            "available": sum(1 for result in results if int(result.cls) == 0)  
        }
        if prev_estimations != estimations:
            update_results_to_server(parkompass_server_url, estimations)
        prev_estimations = estimations

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()