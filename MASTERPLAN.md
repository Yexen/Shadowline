# Shadowline App Master Plan
*The Ultimate Batcomputer Development Roadmap*

## 1) Authentication System
- ✅ No "stay signed in" option
- ✅ Signs out after 1 hour of not using
- ✅ Levels of access: Viewer, Analyst, Contributor
- ✅ Invitation-based guest access system
- 🔄 **NEXT**: Implement Clerk auth for author account
- 🔄 **NEXT**: Add MFA and enhanced security for author

## 2) Editor
- More advanced editor box
- Generate scenes & chapters:
  - Based on prompts
  - Asks additional relevant questions
- Ask Oracle:
  - Answers questions based on Shadows of Gotham and Canon with references, persists, searchable
  - Save to Notes option
  - Save to Volumes → asks for path (within the app, e.g., Volume 1 → Chapter 3 → then saves to Volumes page/Sidebar)
- Export (hovering) → a few options: PDF, HTML, MD, TXT

## 3) Search
- More advanced filters
- Search by tags and/or
- More advanced sorts

## 4) Sidebar
- Change the logo
- Reorganize the order with & subpages

## 5) Home Page
- Refresh button doesn't work
- Advanced options for videos & articles:
  - Add to Watchlist/Readlist (persists)
  - Favorites (persists)
  - Archive to Sources (existing page)
  - Optional: Add note
- Cards → channel/title/site + duration
- Cards → Surveillance Footage → add duration
- Cards → Latest Intel → refresh every 6 hours

## 6) Drafts
- Two tabs:
  - Drafts → open in editor & fix
  - Notes → editable + deletable

## 7) Gallery
- Add audio tab
- All media are downloadable
- Delete buttons with safety popup for all media

## 8) Headings & Subheadings
- Gotham-themed

## 9) AI Tools
- Shortcut to AI tools + chats already there

## 10) Bible (Enhanced Sidebar System)
- ✅ Keep as sidebar (better UX than page)
- 🔄 **ACTIVE**: Fixed Gotham-themed fields system:
  - Name, Alias, Position (multiple dropdown: Hero, Villain, Civilian, Vigilante, etc.)
  - Group affiliation (Justice League, Titans, Batfamily, League of Assassins, Rogues Gallery, GCPD, etc.)
  - Keep custom field addition + AI suggestions
- 🔄 **ACTIVE**: Picture placeholders with upload functionality and persistence
- 🔄 **ACTIVE**: Remove black boxes and improve layout styling
- 🔄 **ACTIVE**: Export buttons for each entry (PDF, JSON, etc.)
- 🔄 **ACTIVE**: Static reading mode vs edit mode toggle
- 🔄 **ACTIVE**: Notion-like tabs system:
  - Profile tab (main info + picture)
  - Relationships tab (clickable character links, AI-fillable)
  - Subpages system (popup pages for detailed sections)
- 🔄 **ACTIVE**: AI field suggestions based on character type and existing data
- Enhanced relationship system with clickable cross-references
- Auto-save functionality for all edits

## 11) Volumes
- Turn to page
- Two tabs: Volumes + Outlines
- Outlines:
  - Big rectangle button at the top
  - Outline → popup outline with edit button
  - Under → resources cards for resources
  - Title and …
- Volumes:
  - List of Volumes I–VI
  - List of chapters inside each volume page
  - Edit buttons that open them in the editor page
  - Clicking on the title opens a popup for reading the chapter

## 12) Discussion
- Fix the layout
- History → add name of the session
- Search by keywords → add

## 13) Maps
- Final route → AI assistant answering questions based on the 3D map and their knowledge

## 14) Notebook
- Path-based, not document-based (including URL)
- Delete top row
- Features:
  - Generate overview based on path given
  - Delete document since its path is loaded
  - Q&A based on path given
  - Full character cards:
    - Initially with name + picture + minimal info
    - Clickable → popup with much more info: buttons, relationships, references, etc.
    - Relationships → interactive mind map/table → auto-generated
  - In Shadows of Gotham only:
    - Arc → generate → interactive mind map + timeline + text
    - Backstory → generate → interactive mind map + text
    - Combat/skills/competence → generate table + text
    - Philosophy/psychology → generate text + interactive mind map
    - Personality → generate text + interactive mind map
  - Tags → all entries
  - All generated content must be storable to the path given (with filters based on tags)
  - Themes: keep as is with better generation
  - Themes → ask by path (the AI or character)
  - Audio → as is
  - Critique (gentle)
  - Strength
  - Video generation → suggestions welcome
  - Delete → search
  - All texts should have references

## 15) Classification
- I feed it HTML files or PDFs/media
- I give it paths + prompts
- It saves them where they should be

## 16) Organization
- Interactive calendar
- Simple clock: date + time
- Timer
- Pomodoro
- Task list → two tabs (long-term, short-term)
- Every day, if automatically moves unchecked ones to the next page

## 17) Messages
- Guests can message author only
- Author can message all guests

## 18) Sources
- As is + saved to archive (videos + articles)

## 19) About
- Introduction to the app
- Introduction of the writer
- Introduction of the story

## 20) Settings
- User management

## 21) Dev Console
- As is
- Delete Firebase if not relevant
- Get it working
- Lite cloud code inside my app

## 22) Profile
- Edit profile
- Watchlist
- Readlist
- Change password
- Suggestions
- Delete account

## 23) Enhanced Security Implementation
- Implement Clerk authentication for author account
- Add multi-factor authentication (TOTP, SMS, email)
- Enhanced session management with automatic security
- Breach protection and monitoring
- Device management and suspicious login detection
- Password strength enforcement
- Optional social login (Google, GitHub)
- Audit trails for content access tracking
- Keep invitation system for guest accounts
- Hardware security key support (future)

---
*Last updated: September 20, 2025*