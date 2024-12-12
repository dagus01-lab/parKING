import math
import os
import random
import shutil
import tkinter as tk
from tkinter import filedialog
from tkinter import messagebox
from tkinter import simpledialog
from PIL import Image, ImageTk
import cv2

from adjust_annotations import AnnotationEditor
class DatasetEditor:
    def __init__(self, root):
        self.root = root
        self.root.title("Image Gallery with Annotation Editor")
        
        self.editor_frame = tk.Frame(root, width=1200, height=800)
        self.editor_frame.pack(side=tk.TOP)
        self.gallery_frame = tk.Frame(root, width=1200, height=800)
        self.gallery_frame.pack(side=tk.BOTTOM, fill=tk.X)
        
        
        self.prev_button = tk.Button(self.gallery_frame, text="←", command=self.prev_image, font=("Arial", 20))
        self.prev_button.pack(side=tk.LEFT, padx=10, pady=10)
        self.init_annotation_editor(self.editor_frame)
        self.next_button = tk.Button(self.gallery_frame, text="→", command=self.next_image, font=("Arial", 20))
        self.next_button.pack(side=tk.RIGHT, padx=10, pady=10)

        self.folder_button = tk.Button(self.gallery_frame, text="Select Folder", command=self.load_folder, font=("Arial", 14))
        self.folder_button.pack(side=tk.BOTTOM, pady=10)

        self.banner_label = tk.Label(self.gallery_frame, text="", font=("Arial", 14), fg="blue")
        self.banner_label.pack(side=tk.TOP, pady=5)
        
        self.image_paths = []
        self.current_index = 0
        self.current_folder = None
    
    def init_annotation_editor(self, display_frame):
        self.annotation_editor = AnnotationEditor(display_frame)
        self.save_button = tk.Button(self.gallery_frame, text="Save Annotations", command=self.annotation_editor.save_annotations)
        self.save_button.pack(side=tk.RIGHT, pady=10)

    def load_folder(self):
        """Prompt user to select a folder and load images."""
        folder_path = filedialog.askdirectory()
        if folder_path:
            self.current_folder = folder_path
            self.update_image_list()
            if self.image_paths:
                self.current_index = 0
                self.show_image()
            else:
                self.canvas.delete("all")
                self.canvas.create_text(400, 300, text="No images in folder", fill="white", font=("Arial", 24))

    def update_image_list(self):
        """Refresh the list of image files in the current folder."""
        if self.current_folder:
            valid_extensions = (".jpg", ".jpeg", ".png", ".gif", ".bmp")
            self.image_paths = [
                os.path.join(self.current_folder, f)
                for f in os.listdir(self.current_folder)
                if f.lower().endswith(valid_extensions)
            ]
            self.image_paths.sort()  

    def show_image(self):
        if not hasattr(self, "delete_image_button"):
            self.delete_image_button = tk.Button(self.gallery_frame, text="Delete image", command=self.delete_image, font=("Arial", 14))
            self.delete_image_button.pack(side=tk.TOP, pady=10)
        if not hasattr(self, "create_dataset_button"):
            self.create_dataset_button = tk.Button(self.gallery_frame, text="Create Dataset", command=self.create_dataset, font=("Arial", 14))
            self.create_dataset_button.pack(side=tk.TOP, pady=10)
        if not self.image_paths:
            return
        self.current_index = max(0, min(self.current_index, len(self.image_paths) - 1))
        image_path = self.image_paths[self.current_index]
        
        if not hasattr(self, "annotation_editor"):
            self.init_annotation_editor()
        
        # Load image in annotation editor
        annotation_path = os.path.splitext(image_path)[0] + ".txt"
        self.annotation_editor.load_image(image_path, annotation_path)
        self.banner_label.config(
            text=f"Image {self.current_index + 1} of {len(self.image_paths)}"
        )
    def create_dataset(self):
        output_dir = simpledialog.askstring("Output Directory", "Enter the name of the destination directory:")
        if not output_dir or not output_dir.strip():
            messagebox.showerror("Error", "Invalid directory name. Please try again.")
            return

        output_dir = output_dir.strip()

        if not os.path.isdir(self.current_folder):
            messagebox.showerror("Error", "Source directory does not exist.")
            return

        try:
            os.makedirs(output_dir, exist_ok=True)
            self.organize_dataset(output_dir)
            messagebox.showinfo("Success", f"Dataset organized into: {output_dir}")
        except Exception as e:
            messagebox.showerror("Error", f"An error occurred: {str(e)}")
            return
    def organize_dataset(self, output_dir, train_ratio=0.7, test_ratio=0.2, validate_ratio=0.1):
        assert train_ratio*100 + test_ratio*100 + validate_ratio*100 == 100, f"Ratios must sum to 1 (actual sum: {train_ratio+test_ratio+validate_ratio})."

        train_dir = os.path.join(output_dir, "train")
        test_dir = os.path.join(output_dir, "test")
        validate_dir = os.path.join(output_dir, "validate")

        os.makedirs(train_dir, exist_ok=True)
        os.makedirs(test_dir, exist_ok=True)
        os.makedirs(validate_dir, exist_ok=True)

        os.makedirs(os.path.join(train_dir, "images"), exist_ok=True)
        os.makedirs(os.path.join(train_dir, "labels"), exist_ok=True)
        os.makedirs(os.path.join(test_dir, "images"), exist_ok=True)
        os.makedirs(os.path.join(test_dir, "labels"), exist_ok=True)
        os.makedirs(os.path.join(validate_dir, "images"), exist_ok=True)
        os.makedirs(os.path.join(validate_dir, "labels"), exist_ok=True)
        files = [f for f in os.listdir(self.current_folder) if f.endswith('.jpg')]

        random.shuffle(files)

        total_files = len(files)
        train_count = int(total_files * train_ratio)
        test_count = int(total_files * test_ratio)

        train_files = files[:train_count]
        test_files = files[train_count:train_count + test_count]
        validate_files = files[train_count + test_count:]

        def copy_files(file_list, dest_dir):
            for image_file in file_list:
                imgs_dest_dir = os.path.join(dest_dir, "images")
                labels_dest_dir = os.path.join(dest_dir, "labels")
                src_image_path = os.path.join(self.current_folder, image_file)
                dest_image_path = os.path.join(imgs_dest_dir, image_file)
                shutil.copy(src_image_path, dest_image_path)

                annotation_file = os.path.splitext(image_file)[0] + ".txt"
                src_annotation_path = os.path.join(self.current_folder, annotation_file)
                if os.path.exists(src_annotation_path):
                    dest_annotation_path = os.path.join(labels_dest_dir, annotation_file)
                    shutil.copy(src_annotation_path, dest_annotation_path)

        copy_files(train_files, train_dir)
        copy_files(test_files, test_dir)
        copy_files(validate_files, validate_dir)
        yaml_path = os.path.join(output_dir, "dataset.yaml")
        train_path = os.path.join("..", "train/images").replace("\\", "/")
        val_path = os.path.join("..", "validate/images").replace("\\", "/")
        test_path = os.path.join("..", "test/images").replace("\\", "/")

        data = f"""
        train: {train_path}
        val: {val_path}
        test: {test_path}

        nc: 2
        names: ['space-empty', 'space-occupied']
        """

        with open(yaml_path, "w") as f:
            f.write(data)

        print(f"Dataset organized into {output_dir}:")
        print(f"  Train: {len(train_files)} images")
        print(f"  Test: {len(test_files)} images")
        print(f"  Validate: {len(validate_files)} images")
        print(f"Configuration file created at {yaml_path}")

    def delete_image(self):
        """Delete the current image and its annotation file after confirmation."""
        if not self.image_paths:
            messagebox.showinfo("Info", "No image to delete.")
            return

        current_image = self.image_paths[self.current_index]
        annotation_file = os.path.splitext(current_image)[0] + ".txt"

        confirm = messagebox.askyesno("Delete Confirmation", f"Are you sure you want to delete {os.path.basename(current_image)} and the corresponding annotation?")
        if not confirm:
            return

        try:
            os.remove(current_image)
            print(f"Deleted image: {current_image}")

            if os.path.exists(annotation_file):
                os.remove(annotation_file)
                print(f"Deleted annotation: {annotation_file}")

            self.update_image_list()

            if self.image_paths:
                self.current_index = max(0, self.current_index - 1)
                self.show_image()
            else:
                self.canvas.delete("all")
                self.canvas.create_text(400, 300, text="No images in folder", fill="white", font=("Arial", 24))

        except Exception as e:
            messagebox.showerror("Error", f"Failed to delete the image:\n{e}")

    def prev_image(self):
        """Show the previous image."""
        if self.image_paths:
            self.current_index -= 1
            self.update_image_list()
            self.show_image()

    def next_image(self):
        """Show the next image."""
        if self.image_paths:
            self.current_index += 1
            self.update_image_list()
            self.show_image()


if __name__ == "__main__":
    root = tk.Tk()
    app = DatasetEditor(root)
    root.mainloop()