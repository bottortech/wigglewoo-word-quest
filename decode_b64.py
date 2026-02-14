import base64, sys

chunk1_path = sys.argv[1]
chunk2_path = sys.argv[2]
output_path = sys.argv[3]

with open(chunk1_path, 'r') as f:
    part1 = f.read().strip()
with open(chunk2_path, 'r') as f:
    part2 = f.read().strip()

combined = part1 + part2
missing = len(combined) % 4
if missing:
    combined += '=' * (4 - missing)

data = base64.b64decode(combined)
with open(output_path, 'wb') as f:
    f.write(data)
print(f'Written {len(data)} bytes to {output_path}')
