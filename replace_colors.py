import os
import re

directory = 'src'

replacements = {
    r'#FF3E00': '#dd681f',
    r'#E8521C': '#dd681f',
    
    r'#070707': '#254b8c',
    r'#030303': '#254b8c',
    r'#0A0A0A': '#254b8c',
    r'#0E0E0E': '#254b8c',
    r'#121212': '#254b8c',
    
    r'#1A1A1A': '#2e5aa8',
    r'#161616': '#2e5aa8',
    r'#1D52B2': '#2e5aa8',
}

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for old, new in replacements.items():
                new_content = re.sub(old, new, new_content, flags=re.IGNORECASE)
                
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
