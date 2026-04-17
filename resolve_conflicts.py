import re

file_path = r"f:\BordingBook\BordingBook\src\app\components\SearchPage.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to match conflict blocks, accepting upstream version
pattern = r'<<<<<<< Updated upstream\n(.*?)\n=======\n.*?\n>>>>>>> Stashed changes'
resolved = re.sub(pattern, r'\1', content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(resolved)

print("Resolved all conflict markers in SearchPage.tsx")
