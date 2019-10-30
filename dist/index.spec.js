'use strict';

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var describe = require('mocha').describe;
var it = require('mocha').it;
var expect = require('chai').expect;
var path = require('path');
var fs = require('fs');
var ROOT = path.resolve(__dirname, '../test/fixtures');
var fixtures = fs.readdirSync(ROOT).filter(function (filepath) {
  return filepath.indexOf('.') !== 0;
});

var mos = require('mos-processor');
var ejs = require('mos-plugin-ejs');


describe('mos-plugin-toc', function () {
  fixtures.forEach(function (fixture) {
    var filepath = path.join(ROOT, fixture);
    var output = fs.readFileSync(path.join(filepath, 'output.md'), 'utf-8');
    var inputPath = path.join(filepath, 'input.md');
    var input = fs.readFileSync(inputPath, 'utf-8');
    var configPath = path.join(filepath, 'config.json');
    var config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf-8')) : {};

    it('should pass fixture in dir ' + filepath, function (done) {
      mos({ content: input, filePath: inputPath }, [ejs, { register: _index2.default, options: config }]).then(function (processor) {
        return processor.process();
      }).then(function (result) {
        expect(result).to.eq(output);
        done();
      }).catch(done);
    });
  });
});