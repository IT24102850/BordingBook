import os, re

filepath = r"c:\Users\hasir\Downloads\BordingBook\src\app\components\SearchPage.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

target1_regex = r"\{\(house\.image\s*\|\|\s*house\.images\?\.\[0\]\)\s*&&\s*\(\s*<img\s*src=\{house\.image\s*\|\|\s*house\.images!\[0\]\}\s*alt=\{house\.name\}\s*className=\"w-full\s*h-44\s*object-cover\s*group-hover:scale-\[1\.02\]\s*transition-transform\s*duration-300\"\s*/>\s*\)\}"

target1_new = """{(() => {
              const src = house.images?.find(img => img && !img.startsWith('data:')) 
                || (house.image && !house.image.startsWith('data:') ? house.image : null)
                || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80';
              return (
                <img
                  src={src}
                  alt={house.name}
                  className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80';
                  }}
                />
              );
            })()}"""

new_text, count = re.subn(target1_regex, target1_new, text)
print(f"Target 1 replaced {count} times")

if count > 0:
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_text)
