@src/components/editor/scene-editor.tsx  in this file.

Above the video output, show a version dropdown where all the versions will be shown for that scene where we can toggle to see the previously generated videos.

## Requirements:
- Place the version switcher with the Type, Language, Model dropdowns but all the way to the right.
- Replace forking with versioning — regenerate keeps the same scene card but appends a new version (no more extra cards).
- On reload the scene defaults back to latest version.
- When we change the scripts, vsiaul prompt, Type, Language, Model, all the settings and hit regenerate/generate then it will update those in the scene.
- The version only stores the videoUrl.
- Handle loading if we leave the page or come back later to show if the version generation is still in que.

Keep the implementation ultra-lean: write highly concise logic with zero unnecessary boilerplate, minimal inline comments, and clean, direct execution that fulfills all technical requirements without over-engineering.