#!/usr/bin/env python3
"""
Mass find-replace script to change all instances of "Kat" to "Liv" 
across all HTML files in the Batman story archive.
"""

import os
import re
from pathlib import Path

def replace_in_file(file_path, replacements):
    """Replace text in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply all replacements
        for old_text, new_text in replacements.items():
            content = content.replace(old_text, new_text)
        
        # Only write if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    # Define the replacements
    replacements = {
        "Kat Freya": "Liv Freya",
        "Kat's": "Liv's", 
        " Kat ": " Liv ",
        ">Kat<": ">Liv<",
        "\"Kat\"": "\"Liv\"",
        "'Kat'": "'Liv'",
        # Add more specific patterns if needed
    }
    
    # Path to the story files
    story_path = Path("/Users/yekta/Downloads/Private & Shared")
    
    if not story_path.exists():
        print(f"Story path not found: {story_path}")
        return
    
    # Find all HTML files
    html_files = list(story_path.rglob("*.html"))
    print(f"Found {len(html_files)} HTML files")
    
    modified_count = 0
    
    # Process each file
    for file_path in html_files:
        if replace_in_file(file_path, replacements):
            modified_count += 1
            print(f"✅ Modified: {file_path.name}")
    
    print(f"\n🎉 Complete! Modified {modified_count} out of {len(html_files)} files")
    
    # Also check for any files/folders that need renaming
    print("\nChecking for files/folders that need renaming...")
    for item in story_path.rglob("*Kat*"):
        new_name = str(item.name).replace("Kat", "Liv")
        new_path = item.parent / new_name
        print(f"📝 Rename needed: {item.name} → {new_name}")

if __name__ == "__main__":
    main()