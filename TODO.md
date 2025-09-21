# Shadowline TODO - Bible & Map Issues

## 🚨 High Priority Fixes Needed

### 1. AI Hover Suggestions Not Working
- **Issue**: Bot icons don't appear when hovering over fields
- **Expected**: Small bot icons should show on hover for AI field suggestions
- **Status**: Lost during git restore - need to re-implement properly

### 2. Camera Navigation Broken  
- **Issue**: Map doesn't fly to exact locations when clicking "View on Map"
- **Expected**: Smooth camera animation to location coordinates
- **Status**: Location highlighting script may not be executing properly

### 3. Scrolling Issues
- **Issue**: Bible entries don't scroll properly 
- **Expected**: Smooth scrolling within entry content
- **Status**: ScrollArea implementation may be broken

### 4. Layout Structure Problems
- **Issue**: Layout is "fucked up" according to user
- **Expected**: Clean, organized Bible entry layout
- **Status**: Grid/column structure needs fixing

## 🎯 Working Features (Don't Break!)
- ✅ Map opens from Bible location entries
- ✅ Map closes properly (with double ESC)
- ✅ Delete buttons for entries and categories
- ✅ Feed functionality for HTML/PDF upload
- ✅ Two-column layout for first tab

## 📝 Implementation Notes
- AI hover functionality was working before git restore
- Camera navigation has the JavaScript injection code but may not execute
- Need to test in edit mode vs view mode for proper functionality
- ScrollArea was added but may have broken existing structure

## 🕐 Session Notes
- Session was highly productive despite these remaining issues
- User feedback: "we were amazing honestly" 
- These are polish issues, core functionality works
- Next session should focus on camera navigation first