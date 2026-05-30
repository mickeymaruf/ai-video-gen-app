Build the core layout shell (Top Navbar and Left Sidebar) for an AI video editor dashboard based on the provided UI design. The layout must be highly clean, scannable, and use a consistent design language.

## Global Layout Tokens & Setup
- Use a light background for the dashboard main body and a solid black background for the bottom preview drawer (as seen in the image).
- Component borders should be distinct, sharp, and consistent.

---

## 1. Editor Navbar (`components/editor/editor-navbar.tsx`)
Create a fixed-height top navigation bar spanning the width of the screen, layered on top or explicitly split from the sidebar.

### Left Section (Sidebar Header Alignment):
- A brand/workspace dropdown menu switcher labeled **"Cohete Brand"** with an expansion chevron icon.
- This section should perfectly match the width of the left sidebar to create a unified vertical column.

### Center/Right Content Section:
- For now, leave this area mostly flexible or empty, except for a static title placeholder **"Project #1"** aligned to the left of the remaining space, followed by static pricing/status indicators (`$1.59` and a pill badge `fal.ai connected`).
- On the far right, place a high-visibility, primary colored **"Export"** action button with rounded corners.

---

## 2. Project Sidebar (`components/editor/project-sidebar.tsx`)
Create a fixed-width left sidebar that handles navigation and project selection.

### Top Header & Primary Action:
- Directly below the brand switcher, feature a prominent, full-width primary action button labeled **"+ New Project"** with a rich blue background.

### Navigation List (Project Tabs/Items):
- A vertical menu listing active projects and assets.
- **Project #1 (Active State):** - Displays a settings gear icon on hover/active.
  - Nest a sub-list representing "Scenes" (**Scene #1**, **Scene #2**, **Scene #3**), showing a duration timestamp (e.g., `00:08`) on the right. 
  - The active scene (**Scene #1**) should have a subtle background tint or border indicating selection.
  - Include an **"+ ADD SCENE"** ghost button style at the bottom of the sub-list.
- **Secondary Items:** Static list items below the active project for other assets/folders (e.g., `UGC #1_STATIC_BATC...`, `Project #3`), each preceded by a video/folder icon.

---

## 3. Reusable Dialog Pattern
Establish a consistent, accessible dialog wrapper structure utilizing existing styling tokens for upcoming feature modals.

### Structural Requirements:
- **Title & Description:** Clean typographic hierarchy for headers.
- **Content Area:** Flexible slot for forms or dynamic settings.
- **Footer Actions:** Right-aligned button groups for confirmations/cancellations.

---

## 4. Main Content Canvas Placeholder
- The remaining center viewport should render a temporary empty placeholder text container.
- Below the main canvas, include a solid black container spanning the full width of the bottom viewport to represent the video timeline/preview pane area seen in the screenshot.