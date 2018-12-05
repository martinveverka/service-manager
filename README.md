# MV Service Manager

## Installation and usage

Clone or download repository and install package using npm:

	$ npm install
	
Create configuration file at `var/configuration.json` (example included).

Run without installing windows service.

	$ node app start

Install window service and start manager.

	$ node app install

Stop and uninstall service manager.

	$ node app uninstall
