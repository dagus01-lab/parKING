import tkinter as tk
from tkinter import filedialog
import cv2
from PIL import Image, ImageTk
import pickle
import os

class AnnotationEditor:
    def __init__(self, master):
        self.master = master
        self.canvas = tk.Canvas(master, width=640, height=480)
        self.canvas.pack()
        self.image = None
        self.annotations = []
        self.image_path = None
        self.annotation_path = None
        self.current_box = None

        self.canvas.bind("<Button-1>", self.on_click)
        self.canvas.bind("<B1-Motion>", self.on_drag)
        self.canvas.bind("<ButtonRelease-1>", self.on_release)

    def load_image(self, image_path, annotation_path):
        self.image_path = image_path
        self.annotation_path = annotation_path

        # Load image
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        self.image = ImageTk.PhotoImage(Image.fromarray(image))
        self.canvas.create_image(0, 0, anchor=tk.NW, image=self.image)

        # Load annotations
        with open(annotation_path, 'rb') as f:
            self.annotations = pickle.load(f)

        # Draw bounding boxes
        for box in self.annotations:
            x1, y1, x2, y2 = map(int, box[:4])
            self.canvas.create_rectangle(x1, y1, x2, y2, outline='red', width=2)

    def on_click(self, event):
        self.current_box = [event.x, event.y, event.x, event.y]

    def on_drag(self, event):
        x1, y1, x2, y2 = self.current_box
        self.canvas.delete("current")
        self.current_box[2], self.current_box[3] = event.x, event.y
        self.canvas.create_rectangle(x1, y1, event.x, event.y, outline='blue', width=2, tags="current")

    def on_release(self, event):
        self.annotations.append(self.current_box)
        self.current_box = None

    def save_annotations(self):
        with open(self.annotation_path, 'wb') as f:
            pickle.dump(self.annotations, f)
        print(f"Annotations saved to {self.annotation_path}")

def open_file():
    image_path = filedialog.askopenfilename(title="Select Image")
    annotation_path = image_path.replace('.jpg', '.pkl')
    editor.load_image(image_path, annotation_path)

root = tk.Tk()
editor = AnnotationEditor(root)
tk.Button(root, text="Open Image", command=open_file).pack()
tk.Button(root, text="Save Annotations", command=editor.save_annotations).pack()
root.mainloop()