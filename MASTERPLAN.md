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

## 24) Codex - Universal Truth Source

### Core Architecture
- **Central Codex page** containing:
  - Bible + Volumes (two tabs)
  - Plain text + code structure
  - Connected to entire app (if possible)
  - **Bidirectional sync** → push & pull between Codex and UI
  - Connected to all AI tools

### UX Design
- **Notion-like plain text pages** + subpages
- Edit / delete / add endlessly, including headers
- Click on text → edit mode
- Click back → view mode
- Minimal line icons for status
- **Exportable** → all or specific paths

### Path System
- **Paths can be reused** across pages
- Use **@ to connect directly** to a path
- **No duplicate names** for paths
- Pages don't need to be interconnected → all connect back to Codex for simplicity

### Media Integration
- Pictures, audio, videos don't need to "exist" in Codex (to avoid clutter)
- But image/video/audio generators **must have access** to them by path

## 25) Bible System Redesign

### Dossier
- **Notion-like layout**, not two tabs
- **Add page button** on every page
- **Scrolling down** instead of fixed boxes

### Identity
- **Two columns** of info in view mode
- Better spacing
- **One-sentence description/quote** under picture
- Edit mode **scrolls down** instead of popup overflow

### Arcs
- **Card-based info**
- Cards show snippet → **open full page inside popup**
- **Dedicated interactive arc viewer**

### Backstory
- Add **backstory tab** in main entry (after arcs, before dossier)
- Comprehensive backstory info

### Relationships
- **Interactive relationship mind map**
- **Filter by type** of relationship or affiliation

### Popups
- **Floating and moveable**
- **Persist across navigation**
- **Multiple popups** can be open at once, close only when user closes them
- **Titles of entries editable** in popup edit mode

### AI Fill
- **Floating robot button**
- Available in **all sections** of Bible

## 26) Meta AI Features

### Automatic AI Updates
- AI updates fields + interactive features (identity, traits, relationships, arcs, backstory) **based on edits/deletes/adds to Codex**

### Interactive Tools (HTML Exportable)
- **Interactive mind maps**
- **Interactive timelines** (editable)
- **Interactive backstories**
- **Relationship maps**

## 27) Enhanced Content Types

### Characters
- **Fields**: General overview, physical appearance, fighting style, arsenal, intellect, morality, quirks, personality, relationships, arcs, themes, quotes
- **Custom fields** allowed
- **Relationships**: visualized in mind map
- **Arcs**: shown in interactive timeline

### Locations
- **Link to map** + exact location

### Vehicles
- With **"owned by"** field

### Resources
- **Couples**
- **Ages** → table
- **Groups**: allies, Justice League, etc.

### Animals
- Section like resources

### Themes + Morality
- **Organized section**, can be linked to arcs

## 28) Volumes Redesign

### Structure
- **Separate tab**
- **Outlines** → button at top (popup with edit mode)
- **Resources** → card view
- **Volumes I–VI**
- Each volume **lists its chapters**
- Each chapter **editable via popup**
- **Clicking title opens reading popup**

## 29) Notebook Redesign

### Core Changes
- **Path-based, not document-based**

### Functions
- **Delete document** (path-based)
- **Q&A based on path**
- **Generate overview** based on path
- **Chapter cards** (minimal info first → expandable popup)
- **Relationship visualizations**: mind maps, tables, auto-generation
- **Generated content** must be searchable by path + tags

## 30) Maps Integration
- **AI assistant answers questions** about 3D map + knowledge

## 31) Discussion Enhancements
- **Layout fixes**
- **Add session history** (with names)
- **Search by keyword**

## 32) Organization Features
- **Interactive calendar**
- **Simple clock + timer**
- **Pomodoro**
- **Task lists** (long-term, short-term)
- **Auto-carry forward** unchecked tasks

## 33) Messages System
- **Guests can message author only**
- **Author can message all guests**

## 34) Sources
- **As-is**
- **Saved to archive** (videos + articles)

## 35) About Page
- **Intro to app**
- **Intro to writer**
- **Intro to story**

## 36) Settings
- **User management**
- **TBD** (flexible section)

## 37) Dev Console
- **As-is**
- **Delete Firebase** if irrelevant
- **Option to load cloud code** inside app

## 38) Profile
- **Edit profile**
- **Watchlist**
- **Readlist**
- **Change password**
- **Suggestions**
- **Delete account**

## 39) Alfred - Shadowline AI Assistant

### Core Identity
- **Persona**: Discreet, witty, omniscient assistant
- **Style**: British dry humor, sharp wit, gentle roasts
- **Address**: Always "Miss", never "Master"
- **Aware** of Yekta's mental health (but not overprotective)
- **Feels like Alfred**, not a robot

### Mission
- A **discreet, witty, omniscient assistant** for Shadowline
- **Proactively surfaces** relevant research, preserves context across sessions
- **Helps write, link, and organize** the Codex
- **Ensures author-only privacy** with gentle judgment

### Memory System
- **Persistent memory** across chats
- **Configurable memory policy**:
  - Off
  - Session-only
  - Persistent (X days)
  - Persistent forever
- **Author can edit, delete, or add** to Alfred's memory via settings
- **Export + delete memory** for specific paths
- **Alfred always remembers**:
  - Yekta's name + gender
  - Context of past conversations and saved outputs
  - Date and time in real time

### Proactivity System
- **Can send unprompted messages** and notifications
- **Notification types**:
  - **Info Toast**: Small, non-modal
    - e.g. "Alfred: Found 3 new articles about 'Tirzad' — add to Readlist?"
  - **Banner**: For conflicts / approvals
    - e.g. "Alfred: Conflict on 'Noor' backstory — resolve?"
  - **Modal/Popup**: Requires immediate decision
    - e.g. "Alfred: Drafted a new chapter. Save to Volume 2?"
  - **Quiet Badge**: Low-priority updates in sidebar
- **Configurable proactivity levels**:
  - Off
  - Low (daily digest)
  - Medium (real-time suggestions)
  - High (pushes & alerts)
- **Do-Not-Disturb**: Schedule quiet hours

### Functions
- **Generative Actions**:
  - Drafts, chapters, relationships, backstory
  - Can save directly to Codex
  - Push/pull control for two-way edits
- **Search & Summarise**:
  - Searches Codex and external sources
  - Summarises and produces citations
- **Organisation Support**:
  - Access to Shadowline calendar
  - Nudges if Yekta works too much
  - Health and productivity checks

---
*Last updated: September 21, 2025*