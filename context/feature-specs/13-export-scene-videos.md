# 13 — Export Scene Videos

The **Export** button in the editor navbar downloads the video of every scene in
the project — using only the **currently selected version** of each scene (the
version showing in that scene's switcher, which may not be the latest).

## Behavior

- One video per scene is downloaded, named by scene order: `scene-1.mp4`,
  `scene-2.mp4`, … matching each scene's "Scene #N" label.
- The download respects the on-screen selection: switching a scene to version 1
  exports version 1, not the latest.
- Only scenes with a successfully generated, selected video are included
  (invariant #6 — exports only contain successful scenes). Temporary scenes,
  scenes with no versions, and in-progress scenes are skipped.
- The Export button is disabled while no scene has an exportable video.
- Downloads run sequentially, so the browser groups them into a single "download
  multiple files" permission prompt instead of dropping some.

## How it works

Export is client-only and downloads straight from the fal.media CDN — there is
no server action and no zip dependency. This is the lightest and fastest path:
bytes go from the CDN to the browser with no server hop pulling every video into
memory.

`src/lib/download.ts` holds `downloadFile(url, filename)`: it `fetch`es the
video as a blob, creates an object URL, and clicks a transient `<a download>`.
The blob fetch is necessary because a bare cross-origin `<a download>` on a
fal.media URL navigates to the file instead of downloading it; the fetch relies
on fal.media's permissive CORS (already used elsewhere in the app).

### Selection state

The selected version lives in each `SceneEditor`'s local `selectedVersionId`,
but the Export button lives in `EditorNavbar` — a sibling. So the selected video
URL per scene is lifted to their common parent, `EditorWorkspace`:

- `EditorWorkspace` keeps `selectedVideos: Record<sceneId, videoUrl | null>`.
- `SceneEditor` reports its current selection up through an
  `onSelectedVideoChange` callback, driven by a `useEffect` on the selected
  video URL (fires on load default, version switch, and new completion).
- The workspace setter ignores no-op updates (same value) so the per-render
  child callbacks can't cause a re-render loop.
- `EditorNavbar` receives `onExport` and an `exportCount`; the count both drives
  the disabled state and is the number of scenes that will export.

`handleExport` walks the scenes in order and downloads each selected URL as
`scene-<position>.mp4`.

## Notes

- Runtime dependency: a real CORS failure on the fal.media fetch would surface
  here. The fallback, if it ever became an issue, is a server-side proxy/zip.
- The navbar's export props are optional, so the server-rendered empty-state
  `/editor` page still composes the navbar (with Export disabled).
