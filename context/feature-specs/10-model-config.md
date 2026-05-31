Look into @src/components/editor/scene-editor.tsx . We have type, language and model selection UI.

Requirements:
- User should be able to switch between type, language which will reflect on the generated video.
- User can switch between available image to video models. List down the top available models from the fal ai. (Look at the fal MCP for the image to video model for the list and configure them)
- Add sound on off toggle logic into the model.
- Add start card/end card (start frame/end frame) upload logic depending on the model. These start card/end card will be used to generate the video.