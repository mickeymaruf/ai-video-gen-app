# Project Overview

This application allows users to generate AI video ads from product images and text prompts. Users create projects, build multiple scenes, upload product references, choose a video model, and generate videos through Fal.ai. Generated scenes can be combined and exported as a final advertisement.

## Goals

1. Generate AI video ads from product images.
2. Support multi-scene video projects.
3. Allow scene-level prompt and model customization.
4. Provide a simple workflow for non-technical users.
5. Export generated scenes into a final video.

## Core User Flow

1. Create a project.
2. Add or select a scene.
3. Enter scene script and visual guidance.
4. Upload product images.
5. Optionally upload start/end reference images.
6. Select language, style, and model.
7. Generate video.
8. Review the result.
9. Repeat for additional scenes.
10. Export the final video.

## Features

### Projects
- Create project
- Rename project
- Delete project

### Inputs
- Script prompt
- Visual guidance prompt
- Product image uploads

### Generation
- Model selection
- Language selection
- Generate video
- Regenerate video
- Status tracking

### Output
- Video preview
- Scene management
- Export final video

## In Scope

- User authentication
- Project management
- Multi-scene workflow
- Image uploads
- Fal.ai integration
- Video generation
- Generation status tracking
- Video export

## Out of Scope

- Timeline editor
- Manual video editing
- Team collaboration
- Voice cloning
- AI avatars
- Stock asset library
- Mobile app
- Analytics
- Social scheduling
- Custom model training

## Success Criteria

- Users can create projects.
- Users can generate videos from prompts and images.
- Multiple scenes can be created in a single project.
- Fal.ai generations complete successfully.
- Generated videos can be previewed.
- Final videos can be exported.
- Projects and scenes persist between sessions.