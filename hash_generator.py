import hashlib

def generate_hash(filepath):
    with open(filepath, "rb") as f:
        file_data = f.read()
    return hashlib.sha256(file_data).hexdigest()

# Example usage:
print(generate_hash("data/test_certificates/Java codes.pdf"))
