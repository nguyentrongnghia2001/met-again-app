# Prompt Guide

The `.github/prompts` folder contains slash-command prompt templates for common work in this repository.

## Quick Usage

1. Open GitHub Copilot Chat or another prompt-aware editor in this workspace.
2. Type `/` to open the prompt list.
3. Pick the closest template.
4. Replace the argument hint with the concrete bug, feature, or flow you want to work on.

## Available Prompts

### Code
- `/Fix Bug`
- `/Optimize Realtime`
- `/Refactor Realtime Flow`

### Generate
- `/Generate Vue Component`
- `/Generate Composable`
- `/Generate Backend Service`

### Domain
- `/Matchmaking Task`
- `/Moderation Task`

## Example Commands

- `/Fix Bug Matchmaking sometimes requeues the same socket twice after a disconnect.`
- `/Refactor Realtime Flow Extract peer-connection lifecycle from the call screen into a composable.`
- `/Generate Vue Component Create a waiting-room panel that shows queue, connection, and error states.`
- `/Generate Backend Service Add a moderation service helper that stores admin review decisions for reports.`
- `/Matchmaking Task Add a timeout strategy when a matched peer never finishes WebRTC negotiation.`

## Notes

- Keep prompts focused on one task at a time.
- If the task changes the socket contract, update both event constant files and the relevant docs under `.github/docs/`.
