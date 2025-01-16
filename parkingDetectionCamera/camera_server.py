import cv2
import socket
import pickle
import zlib
import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Camera Server")
    parser.add_argument("--port", type=int, default=12345, help="Server port to bind to (default: 12345)")
    args = parser.parse_args()

    server_ip = "0.0.0.0"
    server_port = args.port

    server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    server_socket.bind((server_ip, server_port))

    print(f"Listening on {server_ip}:{server_port}")

    try:
        while True:
            try:
                data, addr = server_socket.recvfrom(65536)
                frame_encoded = pickle.loads(zlib.decompress(data))
                frame = cv2.imdecode(frame_encoded, cv2.IMREAD_COLOR)
                resized_frame = cv2.resize(frame, (640, 640), interpolation=cv2.INTER_LINEAR)

                cv2.imshow("Stream", resized_frame)

                if cv2.waitKey(1) & 0xFF == ord('q'):
                    print("Streaming stopped by user.")
                    break

            except KeyboardInterrupt:
                print("Streaming stopped by user.")
                break
            except Exception as e:
                print(f"Error: {e}")
                continue

    finally:
        server_socket.close()
        cv2.destroyAllWindows()
