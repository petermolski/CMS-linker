# YouTube CMS Video ID Linkifier

A lightweight, performant Google Chrome Extension designed for YouTube Creator Studio and Rights Manager (CMS). It automatically transforms plain-text YouTube Video IDs into clickable watch links and appends a premium copy button with interactive tooltip feedback.

## Features

- **Automatic Linkification**: Automatically turns plain 11-character Video IDs (e.g., `FPfcLBUfX4U`) into clickable hyperlinks directing to `https://www.youtube.com/watch?v=FPfcLBUfX4U`.
- **Integrated Copy Button**: Appends an elegant copy icon next to the link. Clicking it copies the full watch URL directly to your clipboard.
- **Interactive Feedback**: On click, the copy button morphs into a green checkmark and displays a temporary "Copied!" tooltip overlay.
- **Native Studio Aesthetics**: Utilizes YouTube's native CSS variables (`--yt-endpoint-color`, `--yt-spec-call-to-action`, etc.), allowing the link and buttons to inherit and match Dark and Light mode themes natively.

## Technical Highlights

Built with high standards of extension engineering to ensure it runs seamlessly inside YouTube's complex interface:

1. **Shadow DOM Support**: YouTube Studio uses Polymer Web Components. This extension recursively traverses Shadow DOM boundaries to find and process elements hidden from standard page-level queries.
2. **Dynamic Mutation Tracking**: Listens for dynamic page transitions and lazy-loaded elements across both light DOM and Shadow DOM roots using nested `MutationObserver` instances.
3. **High Performance**: Throttles DOM scanning using `requestAnimationFrame` to ensure UI processing runs at most once per frame, preventing page lag on heavy lists.
4. **Zero Extra Permissions**: Operates with a minimal security footprint. It accesses clipboard functions solely through user gestures (button clicks) and requires zero broad browser permissions.

## Installation

To load this extension in Google Chrome:

1. Download or clone this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the upper-right corner.
4. Click the **Load unpacked** button in the top-left corner.
5. Select this project directory.
6. Open YouTube Studio or Rights Manager (`studio.youtube.com`). Plain Video IDs will now automatically convert into copyable watch links.
