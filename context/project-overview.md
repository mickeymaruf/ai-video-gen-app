# Project Overview

This application allows users to generate AI video ads from product images and text prompts. Users create projects, build multiple scenes, upload product references, choose a video model, and generate videos through Fal.ai. Generated scenes can be versioned and exported as a final advertisement.

## Goals

1. Generate AI video ads from product images.
2. Support multi-scene video projects.
3. Allow scene-versioning and prompt and model customization.
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
9. Refine with versioning.
10. Repeat for additional scenes/versioning.
11. Export selected versions of videos for all scenes in a project.

## Features

### Projects
- Create project
- Rename project
- Set Video Aspect Ratio

### Inputs
- Script prompt
- Visual Guide prompt
- Product image uploads
- Start Reference Image (optional)
- End Reference Image (optional)

### Generation
- Video Type selection (UGC, Cinematic, Product, Lifestyle)
- Language selection
- Audio Toggle (On/Off)
- Model selection
- Generate video
- Regenerate video
- Status tracking

### Output
- Video preview
- Scene/Version management
- Export final videos for all scenes in a project with only selected version.

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