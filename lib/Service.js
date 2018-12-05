var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

function Service(name) {
	var self = this;

	var child = null;
	var serviceConfiguration = null;
	var stopping = false;

	var bin, cwd, args, stdout, stderr;

	this.reset = function () {
		var logDirectory = global.configuration['log-directory'];
		var service = global.configuration.services[name];
		serviceConfiguration = serializeConfiguration();
		bin = service.bin || process.execPath;
		cwd = service.cwd || process.cwd();
		args = [];
		if (Array.isArray(service.args)) {
			for (var i = 0; i < service.args.length; i++) {
				args.push(service.args[i]);
			}
		}
		stdout = path.resolve(logDirectory + '/' + name + '.output.log');
		stderr = path.resolve(logDirectory + '/' + name + '.error.log');
	};

	// TODO
	this.startWrappedService = function (callback) {
		if (child !== null) {
			callback('Cannot start, already running.');
			return;
		}
		//var env = {};
		/*for (var key in process.env) {
			env[key] = process.env[key];
		}*/
		var spawnArgs = [];
		for (var i = 0; i < args.length; i++) {
			spawnArgs.push(args[i]);
		}
		process.chdir(cwd);
		child = spawn(bin, spawnArgs, {
			//env: env,
			stdio: [
				'ignore',
				fs.openSync(stdout, 'w'), // a = append, w = rewrite
				fs.openSync(stderr, 'a')
			]
		});
		child.on('error', function (err) {
			if (err.code !== 'ENOENT') {
				log('Binary not found.', bin);
			}
		});
		child.on('close', function (code, signal) {
			self.restart(function (err, response) {
				if (response) {
					if (code === 99) {
						log('Management console restarted service.');
					} else {
						log('Crashed (' + code + ') and restarted.');
					}
				}
			});
		});
		callback(null, true);
	};

	this.hasStarted = function () {
		return child !== null;
	};

	this.reload = function (callback) {
		var oldServiceConfiguration = serviceConfiguration;
		self.reset();

		if (serviceConfiguration === oldServiceConfiguration) {
			callback(null, false);
		} else {
			self.restart(callback);
		}
	};

	this.restart = function (callback) {
		if (typeof global.configuration.services[name] === 'undefined') {
			callback(null, false);
			return;
		}
		self.stop(function (err, response) {
			if (err) {
				callback('STOP Error: ' + err);
				return;
			}
			self.startWrappedService(function (err, response) {
				if (err) {
					callback('START Error: ' + err);
					return;
				}
				callback(null, true);
			});
		});
	};

	this.stop = function (callback) {
		if (stopping) {
			return;
		}
		stopping = true;
		if (child === null) {
			callback('Cannot stop, not running.');
			return;
		}
		child.kill('SIGKILL');
		setTimeout(function () {
			child = null;
			stopping = false;
			callback(null, true);
		}, 100);
	};

	function serializeConfiguration() {
		return JSON.stringify(global.configuration.services[name]);
	}

	function log() {
		var args = Array.prototype.slice.call(arguments);
		args.unshift('[' + name + ']');
		console.log.apply(console, args);
	}

	this.reset();
}

module.exports = Service;
