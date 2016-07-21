const assert = require('chai').assert;
const PackerFile = require('./../PackerFile');

describe ('PackerFile', function () {
	var file;
	it('should be able to be instantiated', function() {
		file = new PackerFile();
		assert.instanceOf(file, PackerFile);
	});
	describe('Read', function() {
		it('should read a file', function(done) {
			file.Read('./test/testfile1.json', function() {
				done();
			});
		});
		it('should parse variables', function() {
			assert.equal(file.variables.variable1, 'value1');
		});
		it('should parse builders', function() {
			assert.equal(file.builders[0].type, 'digitalocean');
		});
		it('should parse provisioners', function() {
			assert.equal(file.provisioners[0].type, 'shell');
		});
		it('should parse post-processors', function() {
			assert.equal(file.postprocessors[0], 'compress');
		});
	});
});