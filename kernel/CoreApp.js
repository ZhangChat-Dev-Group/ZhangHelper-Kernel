const Logger = require('./Logger.js')
const ConfigManager = require('./ConfigManager.js')
const ModuleLoader = require('./ModuleLoader.js')
const CommandManager = require('./CommandManager.js')
const MainClient = require('./MainClient.js')

class CoreApp {
	constructor() {
		this.buildLogger()
		this.buildConfigManager()
		this.buildModuleLoader()
		this.buildCommandManager()
		this.buildMainClient()
		this.logger.info('Kernel initialization completed')
		process.on('exit', (code) => {
			this.logger.info('Stopping kernel, code: '+String(code))
		})
		process.on('uncaughtException', (err) => {
			this.logger.error(`The kernel encountered an unhandled error, detailed information:\n${err.stack}`)
			process.exit(1)
		})
	}
	buildLogger() {
		this.logger = new Logger()
		this.logger.info('Initializing kernel')
	}
	buildConfigManager() {
		this.configManager = new ConfigManager()
		this.logger.info(`Loading ${this.configManager.configPath}`)
		try{
			this.config = this.configManager.load()
			this.logger.info(`${this.configManager.configPath} was loaded`)
		}catch (e) {
			this.logger.error(`Failed to load ${this.configManager.configPath}\nStopping bot`)
			process.exit(1)
		}
	}
	buildModuleLoader() {
		this.loader = new ModuleLoader()
	}
	buildCommandManager() {
		this.commands = new CommandManager(this)
		this.commands.initCommands()
	}
	buildMainClient() {
		this.client = new MainClient(this)
	}
}

module.exports = CoreApp
