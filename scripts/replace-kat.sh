#!/bin/bash

# Mass find-replace script to change "Kat" to "Liv" in all HTML files
# Usage: ./replace-kat.sh

STORY_PATH="/Users/yekta/Downloads/Private & Shared"

echo "🦇 Starting mass replacement: Kat → Liv"
echo "📂 Processing files in: $STORY_PATH"

# Count files before
TOTAL_FILES=$(find "$STORY_PATH" -name "*.html" | wc -l | tr -d ' ')
KAT_FILES=$(find "$STORY_PATH" -name "*.html" -exec grep -l "Kat" {} \; | wc -l | tr -d ' ')

echo "📊 Found $TOTAL_FILES HTML files total"
echo "📊 Found $KAT_FILES files containing 'Kat'"

# Create backup directory
BACKUP_DIR="$STORY_PATH/backup_$(date +%Y%m%d_%H%M%S)"
echo "💾 Creating backup at: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Copy original files to backup
cp -r "$STORY_PATH"/*.html "$BACKUP_DIR/" 2>/dev/null || true
cp -r "$STORY_PATH"/Welcome\ to\ Shadows\ of\ Gotham* "$BACKUP_DIR/" 2>/dev/null || true

echo "🔄 Starting replacements..."

# Perform replacements
find "$STORY_PATH" -name "*.html" -type f | while read -r file; do
    if grep -q "Kat" "$file"; then
        echo "✏️  Processing: $(basename "$file")"
        
        # Use sed to replace multiple patterns
        sed -i '' \
            -e 's/Kat Freya/Liv Freya/g' \
            -e 's/Kat'\''s/Liv'\''s/g' \
            -e 's/ Kat / Liv /g' \
            -e 's/>Kat</\>Liv</g' \
            -e 's/"Kat"/"Liv"/g' \
            -e "s/'Kat'/'Liv'/g" \
            -e 's/\bKat\b/Liv/g' \
            "$file"
    fi
done

# Check results
NEW_KAT_FILES=$(find "$STORY_PATH" -name "*.html" -exec grep -l "Kat" {} \; | wc -l | tr -d ' ')

echo ""
echo "🎉 Replacement complete!"
echo "📊 Files with 'Kat' before: $KAT_FILES"
echo "📊 Files with 'Kat' after: $NEW_KAT_FILES"
echo "💾 Backup saved at: $BACKUP_DIR"

# Check for files/folders that need renaming
echo ""
echo "📝 Checking for files/folders that need renaming..."
find "$STORY_PATH" -name "*Kat*" | while read -r item; do
    echo "🔄 Rename needed: $(basename "$item")"
done

echo ""
echo "✅ All done! Your Batman universe is now fully Liv-ified! 🦇"