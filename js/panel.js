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

var dataTables = {};

var port = browser.runtime.connect({
  name: "panel:" + browser.devtools.inspectedWindow.tabId
});

port.onMessage.addListener(function (msg) {
  if (msg.tabId === browser.devtools.inspectedWindow.tabId) {
    if (msg.type === 'update') {
      if (msg.payload) {
        if (!msg.payload['_protocol'] || (msg.payload['_protocol'] < 3)) {
          setRunlevel('update');
        } else {
          if (Object.keys(msg.payload['blocks']).length > 0) {
            setRunlevel('online');

            document.querySelectorAll('.mage-v1').forEach(function(el) { el.style.display = 'none'; });
            document.querySelectorAll('.mage-v2').forEach(function(el) { el.style.display = 'none'; });

            if (msg.payload['version'] === 1) {
              document.querySelectorAll('.mage-v1').forEach(function(el) { el.style.display = 'block'; });
            } else if (msg.payload['version'] === 2) {
              document.querySelectorAll('.mage-v2').forEach(function(el) { el.style.display = 'block'; });
            }

            var qpw = document.getElementById('mage-v2-query-profiler-warning');
            if (qpw) {
              qpw.style.display = (!msg.payload['queries'] || !msg.payload['queries'].length) ? 'block' : 'none';
            }

            renderPropertyTab('general', msg.payload['general']);
            renderPropertyTab('design', msg.payload['design']);
            renderTableTab('events', msg.payload['events']);
            renderTableTab('blocks', msg.payload['blocks']);
            renderTableTab('data-models', msg.payload['data-models']);
            renderTableTab('collections', msg.payload['collections']);
            renderTableTab('ui-components', msg.payload['uiComponents']);
            renderTableTab('profiler', msg.payload['profiler']);
            renderTableTab('logs', msg.payload['profiler']);
            renderTableTab('plugins', msg.payload['plugins']);
            renderTableTab('queries', msg.payload['queries']);
          } else {
            setRunlevel('fpc');
          }
        }
      } else {
        setRunlevel('no-mage');
      }
    }
  }
});

function setRunlevel(level) {
  document.querySelectorAll('.runlevel').forEach(function(el) { el.style.display = 'none'; });
  var el = document.getElementById('runlevel-' + level);
  if (el) el.style.display = 'block';
}

function renderPropertyTab(tabId, values) {
  var el = document.querySelector('#panel-' + tabId + ' .property');
  if (el) el.replaceChildren(renderPropertyOptions(values));
}

// Minimal table class replacing FooTable
class SimpleTable {
  constructor(tableEl, columns) {
    this.tableEl = tableEl;
    this.columns = columns;
    this.allRows = [];
    this.sortCol = null;
    this.sortDir = 'asc';
    this.filterText = '';

    // Read initial sort state from data-sorted / data-direction attributes
    var ths = tableEl.querySelectorAll('thead tr:first-child th');
    ths.forEach((th, i) => {
      if (th.dataset.sorted && columns[i]) {
        this.sortCol = i;
        this.sortDir = (th.dataset.direction || 'asc').toLowerCase();
      }
    });

    this._buildHeader();
    this._buildFilterRow();
  }

  _buildHeader() {
    var ths = this.tableEl.querySelectorAll('thead tr:first-child th');
    ths.forEach((th, i) => {
      var col = this.columns[i];
      if (col && col.sortable) {
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => this._applySort(i));
      }
      if (col && col.style) {
        Object.entries(col.style).forEach(([k, v]) => {
          if (v) th.style[k] = v;
        });
      }
    });
  }

  _buildFilterRow() {
    if (this.tableEl.dataset.filtering !== 'true') return;

    var thead = this.tableEl.querySelector('thead');
    var tr = document.createElement('tr');
    tr.className = 'filter-row';
    var td = document.createElement('td');
    td.colSpan = this.columns.length;

    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Filter...';
    input.className = 'filter-input form-control input-sm';
    input.style.width = '100%';
    input.addEventListener('input', (e) => {
      this.filterText = e.target.value.toLowerCase();
      this._render();
    });

    td.appendChild(input);
    tr.appendChild(td);
    thead.appendChild(tr);
  }

  load(rows) {
    this.allRows = rows;
    this._render();
  }

  draw() {
    this._render();
  }

  _applySort(colIndex) {
    if (this.sortCol === colIndex) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortCol = colIndex;
      this.sortDir = 'asc';
    }
    this._render();
  }

  _render() {
    var tbody = this.tableEl.querySelector('tbody');
    var rows = this.allRows.slice();

    // Filter
    if (this.filterText) {
      rows = rows.filter(row => {
        return this.columns.some(col => {
          if (!col.filterable) return false;
          var val = row[col.name];
          if (val == null) return false;
          var text = (val instanceof Node ? val.textContent : String(val)).toLowerCase();
          return text.includes(this.filterText);
        });
      });
    }

    // Sort
    if (this.sortCol !== null && this.sortCol < this.columns.length) {
      var col = this.columns[this.sortCol];
      var dir = this.sortDir;
      rows.sort(function(a, b) {
        var av = a[col.name];
        var bv = b[col.name];
        var as = av instanceof Node ? av.textContent : String(av || '');
        var bs = bv instanceof Node ? bv.textContent : String(bv || '');
        var an = parseFloat(as);
        var bn = parseFloat(bs);
        var cmp = (!isNaN(an) && !isNaN(bn)) ? (an - bn) : as.localeCompare(bs);
        return dir === 'asc' ? cmp : -cmp;
      });
    }

    var frag = document.createDocumentFragment();
    rows.forEach(row => {
      var tr = document.createElement('tr');
      this.columns.forEach(col => {
        var td = document.createElement('td');
        if (col.style) {
          Object.entries(col.style).forEach(([k, v]) => {
            if (v) td.style[k] = v;
          });
        }
        var val = row[col.name];
        if (val != null) {
          if (val instanceof Node) {
            td.appendChild(val);
          } else {
            td.textContent = String(val);
          }
        }
        tr.appendChild(td);
      });
      frag.appendChild(tr);
    });

    // Replace tbody contents and re-attach click handlers
    tbody.replaceChildren(frag);
    this._attachClickHandlers();
  }

  _attachClickHandlers() {
    this.tableEl.querySelectorAll('a.phpstorm-url').forEach(el => {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        fetch(e.currentTarget.href);
      });
    });

    this.tableEl.querySelectorAll('a.inspect-block').forEach(el => {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        var blockId = e.currentTarget.getAttribute('href');
        browser.devtools.inspectedWindow.eval(
          "inspect(document.querySelector('[data-mspdevtools=\"" + blockId + "\"]'))"
        );
      });
    });

    this.tableEl.querySelectorAll('a.inspect-ui-component').forEach(el => {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        var blockId = e.currentTarget.getAttribute('href');
        browser.devtools.inspectedWindow.eval(
          "inspect(document.querySelector('[data-mspdevtools-ui=\"" + blockId + "\"]'))"
        );
      });
    });

    this.tableEl.querySelectorAll('a.show-details').forEach(el => {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        var anchor = e.currentTarget;
        var details = JSON.parse(anchor.getAttribute('data-details'));
        showDetailModal(getBlockInfo(details, 'compact'));
      });
    });
  }
}

function showDetailModal(contentNode) {
  var modal = document.getElementById('detail-modal');
  var body = document.getElementById('detail-modal-body');
  body.replaceChildren(contentNode || document.createTextNode('No details available'));
  modal.style.display = 'block';
}

function renderTableTab(tabId, values) {
  var columns = [];
  var colsInfo = {};
  var rows = [];

  var tableEl = document.querySelector('#panel-' + tabId + ' table');
  if (!tableEl) return;

  var colsTh = tableEl.querySelectorAll('thead tr:first-child th');
  for (var i = 0; i < colsTh.length; i++) {
    var th = colsTh[i];
    var colIndex = th.getAttribute('data-index');
    var dataType = th.getAttribute('data-type');
    var dataWidth = th.getAttribute('data-width');
    var dataIcon = th.getAttribute('data-icon');
    var dataExplode = th.getAttribute('data-explode');
    var label = th.innerHTML;

    if (!dataWidth) dataWidth = 0;
    if (!colIndex) continue;

    colsInfo[colIndex] = {
      'type': dataType,
      'icon': !!dataIcon,
      'explode': !!dataExplode,
    };

    var style = {
      'overflow': 'hidden',
      'textOverflow': 'ellipsis',
      'wordBreak': 'keep-all',
      'whiteSpace': 'nowrap',
      'width': dataWidth,
      'maxWidth': dataWidth,
      'textAlign': (dataType === 'int') ? 'right' : 'left',
      'verticalAlign': 'middle'
    };

    if (dataIcon) {
      style['paddingLeft'] = '4px';
      style['paddingRight'] = '4px';
      style['width'] = '30px';
      style['maxWidth'] = '30px';
    }

    columns.push({
      'name': colIndex,
      'title': label,
      'filterable': !dataIcon,
      'sortable': !dataIcon,
      'style': style
    });
  }

  if (!values) {
    values = {};
  }

  Object.keys(values).forEach(function (k) {
    var row = {};

    columns.forEach(function (col) {
      var val = values[k][col['name']];
      var colType = colsInfo[col['name']]['type'];
      var colIcon = colsInfo[col['name']]['icon'];
      var colExplode = colsInfo[col['name']]['explode'];

      if (colExplode) {
        var a = document.createElement('a');
        a.title = 'Show details';
        a.href = '#';
        a.setAttribute('data-details', JSON.stringify(values[k]));
        a.className = 'show-details';
        a.textContent = String(val);
        val = a;
      }

      if (colIcon && val) {
        var iconLink = document.createElement('a');
        var iconSpan = document.createElement('span');
        if (colType === 'phpstorm') {
          iconLink.title = 'Open in PhpStorm';
          iconLink.className = 'phpstorm-url';
          iconLink.href = String(val);
          iconSpan.className = 'glyphicon glyphicon-file';
        } else if (colType === 'inspect-block') {
          iconLink.title = 'Find in DOM';
          iconLink.className = 'inspect-block';
          iconLink.href = String(val);
          iconSpan.className = 'glyphicon glyphicon-eye-open';
        } else if (colType === 'inspect-ui-component') {
          iconLink.title = 'Find in DOM';
          iconLink.className = 'inspect-ui-component';
          iconLink.href = String(val);
          iconSpan.className = 'glyphicon glyphicon-eye-open';
        }
        iconLink.appendChild(iconSpan);
        val = iconLink;
      }

      row[col['name']] = val;
    });

    rows.push(row);
  });

  if (!dataTables.hasOwnProperty(tabId)) {
    dataTables[tabId] = new SimpleTable(tableEl, columns);
  }

  dataTables[tabId].load(rows);
}

// Native tab switching replacing Bootstrap JS tab events
function initTabs() {
  document.querySelectorAll('a[data-toggle="tab"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();

      var targetId = link.getAttribute('href');
      var target = document.querySelector(targetId);
      if (!target) return;

      // Deactivate all tabs and panes
      document.querySelectorAll('.nav-tabs li').forEach(function(li) {
        li.classList.remove('active');
      });
      document.querySelectorAll('.tab-pane').forEach(function(pane) {
        pane.classList.remove('active', 'in');
      });

      // Activate clicked tab and target pane
      var parentLi = link.closest('li');
      if (parentLi) parentLi.classList.add('active');
      target.classList.add('active', 'in');

      // Redraw table if applicable
      var tabId = targetId.replace('#panel-', '');
      if (dataTables[tabId]) {
        dataTables[tabId].draw();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initTabs();

  // Detail modal close handlers
  var modal = document.getElementById('detail-modal');
  if (modal) {
    document.getElementById('detail-modal-close').addEventListener('click', function() {
      modal.style.display = 'none';
    });
    modal.addEventListener('click', function(e) {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  // Request initial data from devtools
  port.postMessage({
    tabId: browser.devtools.inspectedWindow.tabId,
    to: 'devtools',
    type: 'update',
    payload: {}
  });
});
