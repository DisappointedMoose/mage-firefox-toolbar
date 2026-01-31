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

function updateInspectorUI(result) {
  $('#inspected').css('display', 'none');
  $('#missing').css('display', 'none');
  $('#no-data').css('display', 'none');

  if (!result || result.status === 'no-data') {
    $('#no-data').css('display', 'block');
  } else if (result.status === 'missing') {
    $('#missing').css('display', 'block');
  } else if (result.status === 'found' && result.data) {
    $('#inspected').css('display', 'block');
    $('#inspected').html(getBlockInfo(result.data));
    $('.phpstorm-link').click(function(e) {
      e.preventDefault();
      fetch(e.target.href);
    });
  } else {
    // Empty or no data
    $('#no-data').css('display', 'block');
  }
}

function onItemInspected() {
  // Check if we have browser.devtools.inspectedWindow available
  if (!browser || !browser.devtools || !browser.devtools.inspectedWindow) {
    console.warn('browser.devtools.inspectedWindow not available');
    return;
  }

  function onSelectionChange(el) {
    if (!window.mspDevTools || !window.mspDevTools.hasOwnProperty('blocks')) {
      return 'no-data';
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

    // Block search
    var uiBlockId = fetchAttr(el, 'data-mspdevtools-ui');
    if (uiBlockId) {
      if (!window.mspDevTools['uiComponents'].hasOwnProperty(uiBlockId)) {
        return 'missing';
      }

      if (window.mspDevTools['uiComponents'][uiBlockId]) {
        return window.mspDevTools['uiComponents'][uiBlockId];
      }
    }

    // Block search
    var blockId = fetchAttr(el, 'data-mspdevtools');
    if (blockId) {
      if (!window.mspDevTools['blocks'].hasOwnProperty(blockId)) {
        return 'missing';
      }

      if (window.mspDevTools['blocks'][blockId]) {
        return window.mspDevTools['blocks'][blockId];
      }
    }

    return {};
  }

  browser.devtools.inspectedWindow.eval('(' + onSelectionChange.toString() + ')($0)').then(function (evalResult) {
    var res = evalResult[0]; // eval returns [result, exceptionInfo]
    // Convert old format to new format for compatibility
    var result;
    if (res === 'no-data') {
      result = { status: 'no-data' };
    } else if (res === 'missing') {
      result = { status: 'missing' };
    } else if (res && typeof res === 'object' && Object.keys(res).length > 0) {
      result = { status: 'found', data: res };
    } else {
      result = { status: 'no-data' };
    }

    updateInspectorUI(result);
  }).catch(function (err) {
    console.error('Error in inspector eval:', err);
  });
}

// Connect to background script to receive inspector updates from devtools.js
var inspectorPort = null;

function initInspectorPort() {
  if (browser && browser.devtools && browser.devtools.inspectedWindow) {
    var tabId = browser.devtools.inspectedWindow.tabId;
    inspectorPort = browser.runtime.connect({
      name: "inspector:" + tabId
    });

    inspectorPort.onMessage.addListener(function (msg) {
      if (msg.type === 'inspector-update' && msg.payload) {
        updateInspectorUI(msg.payload);
      }
    });

    console.log('Inspector port connected for tab:', tabId);
  }
}

// Initialize port connection
if (browser && browser.runtime && browser.runtime.connect) {
  initInspectorPort();
}

// Also try the direct approach if browser.devtools.panels.elements is available
if (browser && browser.devtools && browser.devtools.panels && browser.devtools.panels.elements && browser.devtools.panels.elements.onSelectionChanged) {
  browser.devtools.panels.elements.onSelectionChanged.addListener(function () {
    onItemInspected();
  });

  onItemInspected();
} else {
  // Initial display
  $('#no-data').css('display', 'block');
}
