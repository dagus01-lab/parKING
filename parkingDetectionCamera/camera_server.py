import cv2
import socket
import pickle
import zlib  

server_ip = '0.0.0.0'  
server_port = 12345

# Set up the socket
server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
server_socket.bind((server_ip, server_port))

print(f"Listening on {server_ip}:{server_port}")

while True:
    try:
        data, addr = server_socket.recvfrom(65536)
        frame_encoded = pickle.loads(zlib.decompress(data))
        frame = cv2.imdecode(frame_encoded, cv2.IMREAD_COLOR)
        resized_frame = cv2.resize(frame, (640, 640), interpolation=cv2.INTER_LINEAR)

        cv2.imshow("Stream", resized_frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    except KeyboardInterrupt:
        print("Streaming stopped.")
        break
    except Exception as e:
        print(f"Error: {e}")
        continue
server_socket.close()
cv2.destroyAllWindows()
