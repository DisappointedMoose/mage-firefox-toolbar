# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Firefox extension (Manifest V3) called **"DisappointedMage Firefox Toolbar"**. It integrates with the MSP_DevTools Magento module to provide debugging information for Magento 2 sites directly in Firefox DevTools.

Based on the original [MSP_DevTools Chrome Extension](https://github.com/magespecialist/mage-chrome-toolbar) by MageSpecialist, ported to Firefox using Mozilla's WebExtension Polyfill.

## Development

This is a browser extension with no build system. To test changes:

### Firefox
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Select `manifest.json` from this directory
4. After making changes, click "Reload" on the extension card

### Chrome (also supported)
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this directory

## Architecture

### Cross-Browser Compatibility
The extension uses `browser-polyfill.min.js` (Mozilla's WebExtension Polyfill) to provide a unified `browser.*` API that works in both Firefox and Chrome. All extension code uses Promise-based `browser.*` APIs instead of Chrome's callback-based `chrome.*` APIs.

### Message Flow
The extension uses a port-based messaging system through the background service worker. Components connect with named ports (e.g., `content`, `devtools:tabId`, `panel:tabId`, `inspector:tabId`) and route messages via `background.js`.

Message format:
```javascript
{ type: 'update'|'icon'|'inspector-update', to: 'background'|'devtools'|'panel'|'inspector', tabId: number, payload: any }
```

### Core Components

**js/browser-polyfill.min.js** - Mozilla's WebExtension Polyfill for cross-browser compatibility.

**js/background.js** - Service worker that manages port connections and routes messages between components. Handles icon state updates.

**js/content.js** - Content script injected into all pages. Parses HTML comments (`START_MSPDEV[id]`/`END_MSPDEV[id]`) to mark DOM elements with `data-mspdevtools` attributes, enabling block identification.

**js/devtools.js** - DevTools page script. Creates the "Magento" panel and sidebar pane. Retrieves `window.mspDevTools` data from inspected page via `browser.devtools.inspectedWindow.eval()`.

**js/panel.js** - Panel UI logic. Renders data tables using FooTable for blocks, events, profiler, queries, etc. Handles different "runlevels" (online, no-mage, fpc, update).

**js/inspector.js** - Elements sidebar logic. Shows block/uiComponent info for selected DOM elements by traversing up to find `data-mspdevtools` or `data-mspdevtools-ui` attributes. Receives updates via port messaging.

**js/renderer.js** - Shared rendering utilities for displaying block info, PhpStorm links, and property tables.

### Data Source
The Magento module injects `window.mspDevTools` object containing:
- `blocks` - Block information keyed by ID
- `uiComponents` - UI component data (Magento 2 only)
- `general`, `design`, `events`, `profiler`, `queries`, `plugins`, `data-models`, `collections`

### Entry Points
- `devtools.html` - Loaded by Firefox as DevTools page, bootstraps `devtools.js`
- `panel/panel.html` - Main DevTools panel UI
- `inspector.html` - Elements sidebar pane
- `popup.html` - Extension popup (minimal)

## Key Patterns

- Uses `browser.*` APIs (Promise-based) via polyfill for cross-browser support
- Uses jQuery for DOM manipulation
- Data attributes `data-mspdevtools` and `data-mspdevtools-ui` link DOM elements to debug info
- Protocol version check (`_protocol >= 3`) for compatibility with Magento module
- FooTable library for sortable/filterable data tables
- Bootstrap 3 for UI styling
- All HTML files include `<!DOCTYPE html>` for standards mode

## Firefox-Specific Notes

- `browser.devtools.panels.create()` requires a valid icon path (cannot be `null`)
- `browser.devtools.inspectedWindow.eval()` returns `[result, exceptionInfo]` array
- Sidebar pane communication uses port messaging instead of `setExpression`
