Your task is to take an existing client-side React component @src/components/editor/scene-editor.tsx  and integrate it with the fal.ai video generation platform using the cheapest model variant (`fal-ai/minimax-video/image-to-video`) for immediate high-speed pipeline validation.

### Technical & Architectural Requirements:
1. **Security & Proxy:**
   - Write the logic fal ai api calls and logics on the server side to abstract the `FAL_KEY` and keep it secure.

2. **File Processing Workflow:**
   - The component tracks file uploads locally via raw `File[]` objects. 
   - Convert the target local `File` into a Base64 Data URI on-demand when the submission handler is executed.

3. **Inference & Async Queue Polling:**
   - Execute the request through the polling mechanism to not block the ui
   - Pass the text criteria (combining script and visual guidance inputs) and the uploaded image URL into the input configuration.
   - Activate live telemetry log tracking.

4. **UI State & Preview:**
   - Provide explicit loading and disabled states to prevent overlapping duplicate submissions while `isGenerating` is true.
   - Once the async job fulfills successfully, extract the video link signature (`result.data.video.url`) and render an automated inline HTML5 video player layout (`<video controls autoPlay loop />`) immediately below the configurations card.
   - Ensure clean integration with existing typography, shadcn primitives, and standard Tailwind layouts. Do not modify unrelated UI aesthetics or drop-down settings.