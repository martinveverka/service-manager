var fs = require('fs');

function ServiceManager() {
	var services = {};

	this.watchForChanges = function (callback) {
		fs.watchFile(global.configurationFile, function (curr, prev) {
			console.log('Configuration has changed.');
			callback();
		});
	};

	this.start = function () {
		for (var name in global.configuration.services) {
			startService(name);
		}
	};

	this.reload = function () {
		var oldServices = global.configuration.services;

		// reload configuration
		if (typeof require.cache[global.configurationFile] !== 'undefined') {
			delete require.cache[global.configurationFile];
		}

		try {
			var newConfiguration = require(global.configurationFile);
			global.configuration = newConfiguration;
		} catch (e) {
			console.log('Error in configuration file:', e);
			return;
		}

		var newServices = global.configuration.services;
		for (var name in oldServices) {
			if (typeof newServices[name] === 'undefined') {
				// stop removed service
				removeService(name);
			}
		}
		for (var name in newServices) {
			if (typeof services[name] === 'undefined') {
				// start newly added service
				startService(name);
			} else {
				// reload existing service
				reloadService(name);
			}
		}
	};

	function startService(name) {
		services[name] = new Service(name);
		services[name].startWrappedService(function (err, response) {
			if (err) {
				console.log('[' + name + '] Error while starting:', err);
				return;
			}
			if (response) {
				console.log('[' + name + '] Starting...');
			}
		});
	}

	function reloadService(name) {
		services[name].reload(function (err, response) {
			if (err) {
				console.log('[' + name + '] Error while reloading:', err);
				return;
			}
			if (response) {
				console.log('[' + name + '] Reloading...');
			}
		});
	}

	function removeService(name) {
		services[name].stop(function (err, response) {
			if (err) {
				console.log('[' + name + '] Error while stopping:', err);
				return;
			}
			if (response) {
				console.log('[' + name + '] Stopping...');
			}
		});
		services[name] = null;
		delete services[name];
	}
}

module.exports = ServiceManager;
