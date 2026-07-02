import cv2
import numpy as np
import os
from rembg import remove
from PIL import Image

def process_logos():
    print("Processing logos...")
    input_path = "logos.jpg"
    output_path = "public/logos.png"
    if os.path.exists(input_path):
        img = Image.open(input_path)
        output = remove(img)
        output.save(output_path)
        print(f"Saved {output_path}")

def crop_characters():
    print("Cropping characters...")
    input_path = "public/bnequinhos.png"
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found.")
        return
        
    # Read image with alpha channel
    img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        print("Failed to load image.")
        return
        
    if img.shape[2] != 4:
        print("Image doesn't have an alpha channel.")
        return
        
    alpha = img[:, :, 3]
    
    # Threshold the alpha channel to get a mask
    _, thresh = cv2.threshold(alpha, 10, 255, cv2.THRESH_BINARY)
    
    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    print(f"Found {len(contours)} contours")
    
    # Sort contours from left to right based on bounding box x-coordinate
    contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[0])
    
    idx = 1
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        
        # Filter out small noise
        if w > 50 and h > 50:
            # Crop the bounding box
            # Add small padding
            pad = 10
            y1 = max(0, y - pad)
            y2 = min(img.shape[0], y + h + pad)
            x1 = max(0, x - pad)
            x2 = min(img.shape[1], x + w + pad)
            
            cropped = img[y1:y2, x1:x2]
            
            out_path = f"public/boneco_{idx}.png"
            cv2.imwrite(out_path, cropped)
            print(f"Saved {out_path} (Size: {w}x{h})")
            idx += 1

if __name__ == "__main__":
    process_logos()
    crop_characters()
