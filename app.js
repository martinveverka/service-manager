require('./bootstrap.js');

var exec = require('child_process').exec;
var os = require('os');
var path = require('path');

var hostname = os.hostname();

var args = process.argv.slice(2);
var service = new WindowsService({
	name: 'MV Service Manager (' + hostname + ')',
	description: 'MV Service Manager',
	script: path.normalize(require.main.filename),
	wait: 2,
	grow: 0.5,
	env: {
		name: 'NODE_PATH',
		value: process.env.NODE_PATH
	}
});

var command = args.length > 0 ? args[0] : 'start';
switch (command) {

	case 'start':
		console.log('Starting service manager...');
		var manager = new ServiceManager();
		manager.start();
		manager.watchForChanges(function () {
			manager.reload();
		});
		break;

	case 'install':
		console.log('Installing service manager...');
		service.install(function (err, response) {
			if (err) {
				console.error('Error: ' + err);
				return;
			}
			console.log(response);
		});
		break;

	case 'uninstall':
		console.log('Uninstalling service manager...');
		service.uninstall(function (err, response) {
			if (err) {
				console.error('Error: ' + err);
				return;
			}
			console.log(response);
		});
		break;

	case 'reinstall':
		console.log('Reinstalling service manager...');
		service.uninstall(function (err, response) {
			if (response) {
				console.log(response);
			}
			service.install(function (err, response) {
				if (err) {
					console.error('Error: ' + err);
					return;
				}
				console.log(response);
			});
		});
		break;

	default:
		throw new Error('Unknown command (' + command + ')');
}
