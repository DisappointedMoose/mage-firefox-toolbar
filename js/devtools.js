/**
 * MageSpecialist
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/osl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to info@magespecialist.it so we can send you a copy immediately.
 *
 * @category   MSP
 * @package    MSP_DevTools
 * @copyright  Copyright (c) 2017 Skeeller srl (http://www.magespecialist.it)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

console.log('MSP DevTools: devtools.js loading...');
console.log('MSP DevTools: browser object available:', typeof browser !== 'undefined');
console.log('MSP DevTools: browser.devtools available:', typeof browser !== 'undefined' && typeof browser.devtools !== 'undefined');

var port = browser.runtime.connect({
  name: "devtools:" + browser.devtools.inspectedWindow.tabId
});

function updateDevToolsInformation() {
  function onUpdateMessage() {
    return window.mspDevTools;
  }

  browser.devtools.inspectedWindow.eval('(' + onUpdateMessage.toString() + ')()').then(function (result) {
    var res = result[0]; // eval returns [result, exceptionInfo]
    var tabId = browser.devtools.inspectedWindow.tabId;

    port.postMessage({
      tabId: tabId,
      type: 'update',
      to: 'panel',
      payload: res
    });
  }).catch(function (err) {
    console.error('Error updating devtools info:', err);
  });
}

// Create the Magento panel
browser.devtools.panels.create(
  "Magento",
  "images/icon16x16.png",
  "panel/panel.html"
).then(function (panel) {
  console.log('Magento panel created');
}).catch(function (err) {
  console.error('Error creating Magento panel:', err);
});

var magentoSidebarPane = null;

// Create the sidebar pane
browser.devtools.panels.elements.createSidebarPane("Magento").then(function (sidebar) {
  magentoSidebarPane = sidebar;
  sidebar.setPage('inspector.html');
  console.log('Magento sidebar pane created');
}).catch(function (err) {
  console.error('Error creating sidebar pane:', err);
});

// Handle element selection changes and update the sidebar
browser.devtools.panels.elements.onSelectionChanged.addListener(function () {
  updateInspectorSidebar();
});

function updateInspectorSidebar() {
  if (!magentoSidebarPane) {
    return;
  }

  function onSelectionChange(el) {
    if (!window.mspDevTools || !window.mspDevTools.hasOwnProperty('blocks')) {
      return { status: 'no-data' };
    }

    // Locate nearest parent with msp devtools info
    var fetchAttr = function (node, attr) {
      while (node) {
        try {
          var attrValue = node.getAttribute(attr);
          if (attrValue) {
            return attrValue;
          }
        } catch (e) {
        }
        node = node.parentNode;
      }
    };

    // UI Component search
    var uiBlockId = fetchAttr(el, 'data-mspdevtools-ui');
    if (uiBlockId) {
      if (!window.mspDevTools['uiComponents'].hasOwnProperty(uiBlockId)) {
        return { status: 'missing' };
      }
      if (window.mspDevTools['uiComponents'][uiBlockId]) {
        return { status: 'found', data: window.mspDevTools['uiComponents'][uiBlockId] };
      }
    }

    // Block search
    var blockId = fetchAttr(el, 'data-mspdevtools');
    if (blockId) {
      if (!window.mspDevTools['blocks'].hasOwnProperty(blockId)) {
        return { status: 'missing' };
      }
      if (window.mspDevTools['blocks'][blockId]) {
        return { status: 'found', data: window.mspDevTools['blocks'][blockId] };
      }
    }

    return { status: 'empty' };
  }

  browser.devtools.inspectedWindow.eval('(' + onSelectionChange.toString() + ')($0)').then(function (result) {
    var evalResult = result[0]; // eval returns [result, exceptionInfo]
    if (!evalResult) {
      return;
    }

    // Send inspector data via port messaging
    port.postMessage({
      tabId: browser.devtools.inspectedWindow.tabId,
      type: 'inspector-update',
      to: 'inspector',
      payload: evalResult
    });
  }).catch(function (err) {
    console.error('Error updating inspector sidebar:', err);
  });
}

port.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.tabId === browser.devtools.inspectedWindow.tabId) {
    if (msg.type === 'update') {
      updateDevToolsInformation();
      // Also update the inspector sidebar when data updates
      updateInspectorSidebar();
    }
  }
});

updateDevToolsInformation();
// Initial inspector update
updateInspectorSidebar();