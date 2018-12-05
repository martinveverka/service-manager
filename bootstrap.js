var path = require('path');
global.baseDir = path.dirname(module.filename);

global.configurationFile = path.resolve(global.baseDir + '/var/configuration.json');
global.configuration = require(global.configurationFile);

global.Service = require(global.baseDir + '/lib/Service.js');
global.ServiceManager = require(global.baseDir + '/lib/ServiceManager.js');
global.ServiceNodemonWrapper = require(global.baseDir + '/lib/ServiceNodemonWrapper.js');
global.WindowsService = require(global.baseDir + '/lib/WindowsService.js');
