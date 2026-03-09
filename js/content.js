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

var port = browser.runtime.connect({name: "content"});

function nextUntil(node, stop) {
  var results = [];
  var cur = node.nextSibling;
  while (cur && cur !== stop) {
    if (cur.nodeType === 1) results.push(cur);
    cur = cur.nextSibling;
  }
  return results;
}

function addDocumentInformation() {
  var blocks = [];

  var markers = document.evaluate('//comment()[contains(., "START_MSPDEV[")]', document, null, XPathResult.ANY_TYPE, null);
  while (true) {
    var startMarker = markers.iterateNext();

    if (startMarker) {
      var endMarkerContent = startMarker.textContent.replace('START_MSPDEV', 'END_MSPDEV').trim();

      var endMarker = document.evaluate('//comment()[contains(., "' + endMarkerContent + '")]', document, null, XPathResult.ANY_TYPE, null).iterateNext();
      if (endMarker) {
        var m = endMarker.textContent.match(/END_MSPDEV\[(\w+)\]/);
        if (m) {
          var blockId = m[1];
          var section = nextUntil(startMarker, endMarker);

          blocks.push({
            'blockId': blockId,
            'section': section
          });
        }
      }
    } else {
      break;
    }
  }

  blocks.forEach(function(block) {
    block.section.forEach(function(el) {
      el.setAttribute('data-mspdevtools', block.blockId);
      el.querySelectorAll('*').forEach(function(child) {
        child.setAttribute('data-mspdevtools', block.blockId);
      });
    });
  });
}

function updateDevToolsInformation()
{
  port.postMessage({
    type: 'update',
    to: 'devtools',
    payload: {}
  });
}

window.addEventListener("message", function (event) {
  if (event.source !== window) {
    return;
  }

  // Differential update received
  if (event.data === 'mspDevToolsUpdate') {
    updateDevToolsInformation();
  }
});

// content scripts run at document_idle (after DOMContentLoaded) by default
addDocumentInformation();

port.postMessage({
  type: 'icon',
  to: 'background',
  payload: document.querySelector('[data-mspdevtools]') !== null ? 'online' : 'offline'
});

updateDevToolsInformation();
