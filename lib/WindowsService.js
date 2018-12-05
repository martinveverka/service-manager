function WindowsService(configuration) {
	var svc = null;

	function initialize () {
		if (svc) {
			return;
		}
		svc = new (require('node-windows')).Service(configuration);
	}

	this.install = function (callback) {
		initialize();
		svc.once('invalidinstallation', function () {
			callback('Invalid installation.');
		});
		svc.once('alreadyinstalled', function () {
			callback('Already installed.');
		});
		svc.once('install', function () {
			svc.once('start', function () {
				callback(null, 'Installed & started.');
			});
			svc.start();
		});
		try {
			svc.install();
		} catch (e) {
			callback(e.message, null);
		}
	};

	this.uninstall = function (callback) {
		initialize();
		if (!svc.exists) {
			callback('Windows service does not exist');
			return;
		}
		svc.once('stop', function () {
			svc.once('uninstall', function () {
				callback(null, 'Stopped & uninstalled.');
			});
			svc.uninstall();
		});
		try {
			svc.stop();
		} catch (e) {
			callback(e.message, null);
		}
	};
}

module.exports = WindowsService;
