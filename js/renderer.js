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

function makeEl(tag, className) {
  var el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

function renderPropertyOptions(data) {
  if (!data) return renderProperty({});

  var flattenProperty = {};
  for (var i = 0; i < data.length; i++) {
    flattenProperty[data[i]['label']] = data[i]['value'];
  }

  return renderProperty(flattenProperty);
}

function renderProperty(data) {
  var res = makeEl('span', 'rendered-property');

  if (Array.isArray(data)) {
    var ul = makeEl('ul');
    for (var i = 0; i < data.length; i++) {
      var li = makeEl('li');
      li.appendChild(renderProperty(data[i]));
      ul.appendChild(li);
    }
    res.appendChild(ul);

  } else if (data !== null && typeof data === 'object') {
    var dl = makeEl('div', 'definition-list');
    Object.keys(data).forEach(function (k) {
      var dr = makeEl('div', 'definition-row');
      var dt = makeEl('div', 'definition-term');
      var dd = makeEl('div', 'definition-data');

      dt.textContent = k;
      dd.appendChild(renderProperty(data[k]));

      dr.appendChild(dt);
      dr.appendChild(dd);

      dl.appendChild(dr);
    });

    res.appendChild(dl);
  } else {
    res.classList.add('string');
    res.textContent = data;
  }

  return res;
}

function getPhpStormLinks(data) {
  var phpStormLinks = data['phpstorm_links'];
  var phpStormLinksEl = null;

  if (phpStormLinks && phpStormLinks.length) {
    phpStormLinksEl = makeEl('div', 'phpstorm-links rendered-property');
    var dl = makeEl('div', 'definition-list');

    var h4 = makeEl('h4');
    h4.textContent = 'PhpStorm Shortcuts';
    phpStormLinksEl.appendChild(h4);
    phpStormLinksEl.appendChild(dl);

    for (var i = 0; i < phpStormLinks.length; i++) {
      var link = makeEl('a', 'phpstorm-link');
      link.href = phpStormLinks[i]['link'];
      link.textContent = phpStormLinks[i]['file'];

      var dr = makeEl('div', 'definition-row');
      var dt = makeEl('div', 'definition-term');
      dt.textContent = phpStormLinks[i]['key'];
      var dd = makeEl('div', 'definition-data');

      dd.appendChild(link);
      dr.appendChild(dt);
      dr.appendChild(dd);
      dl.appendChild(dr);
    }
  }

  delete data['id'];
  delete data['phpstorm_url'];
  delete data['phpstorm_links'];

  return phpStormLinksEl;
}

function getPerformanceProperties(data) {
  var allowedFields = ['time', 'proper_time', 'count'];

  var data2 = {};
  allowedFields.forEach(function (k) {
    if (data.hasOwnProperty(k)) {
      data2[k] = data[k];
      delete data[k];
    }
  });

  if (!Object.keys(data2).length) {
    return null;
  }

  var blockInfo = makeEl('div', 'block-performance');
  var h4 = makeEl('h4');
  h4.textContent = 'Performance';
  blockInfo.appendChild(h4);
  blockInfo.appendChild(renderProperty(data2));

  return blockInfo;
}

function getBlockMain(data) {
  var allowedFields = ['name', 'type', 'class', 'class_method', 'plugins', 'template', 'module', 'cms_block_id', 'component', 'sql', 'grade'];

  var data2 = {};
  allowedFields.forEach(function (k) {
    if (data.hasOwnProperty(k)) {
      data2[k] = data[k];
      delete data[k];
    }
  });

  if (!Object.keys(data2).length) {
    return null;
  }

  var blockInfo = makeEl('div', 'block-main');
  var h4 = makeEl('h4');
  h4.textContent = 'Main Information';
  blockInfo.appendChild(h4);
  blockInfo.appendChild(renderProperty(data2));

  return blockInfo;
}

function getExtraProperties(data) {
  if (!Object.keys(data).length) {
    return null;
  }

  var blockInfo = makeEl('div', 'block-extra');
  var h4 = makeEl('h4');
  h4.textContent = 'Extra Properties';
  blockInfo.appendChild(h4);
  blockInfo.appendChild(renderProperty(data));

  return blockInfo;
}

function getBlockInfo(data, customClass) {
  var data2 = Object.assign({}, data);

  if (!Object.keys(data2).length) {
    return null;
  }

  var main = getBlockMain(data2);
  var phpStorm = getPhpStormLinks(data2);
  var performance = getPerformanceProperties(data2);
  var extra = getExtraProperties(data2);

  var div = makeEl('div', customClass || '');

  if (phpStorm) div.appendChild(phpStorm);
  if (main) div.appendChild(main);
  if (performance) div.appendChild(performance);
  if (extra) div.appendChild(extra);

  return div;
}
