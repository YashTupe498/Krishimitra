from PIL import Image

def remove_white_bg(input_path, output_path, tolerance=245):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # Check if pixel is close to white
        if item[0] > tolerance and item[1] > tolerance and item[2] > tolerance:
            # Fully transparent
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    remove_white_bg(
        "public/branding/krishimitra-icon.jpg", 
        "public/branding/krishimitra-icon.png",
        tolerance=240
    )
    print("Successfully created transparent icon PNG.")
