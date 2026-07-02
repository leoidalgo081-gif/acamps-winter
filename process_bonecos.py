import cv2
import numpy as np
import os

def crop_transparent_bonecos():
    print("Processing bonecos-removebg-preview.png...")
    input_path = "bonecos-removebg-preview.png"
    
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found.")
        return
        
    # Read image with alpha channel
    img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        print("Failed to load image.")
        return
        
    if img.shape[2] != 4:
        print("Image doesn't have an alpha channel!")
        return
        
    alpha = img[:, :, 3]
    
    # Threshold the alpha channel to get a mask
    _, thresh = cv2.threshold(alpha, 10, 255, cv2.THRESH_BINARY)
    
    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    print(f"Found {len(contours)} contours")
    
    # Sort contours by area to get the largest ones
    contours = sorted(contours, key=cv2.contourArea, reverse=True)
    
    idx = 1
    # Assuming the 4 characters are the largest 4 contours
    for contour in contours[:4]:
        x, y, w, h = cv2.boundingRect(contour)
        print(f"Contour {idx}: x={x}, y={y}, w={w}, h={h}")
        
        # Add a little padding to the crop
        pad = 5
        y1 = max(0, y - pad)
        y2 = min(img.shape[0], y + h + pad)
        x1 = max(0, x - pad)
        x2 = min(img.shape[1], x + w + pad)
        
        cropped = img[y1:y2, x1:x2]
        
        out_path = f"public/novo_boneco_{idx}.png"
        cv2.imwrite(out_path, cropped)
        print(f"Saved {out_path}")
        idx += 1

if __name__ == "__main__":
    crop_transparent_bonecos()
