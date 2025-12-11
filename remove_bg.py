from PIL import Image
import numpy as np

# Open the image
img = Image.open('CricketBatPhotos/DSC-Intense-Bat-Angle.jpg')

# Convert to RGB if needed
img = img.convert('RGB')

# Convert to numpy array
img_array = np.array(img)

# Define white color range (allowing some tolerance)
white_lower = np.array([240, 240, 240])
white_upper = np.array([255, 255, 255])

# Create mask for white pixels
mask = np.all((img_array >= white_lower) & (img_array <= white_upper), axis=2)

# Convert image to RGBA
img_rgba = img.convert('RGBA')
img_data = np.array(img_rgba)

# Make white pixels transparent
img_data[mask, 3] = 0

# Create new image from modified data
result = Image.fromarray(img_data, 'RGBA')

# Save with transparent background
result.save('CricketBatPhotos/bat-no-bg.png')
print("Background removed successfully! Saved as: CricketBatPhotos/bat-no-bg.png")
