const assert = require('chai').assert;
const PackerFile = require('./../PackerFile');

describe ('PackerFile', function () {
	it('should be able to be instantiated', function() {
		var file = new PackerFile();
		assert.notEqual(file, null);
	});
});