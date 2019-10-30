'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.default = plugin;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var toString = require('mdast-util-to-string');
var m = require('markdownscript');
var h2 = m.h2;
var code = m.code;

var fullCommands = {
  install: 'install',
  save: '--save',
  saveDev: '--save-dev',
  global: '--global'
};

var shortCommands = {
  install: 'i',
  save: '-S',
  saveDev: '-D',
  global: '-g'
};

function plugin(mos, md) {
  mos.compile.pre(function (next, ast, opts) {
    ast.children = updateInstallationSection(ast.children);
    return next(ast, opts);
  });

  (0, _assign2.default)(mos.scope, {
    installation: compileInstallation
  });

  function compileInstallation(opts) {
    opts = (0, _assign2.default)({}, md.options, opts || {});
    return [h2(['Installation']), code({
      lang: 'sh',
      value: createCommand(opts)
    })];
  }

  function createCommand(opts) {
    var commands = opts.useShortAlias ? shortCommands : fullCommands;
    if (md.pkg.private || md.pkg.license === 'private') {
      return ['git clone ' + md.repo.clone_url + ' && cd ./' + md.repo.repo, '', '# via NPM', 'npm ' + commands.install, '', '# via Yarn', 'yarn'].join('\n');
    }
    var installedPkgs = (0, _keys2.default)(md.pkg.peerDependencies || {}).concat(md.pkg.name).join(' ');
    if (md.pkg.preferDev) {
      return ['# via NPM', 'npm ' + commands.install + ' ' + commands.saveDev + ' ' + installedPkgs, '', '# via Yarn', 'yarn add --dev ' + installedPkgs].join('\n');
    }
    return ['# via NPM', 'npm ' + commands.install + ' ' + (md.pkg.preferGlobal ? commands.global : commands.save) + ' ' + installedPkgs, '', '# via Yarn', 'yarn' + (md.pkg.preferGlobal ? ' global' : '') + ' add ' + installedPkgs].join('\n');
  }

  function updateInstallationSection(children) {
    if (!children.length) {
      return [];
    }
    var child = children.shift();
    if (child.type === 'heading' && toString(child).match(/^installation$/i)) {
      return compileInstallation().concat(removeSection(children));
    }
    return [child].concat(updateInstallationSection(children));
  }

  function removeSection(children) {
    if (!children.length) {
      return [];
    }
    var child = children.shift();
    if (~['heading', 'markdownScript', 'thematicBreak'].indexOf(child.type)) {
      return [child].concat(children);
    }
    return removeSection(children);
  }
}

plugin.attributes = {
  pkg: require('../package.json')
};
module.exports = exports['default'];