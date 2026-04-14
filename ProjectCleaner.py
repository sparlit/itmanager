import os
import string

def clean_file_content(file_path):
    """Removes non-printable characters and standardizes encoding."""
    # Standard printable characters + common whitespace (tabs, newlines)
    safe_chars = set(string.printable)
    
    try:
        # 1. Read as binary to prevent crashes on 'garbage' bytes
        with open(file_path, 'rb') as f:
            raw_data = f.read()

        # 2. Decode using utf-8, ignoring non-compliant bytes
        content = raw_data.decode('utf-8', errors='ignore')

        # 3. Filter: Keep only safe, printable characters
        # This removes null bytes and invisible 'corrupted' markers
        cleaned = "".join(ch for ch in content if ch in safe_chars)

        # 4. Overwrite with the clean version
        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            f.write(cleaned)
        return True
    except Exception as e:
        print(f"Skipped {file_path}: {e}")
        return False

def clean_project(directory):
    # Common extensions for Node, Tailwind, and major languages
    code_extensions = {
        '.js', '.jsx', '.ts', '.tsx', '.css', '.html', 
        '.json', '.md', '.py', '.c', '.cpp', '.java'
    }
    
    # CRITICAL: Folders to skip to avoid corrupting binaries or dependencies
    skip_dirs = {'node_modules', '.git', 'dist', 'build', '.next', 'venv'}

    for root, dirs, files in os.walk(directory):
        # Filter directories to skip hidden or dependency folders
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        
        for file in files:
            if any(file.endswith(ext) for ext in code_extensions):
                path = os.path.join(root, file)
                if clean_file_content(path):
                    print(f"Cleaned: {path}")

if __name__ == "__main__":
    target = input("Enter the path to your project folder (or '.' for current): ")
    confirm = input(f"Warning: This will modify files in {target}. Proceed? (y/n): ")
    if confirm.lower() == 'y':
        clean_project(target)
        print("\nCleaning complete.")
