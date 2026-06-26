import os
from PIL import Image, ImageDraw

def create_icon(size):
    # Ensure images directory exists
    os.makedirs('public/images', exist_ok=True)
    
    # Create square dark background representing AURA's dark-mode theme
    img = Image.new('RGBA', (size, size), color=(11, 8, 22, 255))
    draw = ImageDraw.Draw(img)
    
    cx, cy = size // 2, size // 2
    
    # Draw glowing purple ring
    margin = size // 12
    draw.ellipse([margin, margin, size - margin, size - margin], 
                 outline=(168, 85, 247, 255), width=max(4, size // 35))
    
    # Draw smaller inner pink ring for aura depth
    inner_margin = size // 6
    draw.ellipse([inner_margin, inner_margin, size - inner_margin, size - inner_margin], 
                 outline=(236, 72, 153, 100), width=max(2, size // 50))
    
    # Draw stylized letter "A" at the center
    h = size // 4
    w = size // 5
    
    # Outer stroke points for 'A' shape
    points = [
        (cx, cy - h), # Apex
        (cx - w, cy + h), # Bottom Left
        (cx + w, cy + h) # Bottom Right
    ]
    
    # Draw stylized triangle outline representing "A"
    draw.line([points[1], points[0], points[2]], fill=(255, 255, 255, 255), width=max(6, size // 25))
    
    # Crossbar
    draw.line([(cx - w // 2, cy + h // 3), (cx + w // 2, cy + h // 3)], fill=(99, 102, 241, 255), width=max(4, size // 30))
    
    # Save the file
    filepath = f'public/images/icon-{size}.png'
    img.save(filepath)
    print(f"Successfully generated {filepath}")

if __name__ == '__main__':
    create_icon(192)
    create_icon(512)
