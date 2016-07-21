# cb-packer
> A very lightweight utility to make interacting with Hashicorp's Packer easier

## Goal
Allow simple interaction with Packer from Node.
Inspired by [node-packer](https://www.npmjs.com/package/node-packer).  If you need a more complete solution you may want to take a look at that module.

## Installation
```
npm install cb-packer --save
```

## Samples

### Read a packer file and interact with settings
```javascript
var file = new PackerFile();
file.Read('./filename.json', function() {
	console.log(file.variables.variable1);
	file.variables.variable2 = 'new value';
});
```

### Save changes to a packer file
```javascript
file.Write('./newFileName.json', function() {
	console.log('File saved.');
});
```

### Run packer
```javascript
file.on('stdout', function(data) {
	console.log(`${data}`);
});
file.on('stderr', function(data) {
	console.error(`${data}`);
});
file.on('error', function(data) {
	console.error(`${data}`);
});		

file.Run(function(artifacts) {
	console.log(`First artifact ID: ${artifacts[0].id}`);
});
```