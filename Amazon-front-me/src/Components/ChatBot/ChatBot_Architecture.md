# ChatBot Voice & FAQ Architecture Guide

This document captures the final, working architecture of the ChatBot implemented in `ChatBot.jsx`. Follow these patterns to ensure consistent performance, reliable voice turn-taking, and accurate FAQ matching.

## 1. Speed & State (The Anti-Lag Pattern)
*   **Logic over State**: Always use `useRef` for timing-critical flags (`isListeningRef`, `isSpeakingRef`, `isProcessingRef`). React `useState` has a rendering delay that breaks high-speed voice loops.
*   **The "Unlock" Trick**: On the first user interaction, play an empty `SpeechSynthesisUtterance("")`. This satisfies mobile browser security and "warms up" the audio engine.

## 2. Voice Turn-Taking (The Natural Loop)
*   **Rapid Handover**: Set `isProcessingRef.current = false` the moment the AI starts its speech (`onstart`). This releases the "lock" so the system can prepare for the user's next response immediately.
*   **Barge-in (Interrupt) Filter**:
    *   Compare heard text to `lastSpokenRef` to filter out the bot's own echo.
    *   Ignore any sound shorter than 5 characters to filter out background noise/clicks.
*   **Transition Spacing**: Add a 1000ms pause after the bot stops talking before opening the microphone. This mimics human conversation logic.

## 3. The Knowledge Brain (The Robust Parser)
*   **Block-Based Parsing**: Split the system prompt into chunks using `Q:` markers. This is 100% more reliable than line-by-line reading because it doesn't break if there are extra newlines or spaces.
*   **Fuzzy Scoring**: 
    *   Score matches based on word occurrence.
    *   Use a threshold (e.g., `0.8`) to grant responses even if voice recognition slightly mishears a word.
*   **Synonym Mapping**: Map slang words to formal keywords (e.g., `built` -> `created`, `buddy` -> `Wabi`).

## 4. Automatic Healing (The Watchdogs)
*   **Idle Watchdog**: Every 3 seconds, if the bot is in "Call Mode" but doing nothing, force-restart the microphone.
*   **Silence Detection**: If there are 3 consecutive silence events during a call, have the bot say, "I'm still here! Any questions?" to prompt the user.

## 5. Master Prompt Format
Everything before the very first `Q:` in the Firebase prompt is treated as the **Persona** and is automatically used as the voice greeting.
