import time
import cv2
import os
import pickle
import zlib
import socket
import numpy as np
import requests
from ultralytics import YOLO
import argparse

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
            for obj in result.boxes:
                class_id = int(obj.cls)  
                x_center, y_center, width, height = obj.xywhn[0].tolist() 
                f.write(f"{class_id} {x_center} {y_center} {width} {height}\n")

            # Check if segmentation is enabled
            if hasattr(result, 'masks') and result.masks is not None:
                for obj, mask in zip(result.boxes, result.masks):
                    class_id = int(obj.cls)  
                    # Get polygon vertices from mask
                    polygons = mask.xy  
                    for poly in polygons:
                        polygon_str = " ".join(map(str, poly.flatten().tolist()))
                        f.write(f"{class_id} {polygon_str}\n")

    print(f"Annotations saved for image {image_path} to {annotation_path}")

def update_results_to_server(server_url:str, estimations: dict, latitude: float, longitude: float):
    parkLot={
        "id": 10,
        "name": "smart_camera",
        "updateDateTime": time.time()*1000,
        "totalParkings": estimations["available"]+estimations["occupied"],
        "availableParkings": estimations["available"],
        "occupiedParkings":estimations["occupied"],
        "coordinate": {
            "latitude":latitude,
            "longitude": longitude
        }
    }
    requests.put(server_url,json=parkLot)
    
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Camera Server")
    parser.add_argument("--parkompass_server_api", type=str, default="http://192.168.1.85:3000/api/parkingLots", help="Parkompass Server API endpoint (used to update data on parking availability)")
    parser.add_argument("--camera_server_ip", type=str, default='192.168.1.102', help="Camera Server IP (used to stream real time predictions)")
    parser.add_argument("--camera_server_port", type=int, default=12345, help="Camera Server port")
    parser.add_argument("--save_unsure_preds", type=bool, default=False, help="Save unsure prediction images to disk (with annotations)")
    parser.add_argument("--latitude", type=float, default=44.48761404106161, help="Latitude of the camera")
    parser.add_argument("--longitude", type=float, default=11.32700949374767, help="Longitude of the camera")
    args = parser.parse_args()

    parkompass_server_url=args.parkompass_server_api
    camera_server_ip = args.camera_server_ip
    camera_server_port = args.camera_server_port
    save_unsure_preds = args.save_unsure_preds
    latitude = args.latitude
    longitude = args.longitude

    client_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    save_dir = 'unsure_images'
    os.makedirs(save_dir, exist_ok=True)
    prev_frame = None
    threshold = 0.3
    prev_estimations = {
                    "occupied": -1,
                    "available": -1 
                }

    
    model = YOLO('parking_detection_new.onnx')#'parking_detection_original.onnx')

    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 320)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 320)
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if not is_frame_similar(frame, prev_frame):
            # If the current frame is different from the previous one, perform inference
            results = model(frame, imgsz=(320,320), iou=0.8,conf=0.3)
            annotated_frame = results[0].plot()
            _, frame_encoded = cv2.imencode('.jpg', annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            data = zlib.compress(pickle.dumps(frame_encoded))
            client_socket.sendto(data, (camera_server_ip, camera_server_port))

            if save_unsure_preds:
                for pred in results[0].boxes.data: 
                    conf = float(pred[4])  
                    if conf < threshold:
                        write_labels_images(results, save_dir)
                        break

            prev_frame = frame.copy()
            estimations = {
                "occupied": sum(1 for result in results[0].boxes if int(result.cls) == 1),
                "available": sum(1 for result in results[0].boxes if int(result.cls) == 0)  
            }
            if prev_estimations != estimations:
                try:
                    update_results_to_server(parkompass_server_url, estimations, latitude, longitude)
                except Exception as e:
                    print(f"Error updating server: {str(e)}")
            prev_estimations = estimations

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()