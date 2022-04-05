from PIL import Image
from os import scandir
import math

def roundSqrt(v):
	return math.ceil(math.sqrt(v))


files = []
for fileIdea in scandir("../assets/rawTextures"): #Need to know how many files to initialize final image
	files.append(fileIdea)

width = roundSqrt(len(files)) * 16

newImage = Image.new('RGBA', (width,width),(0,0,0))

x = 0 
y = 0
for file in files:
	newImage.paste(Image.open(file.path),(x,y))
	x += 16
	if x >= width:
		y += 16
		x = 0

newImage.save("../assets/atlas.png","png")