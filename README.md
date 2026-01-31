# 😞 DisappointedMage Firefox Toolbar

[![Firefox Add-on](https://img.shields.io/badge/Firefox-Add--on-FF7139?logo=firefox-browser&logoColor=white)](https://addons.mozilla.org/firefox/)
[![License: OSL-3.0](https://img.shields.io/badge/License-OSL--3.0-blue.svg)](https://opensource.org/licenses/OSL-3.0)
[![Magento 2](https://img.shields.io/badge/Magento-2.x-orange?logo=magento)](https://magento.com/)

![logo.png](images/logo.png)

A Firefox DevTools extension for debugging **Magento 2** stores. Quickly access performance metrics, theme information, blocks, and more — right from your browser's developer tools.

> 🙏 Based on [MSP_DevTools Chrome Extension](https://github.com/magespecialist/mage-chrome-toolbar) by MageSpecialist, licensed under OSL 3.0.

---

## ✨ Features

- 🎨 **Theme & Design** — View current theme, layout handles, and design configuration
- 🧱 **Blocks & Containers** — Inspect block hierarchy, templates, and render times
- ⚡ **Performance Profiler** — Analyze execution times and bottlenecks
- 🗃️ **Data Models & Collections** — Monitor loaded models and collection queries
- 🔌 **Plugins Inspector** — See active Magento 2 interceptors
- 📊 **SQL Queries** — Debug database queries with execution times
- 🔗 **PhpStorm Integration** — Click to open templates directly in your IDE

---

## 📦 Installation

### Firefox Extension

Install from the releases page or load as a temporary add-on:

1. Open `about:debugging#/runtime/this-firefox`
2. Click **"Load Temporary Add-on..."**
3. Select the `manifest.json` file from this directory

### Chrome Extension (Experimental ⚠️)

This extension *should* also work in Chrome thanks to the WebExtension Polyfill, but **this is completely untested**. Use at your own risk!

1. Open `chrome://extensions/`
2. Enable **"Developer mode"**
3. Click **"Load unpacked"** and select this directory

> 💡 For a fully tested Chrome experience, consider using the original [MSP_DevTools Chrome Extension](https://chrome.google.com/webstore/detail/magespecialist-devtools-f/odbnbnenehdodpnebgldhhmicbnlmapj).

### Magento Module (Required)

The extension requires the **MSP_DevTools** module installed on your Magento store.

#### Magento 2

```bash
composer require msp/devtools
php bin/magento setup:upgrade
php bin/magento cache:flush
```

Then configure in Admin: `Stores > Configuration > MageSpecialist > DevTools`

> ⚠️ **Important:** Disable Full Page Cache while debugging.

📚 [MSP_DevTools for Magento 2](https://github.com/magespecialist/m2-MSP_DevTools)

#### Magento 1

📚 [MSP_DevTools for Magento 1](https://github.com/magespecialist/m1-MSP_DevTools)

---

## 🚀 Optional Features

<details>
<summary><strong>Enable Profiler (Magento 2)</strong></summary>

```bash
bin/magento dev:profiler:enable 'MSP\DevTools\Profiler\Driver\Standard\Output\DevTools'
```

</details>

<details>
<summary><strong>Enable SQL Query Logging (Magento 2)</strong></summary>

Edit `app/etc/env.php` and add the profiler setting:

```php
'db' => [
    'connection' => [
        'default' => [
            'host' => 'localhost',
            // ... other settings ...
            'profiler' => '1',  // Add this line
        ],
    ],
],
```

</details>

---

## 🖥️ Usage

Open Firefox DevTools (`F12`) and look for the **"Magento"** tab.

### Global Page Information

| Tab | Description |
|-----|-------------|
| **General** | Theme, controller, router, request params |
| **Design** | Layout handles and updates |
| **Observers** | Dispatched events and observers |
| **Blocks** | Block hierarchy with render times |
| **Data Models** | Loaded data models |
| **Collections** | Database collections |
| **UI** | uiComponents (Magento 2) |
| **Profiler** | Execution time breakdown |
| **Plugins** | Active interceptors (Magento 2) |
| **Queries** | SQL queries with timing |

### Element Inspector

Select any element in the **Inspector** tab to see its associated Magento block information in the **Magento** sidebar panel.

---

## 🔧 PhpStorm Integration

1. Install [IDE Remote Control](https://plugins.jetbrains.com/plugin/19991-ide-remote-control) plugin in PhpStorm
2. Enable the feature in Magento Admin under DevTools configuration
3. Click the file icons in the toolbar to open templates directly in PhpStorm

---

## 📸 Screenshots

<details>
<summary>View Screenshots</summary>

#### Inspector Integration
<img src="https://raw.githubusercontent.com/magespecialist/mage-chrome-toolbar/master/screenshots/main2.png" width="600" />

#### General Information
<img src="https://raw.githubusercontent.com/magespecialist/mage-chrome-toolbar/master/screenshots/1.png" width="600" />

#### Blocks & Containers
<img src="https://raw.githubusercontent.com/magespecialist/mage-chrome-toolbar/master/screenshots/2.png" width="600" />

#### uiComponents
<img src="https://raw.githubusercontent.com/magespecialist/mage-chrome-toolbar/master/screenshots/3.png" width="600" />

#### Profiler
<img src="https://raw.githubusercontent.com/magespecialist/mage-chrome-toolbar/master/screenshots/5.png" width="600" />

</details>

---

## 📄 License

This project is licensed under the **Open Software License (OSL 3.0)**.

Original work Copyright © 2017 Skeeller srl / MageSpecialist.
