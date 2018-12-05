function ServiceNodemonWrapper(name) {
	var restarting = false;

	this.start = function (cwd, configuration) {
		var nodemon = require('nodemon');
		// chdir to first watch item, so the watching could work
		process.chdir(cwd);
		nodemon(configuration)
			.on('start', function () {
				// child process has started
				restarting = false;
				log('Starting ' + configuration.script + '...');
				//log('nodemon start', nodemon.config);
			})
			.on('restart', function (files) {
				// child process has restarted
				restarting = true;
				if (files) {
					log('Restarted; after files have changed:', files);
				}
			})
			.on('crash', function () {
				// child process has crashed (nodemon will not emit exit)
				log('Crashed.');
				restart(function () {
					nodemon.emit('restart');
					log('Restarted after crash.');
				}, 50);
			})
			.on('exit', function () {
				// child process has cleanly exited (ie. no crash)
				log('Exit.');
				restart(function () {
					nodemon.emit('restart');
					log('Restarted after clean exit.');
				}, 250);
			});
	};

	function restart(callback, delay) {
		if (restarting) {
			return;
		}
		restarting = true;
		setTimeout(function () {
			if (restarting) {
				callback();
				restarting = false;
			}
		}, delay);
	}

	function log() {
		var args = Array.prototype.slice.call(arguments);
		args.unshift('[nodemon]');
		console.log.apply(console, args);
	}
}

module.exports = ServiceNodemonWrapper;
