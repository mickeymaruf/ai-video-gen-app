Extract the inline "Product Images" upload from `components/editor/scene-editor.tsx`
into a dedicated, reusable component using `react-dropzone` for multi-image upload
via drag-and-drop or click.

First install the dependency: `react-dropzone`.

## Component (`components/editor/product-image-uploader.tsx`)
- Begin the file with `'use client'`.
- Use `useDropzone` to accept multiple image files (`accept: { 'image/*': [] }`,
  `multiple: true`) via both drag-and-drop and click-to-select.
- Render a dashed drop zone matching the current upload tile styling; apply a
  visible active state (background/border tint) while dragging files over it.
- Show selected images as thumbnails in a row, each with a hover remove (`X`) button.
- Generate previews with `URL.createObjectURL` and revoke them on remove/unmount
  to avoid memory leaks.

## Props & types
- Controlled component. Define an explicit `interface`:
  `images: File[]`, `onChange: (images: File[]) => void`. No `any`.

## Integration (`components/editor/scene-editor.tsx`)
- Replace the inline Product Images block (the static Upload button + placeholder
  thumbnails) with `<ProductImageUploader />`.
- Hold the image list in `SceneEditor` state and pass it down.

## Styling
- Use existing design tokens and `cn()` from `lib/utils.ts`; no arbitrary Tailwind
  values. Reuse the `FieldLabel` "Product Images" heading.

### Check when done
- Drag-and-drop and click both add multiple images.
- Thumbnails render and remove correctly; object URLs are revoked.
- `scene-editor.tsx` no longer contains inline upload markup.
- TypeScript and lint pass; no `any`.
