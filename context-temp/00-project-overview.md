# Project Overview: Lumina Direct - AI Creative Studio

Lumina Direct is a high-fidelity AI Video Generation Studio designed to transform text scripts and visual guides into cinematic video content using advanced AI models (e.g., Google Veo 3).

## Key Features
*   **Scene-Based Generation:** Create videos scene-by-scene with dedicated controls for scriptwriting and visual style guidance.
*   **Visual Style Engine:** A "Visual Guide" system for specifying aesthetic details (e.g., "Blade Runner aesthetic," "anamorphic flares") independently of the script.
*   **Iteration & Versioning:** A robust "Generations" history to track every variation, allowing for side-by-side comparisons (v1, v2, etc.).
*   **Project Settings:** Global controls for aspect ratio (16:9, 9:16, 1:1) and cost tracking for API usage (via fal.ai).
*   **Live Preview & Editing:** A real-time video editor panel to scrub through generations and apply targeted edits via natural language prompts.

## Core Screens
1.  **Dashboard:** Project overview for managing multiple scenes, viewing total duration, and checking connection status.
2.  **Scene Editor:** The primary workspace with a split layout:
    *   **Left:** Scene configuration (Script, Visual Guide, Product Images).
    *   **Right:** Live Video Editor with playback controls and an "Edit Prompt" field.
3.  **Generations History:** A dedicated view for reviewing previous iterations, playing back specific versions, and generating new variations.
4.  **Project Settings Modal:** Configuration for project name, aspect ratio selection, and cost monitoring.

## UX Flow
1.  **Setup:** Connect to the AI engine (fal.ai) and configure global settings (e.g., aspect ratio).
2.  **Creation:** Input a script and visual guide for a scene. Upload reference "Start Cards" or "Product Images" to anchor the AI.
3.  **Generation:** Trigger the AI to produce the first version of the scene.
4.  **Refinement:** Use the "Edit Prompt" in the Video Editor to request specific changes (e.g., "more cinematic lighting," "slower camera movement").
5.  **Review & Export:** Compare versions in the Generations History, select the best output, and export the final video.

## Design System
*   **Name:** Lumina Direct
*   **Theme:** Light Mode, Inter typography, 8px corner roundness.
*   **Primary Color:** #007aff (Lumina Blue)
*   **Layout:** Fixed left sidebar for navigation with a flexible main content area and persistent top navigation.