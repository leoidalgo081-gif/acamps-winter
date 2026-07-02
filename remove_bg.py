import os
from rembg import remove
from PIL import Image

def remove_backgrounds(directory):
    for filename in os.listdir(directory):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')) and not filename.startswith('nobg_'):
            input_path = os.path.join(directory, filename)
            output_path = os.path.join(directory, f"nobg_{filename.rsplit('.', 1)[0]}.png")
            
            try:
                print(f"Processing {filename}...")
                with open(input_path, 'rb') as i:
                    with open(output_path, 'wb') as o:
                        input_bytes = i.read()
                        output_bytes = remove(input_bytes)
                        o.write(output_bytes)
                print(f"Saved to {output_path}")
            except Exception as e:
                print(f"Error processing {filename}: {e}")

if __name__ == '__main__':
    current_dir = os.path.dirname(os.path.abspath(__file__))
    remove_backgrounds(current_dir)
