# UI Context

## Theme

Light only. No dark mode. The design language is a clean SaaS workspace
focused on project management and AI video generation. The interface uses
white surfaces, subtle gray borders, and blue accent actions.

## Colors

The interface primarily uses white surfaces with a blue accent color for
primary actions and active states.

| Role | Usage |
| ------ | ------ |
| Page background | Light gray workspace background |
| Surface | White panels and cards |
| Primary accent | Blue buttons, active states, and highlights |
| Primary text | Dark gray text |
| Secondary text | Muted gray labels and metadata |
| Border | Light gray panel and input borders |
| Success | Green connection status indicator |

Exact color tokens should be defined in the application's design system
or CSS variables rather than inferred from the UI.

## Typography

| Role | Usage |
| ------ | ------ |
| Page titles | Project names and major headings |
| Section headings | Scene and editor section labels |
| Body text | Form content and editor text |
| Metadata | Timestamps and status information |

The UI uses a modern sans-serif typeface.

## Border Radius

Rounded corners are used consistently throughout the interface.

| Context | Usage |
| ------ | ------ |
| Buttons | Rounded corners |
| Inputs | Rounded corners |
| Panels | Rounded corners |
| Upload areas | Rounded corners |

Exact radius values should come from design tokens.

## Component Library

The UI contains the following component types:

- Button
- Card / Panel
- Input
- Textarea
- Select Dropdown
- Sidebar Navigation
- Upload Area
- Status Indicator

The underlying component library is not identifiable from the design
alone.

## Layout Patterns

- Application shell with fixed left sidebar and main workspace
- Project navigation in the left sidebar
- Top toolbar containing project information and global actions
- Main editor panel for scene configuration
- Vertical scene list within projects
- Dedicated upload areas for assets and start cards

## Icons

[e.g. Lucide React. Stroke-based icons only. Sizes:
h-4 w-4 for inline, h-5 w-5 for buttons.]
