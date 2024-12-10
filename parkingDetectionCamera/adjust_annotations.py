import tkinter as tk
from tkinter import filedialog, simpledialog
import os
import cv2
from PIL import Image, ImageTk
from enum import Enum
from typing import Tuple, List

class BBoxCoordinates:
    def __init__(self, x_center: float, y_center: float, w: float, h: float):
        self.x_center = x_center
        self.y_center = y_center
        self.w = w
        self.h = h
    def get_coords_xyxy(self, image_width:int, image_height:int):
        return BBoxCoordinates.get_xyxy_from_xywh(self.x_center, self.y_center, self.w, self.h, image_width, image_height)
    def get_coords_xywh(self):
        return (self.x_center, self.y_center, self.w, self.h)
    def set_coords_xyxy(self, x1:float, y1:float, x2:float, y2:float, image_width:int, image_height:int):
        self.x_center, self.y_center, self.w, self.h = BBoxCoordinates.get_xywh_from_xyxy(x1,y1,x2,y2, image_width, image_height)
    def set_coords_xywh(self, x_center:float, y_center:float, w:float, h:float):
        self.x_center, self.y_center, self.w, self.h = [x_center, y_center, w, h]
    def __str__(self):
        return f"[{self.x_center:.6f} {self.y_center:.6f} {self.w:.6f} {self.h:.6f}]\n"
    def get_xywh_from_xyxy(x1:float, y1:float, x2:float, y2:float, img_width: int, img_height: int) -> Tuple[float,float,float,float]:
        x_center = (x1 + x2) / 2 / img_width
        y_center = (y1 + y2) / 2 / img_height
        width = abs(x2 - x1) / img_width
        height = abs(y2 - y1) / img_height
        return (x_center, y_center, width, height)
    def get_xyxy_from_xywh(x_center:float, y_center:float, width:float, height:float, img_width: int, img_height: int) -> Tuple[float,float,float,float]:
        x1 = int((x_center - width / 2) * img_width)
        y1 = int((y_center - height / 2) * img_height)
        x2 = int((x_center + width / 2) * img_width)
        y2 = int((y_center + height / 2) * img_height)
        return (x1, y1, x2, y2)
    
class Annotation:
    def __init__(self, label: int):
        self.label = label
        self.data = None
class BBoxFormats(Enum):
    xyxy = "xyxy"
    xywh = "xywh"
class BBox(Annotation):
    def __init__(self, label: int, data: BBoxCoordinates):
        super().__init__(label)
        self.data = data
    def __str__(self):
        x_center, y_center, width, height = self.data.get_coords_xywh()
        return f"{self.label} {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}\n"

class Polygon(Annotation):
    def __init__(self, label: int, data):
        super().__init__(label)
        self.data = data
    def __str__(self):
        coords = " ".join(f"{x:.6f}" for x in self.data)
        return f"{self.label} {coords}\n"
                 
class AnnotationEditor:
    def __init__(self, master):
        self.master = master
        self.canvas = tk.Canvas(master, width=640, height=640, bg="white")
        self.canvas.pack(side=tk.LEFT)
        self.image = None
        self.annotations : List[Annotation]= [] 
        self.image_path = None
        self.annotation_path = None
        self.current_polygon = []  # For drawing polygons
        self.selected_bbox_idx = None
        self.color_map = {}
        self.edit_mode = False # default to add mode

        self.drag_mode = None
        self.dragged_vertex = None
        self.dragged_side = None
        self.start_drag_x = None
        self.start_drag_y = None

        # Sidebar for labels
        self.sidebar = tk.Frame(master, width=200, bg="lightgray")
        self.sidebar.pack(side=tk.RIGHT, fill=tk.Y)
        self.label_list = tk.Listbox(self.sidebar)
        self.label_list.pack(fill=tk.BOTH, expand=True)
        self.label_list.bind("<<ListboxSelect>>", self.on_label_select)

        self.mode_button = tk.Button(self.sidebar, text="Insert Mode", command=self.toggle_edit_mode, bg="red")
        self.mode_button.pack(fill=tk.X)
        self.add_box_button = tk.Button(self.sidebar, text="Add Box", command=self.add_box)
        self.add_box_button.pack(fill=tk.X)
        self.delete_annotation_button = tk.Button(self.sidebar, text="Delete Annotation", command=self.delete_annotation)
        self.delete_annotation_button.pack(fill=tk.X)

        # Canvas bindings
        self.canvas.bind("<Button-1>", self.on_click)
        self.canvas.bind("<B1-Motion>", self.on_drag)
        self.canvas.bind("<ButtonRelease-1>", self.on_release)
        self.canvas.bind("<Double-1>", self.on_double_click)

    
    def load_annotations(self):
        self.annotations.clear()
        with open(self.annotation_path, 'r') as f:
            for line in f:
                parts = line.strip().split()
                label = int(parts[0])
                if len(parts) == 5:  # Bounding box
                    bbox_coords = tuple(map(float, parts[1:]))
                    bbox = BBox(label, BBoxCoordinates(bbox_coords[0], bbox_coords[1], bbox_coords[2], bbox_coords[3]))
                    self.annotations.append(bbox)
                else:
                    polygon_coords = tuple(map(float, parts[1:]))
                    polygon = Polygon(label, polygon_coords)
                    self.annotations.append(polygon)
        self.refresh_labels()
    def toggle_edit_mode(self):
        self.edit_mode = not self.edit_mode
        if self.edit_mode:
            self.mode_button["text"] = "Edit Mode"
            self.mode_button["bg"] = "green"
        else:
            self.mode_button["text"] = "Insert Mode"
            self.mode_button["bg"] = "red"

    def assign_label_color(self, label):
        """Assign a unique color to each label."""
        if label not in self.color_map:
            # Generate a new color for this label (you can define a different color generation logic)
            color = self.random_color()
            self.color_map[label] = color
        return self.color_map[label]

    def random_color(self):
        import random
        return f'#{random.randint(0, 0xFFFFFF):06x}'

    def load_image(self, image_path, annotation_path):
        self.image_path = image_path
        self.annotation_path = annotation_path

        # Load the image
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Get the fixed canvas dimensions
        canvas_width = self.canvas.winfo_width() or 640
        canvas_height = self.canvas.winfo_height() or 480

        # Maintain aspect ratio
        height, width, _ = image.shape
        aspect_ratio = width / height

        if aspect_ratio > 1:  # Landscape
            new_width = canvas_width
            new_height = int(new_width / aspect_ratio)
        else:  # Portrait or square
            new_height = canvas_height
            new_width = int(new_height * aspect_ratio)

        # Constrain image dimensions to not exceed canvas bounds
        new_width = min(new_width, canvas_width)
        new_height = min(new_height, canvas_height)

        # Resize the image to fit the canvas
        resized_image = cv2.resize(image, (new_width, new_height))

        # Convert resized image to format usable by Tkinter
        self.image = ImageTk.PhotoImage(Image.fromarray(resized_image))

        # Clear the canvas
        self.canvas.delete("image")

        # Display the image on the canvas
        self.canvas.create_image(0, 0, anchor=tk.NW, image=self.image, tags="image")

        # Load annotations if they exist
        if os.path.exists(self.annotation_path):
            print("Loading annotations...")
            self.load_annotations()

        # Redraw annotations after the image is displayed
        self.draw_annotations()

        
    def draw_annotations(self):
        self.canvas.delete("annotation")
        for idx, _ in enumerate(self.annotations):
            self.update_annotation(idx)

    def update_annotation(self, idx:int):
        img_height = self.image.height()
        img_width = self.image.width()
        annotation = self.annotations[idx]
        color = self.assign_label_color(annotation.label)  # Get the unique color for this label
        self.canvas.delete(f'annotation_{idx}')
        if isinstance(annotation, BBox):
            x1, y1, x2, y2 = annotation.data.get_coords_xyxy(img_width, img_height)
            self.canvas.create_rectangle(x1, y1, x2, y2, outline=color, width=2, tags=[f"annotation_{idx}", "annotation"])
        elif isinstance(annotation, Polygon):
            points = [(int(annotation.data[i] * img_width), int(annotation.data[i + 1] * img_height)) for i in range(0, len(annotation.data), 2)]
            self.canvas.create_polygon(points, outline=color, fill='', width=2, tags=[f"annotation_{idx}", "annotation"])

    def on_click(self, event):
        epsilon = 3
        if self.edit_mode:
            # In Edit mode, select the bounding box to resize
            self.selected_bbox_idx = None
            for idx, annotation in enumerate(self.annotations):
                if isinstance(annotation,BBox):
                    x1, y1, x2, y2 = annotation.data.get_coords_xyxy(self.image.width(), self.image.height())

                    self.start_drag_x = event.x
                    self.start_drag_y = event.y
                    # Check if the click is inside the bounding box
                    if y2 - epsilon < event.y < y2+epsilon and x1 -epsilon< event.x < x1+epsilon:
                        self.drag_mode = "vertex"
                        self.dragged_vertex = "top_left"
                        self.selected_bbox_idx = idx
                        print(f"Selected Bounding Box: {idx}")
                        break
                    elif y1 - epsilon < event.y < y1+epsilon and x1 -epsilon< event.x < x1+epsilon:
                        self.drag_mode = "vertex"
                        self.dragged_vertex = "bottom_left"
                        self.selected_bbox_idx = idx
                        print(f"Selected Bounding Box: {idx}")
                        break
                    elif y2 - epsilon < event.y < y2+epsilon and x2 -epsilon< event.x < x2+epsilon:
                        self.drag_mode = "vertex"
                        self.dragged_vertex = "top_right"
                        self.selected_bbox_idx = idx
                        print(f"Selected Bounding Box: {idx}")
                        break
                    elif y1 - epsilon < event.y < y1+epsilon and x2 -epsilon< event.x < x2+epsilon:
                        self.drag_mode = "vertex"
                        self.dragged_vertex = "bottom_right"
                        self.selected_bbox_idx = idx
                        print(f"Selected Bounding Box: {idx}")
                        break
                    elif x1 - epsilon < event.x < x1+epsilon and y1 < event.y < y2:
                        self.drag_mode = "side"
                        self.dragged_side = "left"
                        self.selected_bbox_idx = idx
                        print(f"Selected Bounding Box: {idx}")
                        break
                    elif x2 - epsilon < event.x < x2+epsilon and y1 < event.y < y2:
                        self.drag_mode = "side"
                        self.dragged_side = "right"
                        self.selected_bbox_idx = idx
                        print(f"Selected Bounding Box: {idx}")
                        break
                    elif y1 - epsilon < event.y < y1+epsilon and x1 < event.x < x2:
                        self.drag_mode = "side"
                        self.dragged_side = "top"
                        self.selected_bbox_idx = idx
                        print(f"Selected Bounding Box: {idx}")
                        break
                    elif y2 - epsilon < event.y < y2+epsilon and x1 < event.x < x2:
                        self.drag_mode = "side"
                        self.dragged_side = "bottom"
                        self.selected_bbox_idx = idx
                        print(f"Selected Bounding Box: {idx}")
                        break

                    elif x1 < event.x < x2 and y1 < event.y < y2:
                        self.drag_mode = "inside"
                        self.selected_bbox_idx = idx
                        print(f"Selected Bounding Box: {idx}")
                        break
        else:
            # In Add mode, create a new bounding box
            self.current_box = [event.x, event.y, event.x, event.y]

    def on_drag(self, event):
        if self.edit_mode and self.selected_bbox_idx is not None:
            # In Edit mode, handle resizing or moving the selected bounding box
            annotation = self.annotations[self.selected_bbox_idx]
            if isinstance(annotation,BBox):
                x1, y1, x2, y2 = annotation.data.get_coords_xyxy(self.image.width(), self.image.height())

                # Determine interaction type (vertex, side, or inside the rectangle)
                if self.drag_mode == 'vertex':
                    # Update the vertex being dragged
                    if self.dragged_vertex == "top_left":
                        x1, y2 = event.x, event.y
                    elif self.dragged_vertex == "top_right":
                        x2, y2 = event.x, event.y
                    elif self.dragged_vertex == "bottom_left":
                        x1, y1 = event.x, event.y
                    elif self.dragged_vertex == "bottom_right":
                        x2, y1 = event.x, event.y
                    annotation.data.set_coords_xyxy(x1,y1,x2,y2, self.image.width(), self.image.height())
                elif self.drag_mode == 'side':
                    # Update the vertices along the side being dragged
                    if self.dragged_side == "top":
                        y1 = event.y
                    elif self.dragged_side == "bottom":
                        y2 = event.y
                    elif self.dragged_side == "left":
                        x1 = event.x
                    elif self.dragged_side == "right":
                        x2 = event.x
                    annotation.data.set_coords_xyxy(x1,y1,x2,y2, self.image.width(), self.image.height())
                elif self.drag_mode == 'inside':
                    # Move the entire rectangle by calculating the offset
                    dx = event.x - self.start_drag_x
                    dy = event.y - self.start_drag_y
                    annotation.data.x_center += dx / self.image.width()
                    annotation.data.y_center += dy / self.image.height()
                    self.start_drag_x, self.start_drag_y = event.x, event.y
                
                # Redraw annotations
                self.update_annotation(self.selected_bbox_idx)

        elif not self.edit_mode:
            # In Add mode, draw a temporary rectangle while dragging
            if self.current_box:
                x1, y1, _, _ = self.current_box
                self.current_box[2], self.current_box[3] = event.x, event.y
                self.canvas.delete("temp_rect")  # Remove previous temporary rectangle
                self.canvas.create_rectangle(x1, y1, event.x, event.y, outline='blue', width=2, tags="temp_rect")


    def on_release(self, event):
        if self.edit_mode and self.selected_bbox_idx is not None:
            # In Edit mode, no need to do anything extra after release for resizing
            pass
        elif not self.edit_mode:
            # In Add mode, finalize the new bounding box creation
            if self.current_box:
                x1, y1, x2, y2 = self.current_box
                # Calculate normalized coordinates
                x_center, y_center, width, height = BBoxCoordinates.get_xywh_from_xyxy(x1, y1, x2, y2, self.image.width(), self.image.height())

                label = simpledialog.askinteger("Input", "Enter label for new bounding box:", parent=self.master, minvalue=0)
                self.canvas.delete("temp_rect")
                if label is not None:
                    self.annotations.append(BBox(label, BBoxCoordinates(x_center, y_center, width, height)))  # Add annotation
                    self.refresh_labels()
                    self.canvas.create_rectangle(x1, y1, x2, y2, outline=self.assign_label_color(label), width=2, tags=[f"annotation_{len(self.annotations)-1}", "annotation"])
                
            self.current_box = None  # Reset after releasing in add mode
        self.drag_mode = None
        self.dragged_vertex = None
        self.dragged_side = None
        self.start_drag_x = None
        self.start_drag_y = None

    def on_double_click(self, event):
        # Check if a rectangle is clicked
        clicked_bbox_idx = None
        for idx, annotation in enumerate(self.annotations):
            if isinstance(annotation,BBox):
                canvas_width = self.canvas.winfo_width()
                canvas_height = self.canvas.winfo_height()
                x1,y1,x2,y2 = annotation.data.get_coords_xyxy(canvas_width, canvas_height)
                # Check if the double-click is within the bounding box
                if x1 <= event.x <= x2 and y1 <= event.y <= y2:
                    clicked_bbox_idx = idx
                    break
        
        # If a bounding box was clicked, prompt to edit its label
        if clicked_bbox_idx is not None:
            current_label = self.annotations[clicked_bbox_idx].label
            new_label = simpledialog.askinteger(
                "Edit Label",
                f"Current label: {current_label}\nEnter new label:",
                parent=self.master,
                minvalue=0
            )
            if new_label is not None:
                # Update the label in the annotation
                self.annotations[clicked_bbox_idx].label = new_label
                self.refresh_labels()
                self.update_annotation(clicked_bbox_idx)

    def add_polygon(self):
        if self.current_polygon:
            label = simpledialog.askinteger("Input", "Enter label for new polygon:", parent=self.master, minvalue=0)
            if label is not None:
                flat_polygon = [coord for point in self.current_polygon for coord in point]
                self.annotations.append(Polygon(label, 'polygon', flat_polygon))
                self.refresh_labels()
                self.draw_annotations()
        self.current_polygon = []

    def delete_annotation(self): 
        if self.selected_bbox_idx is not None:
            del self.annotations[self.selected_bbox_idx]
            self.refresh_labels()
            self.draw_annotations()
            self.selected_bbox_idx =  None

    def refresh_labels(self):
        self.label_list.delete(0, tk.END)
        for annotation in self.annotations:
            if isinstance(annotation, BBox):
                self.label_list.insert(tk.END, f"Label: {annotation.label}, Box: {annotation.data}")
            elif isinstance(annotation, Polygon):
                self.label_list.insert(tk.END, f"Label: {annotation.label}, Polygon: {annotation.data}")

    def on_label_select(self, event):
        selection = self.label_list.curselection()
        if selection:
            self.selected_bbox_idx  = selection[0]

    def save_annotations(self):
        with open(self.annotation_path, 'w') as f:
            for annotation in self.annotations:
                if isinstance(annotation, BBox):
                    f.write(annotation.__str__())
                elif isinstance(annotation, Polygon):
                    f.write(annotation.__str__())
        print(f"Annotations saved to {self.annotation_path}")
    
    def add_box(self):
        label = simpledialog.askinteger("Input", "Enter label for new bounding box:", parent=self.master, minvalue=0)
        if label is not None:
            coordinates = BBoxCoordinates(0.5, 0.5, 0.1, 0.1)
            self.annotations.append(BBox(label, coordinates))  # Default centered box
            self.label_list.insert(tk.END, f"Label: {label}, Box: {coordinates}")
            x1, y1, x2, y2 = coordinates.get_coords_xyxy(self.image.width(), self.image.height())
            self.canvas.create_rectangle(x1, y1, x2, y2, outline=self.assign_label_color(label), width=2, tags=[f"annotation_{len(self.annotations)-1}", "annotation"])

    def edit_label(self):
        if self.selected_bbox_idx is not None:
            current_label = self.annotations[self.selected_bbox_idx].label
            new_label = simpledialog.askinteger("Input", f"Edit label (current: {current_label}):", parent=self.master, minvalue=0)
            if new_label is not None:
                self.annotations[self.selected_bbox_idx].label = new_label
                self.refresh_labels()
    

def open_file():
    image_path = filedialog.askopenfilename(
        title="Select Image",
        filetypes=[
            ("JPEG Files", "*.jpg"),
            ("JPEG Files (uppercase)", "*.JPG"),
            ("JPEG Files (JPEG)", "*.jpeg"),
            ("JPEG Files (JPEG uppercase)", "*.JPEG"),
            ("PNG Files", "*.png"),
            ("All Files", "*.*"),
        ]
    )
    if image_path:
        annotation_path = os.path.splitext(image_path)[0] + ".txt"
        editor.load_image(image_path, annotation_path)

if __name__ == "__main__":
    root = tk.Tk()
    root.title("Dataset Annotation tool")
    editor = AnnotationEditor(root)
    tk.Button(root, text="Open Image", command=open_file).pack()
    tk.Button(root, text="Save Annotations", command=editor.save_annotations).pack()
    root.mainloop()
