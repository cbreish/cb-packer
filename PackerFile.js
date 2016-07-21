"use strict"

const jsonfile = require('jsonfile');
const tmp = require('tmp');
const child_process = require('child_process');
const EventEmitter = require('events');

class PackerFile extends EventEmitter {
	constructor() {
		super();
		this._filename = '';
	}

	Read(filename, callback) {
		var self = this;
		jsonfile.readFile(filename, function (err, file) {
			if (err) {
				throw err;
			}
			self._filename = filename;
			
			self.variables = file.variables || [];
			self.builders = file.builders || [];
			self.provisioners = file.provisioners || [];
			self.postprocessors = file['post-processors'] || [];
			
			callback(self);
		});
	}
	
	Write(filename, callback) {
		var self = this;
		
		if (typeof filename === 'function') {
			callback = filename;
			filename = null;
		}
		
		if (!filename && self._filename) {
			filename = self._filename;
		}
		self._filename = filename;
		
		jsonfile.writeFile(filename, this.json, {spaces:3}, function(err) {
			self._filename = filename;
			callback(err);
		});
	}
	
	get json() {
		var self = this;
		return {
			variables: self.variables,
			builders: self.builders,
			provisioners: self.provisioners,
			'post-processors': self.postprocessors
		};
	}
	
	Run(filename, opts, callback) {
		var self = this;
		if (typeof filename === 'object') {
			opts = filename;
			filename = null;
		}
		if (typeof filename === 'function') {
			callback = filename;
			filename = null;
			opts= null;
		}
		if (typeof opts === 'function') {
			callback = opts;
			opts = null;
		}
			
		if (!filename) {
			filename = this._filename;
		}
		if (!this._filename) {
			filename = tmp.tmpNameSync();
		}
		this._filename = filename;
		
		this.Write(filename, function() {
			runPacker(filename, self, callback);
		});
	}
}

module.exports = PackerFile;

var runPacker = function(filename, emitter, callback) {
	var packer = child_process.spawn('packer',['build',filename,'-machine-readable']);
	var artifacts = [];
	
	packer.stdout.on('data', (data) => {
		var str = formatPackerOutput(data);
		emitter.emit('stdout', str);
		if (str.split(',')[2] == 'artifact') {
			var artifactIndex = str.split(',')[3];
			var artifactProperty = str.split(',')[4];
			var artifactValue = str.split(',')[5];
			if (artifacts.length<artifactIndex+1) { artifacts.push({}); }
			if (artifactProperty!='end') { artifacts[artifactIndex][artifactProperty] = artifactValue; }
		}
	});
	
	packer.stderr.on('data', (data) => {
		emitter.emit('stderr', formatPackerOutput(data));
	});

	packer.on('error', (err) => {
		emitter.emit('error', err);
		throw 'Running packer failed.';
	});
	
	packer.on('close', (code) => {
		emitter.emit('close', code);
		if (code != 0) {
			throw `Running packer failed. Exit code: ${code}`;
		}
		callback(artifacts);
	});
}

var formatPackerOutput = function(input) {
	return new String(input).trim('\n').replace('%!(PACKER_COMMA)',',');
};