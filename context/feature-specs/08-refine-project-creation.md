## Stitch Instructions

Get the images and code for the following Stitch project's screens:

## Project
Title: Duplicate of Remix of Lumina Video Studio
ID: 15708072907553766876

## Screens:
1. Video Generator - Project Settings Modal
    ID: 6d1c1207cca849aca4cac318f513b172

Use a utility like `curl -L` to download the hosted URLs.

Only get the modal code and it's ux and implemenet same modal in below requirements:

---

@src/components/editor

Requirements:
- When hit new project it immediately creates a project and navigates to editor, this is not what we want. Instead it should open a modal where it will ask for project name, after that it should create a project and navigate to editor.
- When click the settings icon it should reuse the same modal but its content will be same exactly to the particular screen ID: 6d1c1207cca849aca4cac318f513b172 to rename project, aspect ratio, skip project cost for now.
- Apply loading.tsx file with a animated circle spinner in the editor and inside [projectId] too
- Write actions for rename, aspect ratio, skip project cost and save buttons in the modal.
- Add aspect ratio in the schema.