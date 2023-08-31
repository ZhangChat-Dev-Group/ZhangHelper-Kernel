const path = require('path')

class CommandManager {
	constructor(core, commandPath) {
		this.core = core
		this.commandPath = commandPath || path.resolve(__dirname, '..', 'commands/')
		this.commands = []
	}
	initCommands() {
		this.core.logger.info(`Loading command modules from ${this.commandPath}`)
		this.commands = []
		const errors = []
		const loadResult = this.core.loader.load(this.commandPath)
		const modules = this.core.loader.get(this.commandPath)
		if (loadResult) {
			errors.push(`Some command modules can't be loaded, error(s):\n${loadResult}`)
			this.core.logger.error(`Some command modules can't be loaded, error(s):\n${loadResult}`)
		}
		this.core.logger.info(`${Object.keys(modules).length} command module(s) will be initialized`)
		Object.keys(modules).forEach((n) =>{
			var temp = undefined
			try {
				temp = new modules[n](this.core)
			}catch (e) {
				errors.push(`Failed to initialize ${n}: ${e.message}`)
				return this.core.logger.error(`Failed to initialize ${n}: ${e.message}`)
			}
			let verifyResult = this.verifyCommand(temp)
			if (verifyResult) {
				errors.push(`Failed to initialize ${n}: ${verifyResult}`)
				return this.core.logger.error(`Failed to initialize ${n}: ${verifyResult}`)
			}
			this.commands.push(temp)
			this.core.logger.info(`Initialized ${n}`)
		})
		this.core.logger.info(`Initialized ${this.commands.length} command(s)`)
		return errors
	}
	verifyCommand(cmd) {
		const info = cmd.info
		if (typeof info !== 'object' || info === null) return 'can\'t find info object'
		if (!info.name || typeof info.name !== 'string') return 'info.name must be a not empty string'
		if (!info.developer || typeof info.developer !== 'string') return 'info.developer must be a not empty string'
		if (typeof info.level !== 'number') return 'info.level must be a number'
		if (typeof info.explain !== 'string' || !info.explain) return 'info.explain must be a not empty string'
		if (typeof info.usage !== 'string' || !info.usage) return 'info.usage must be a not empty string'
		if (typeof cmd.run !== 'function') return 'Can\'t find run function'
		return null
	}
	async runCommand(cmd, user, args, payload) {
		this.core.logger.info(`${user.nick}#${user.trip} is running ${cmd.info.name} command, args: ${args.join(' ')}`)
		try{ 
			await cmd.run(this.core, this.core.client, user, args, payload)
		} catch (err) {
			this.core.logger.error(`Failed to run ${cmd.info.name} with ${args.join(' ')}, user: ${user.nick}#${user.trip}}. error: ${err.stack}`)
			return err
		}

		return false
	}
	getCommand(name) {
		return this.commands.find((c) => c.info.name === name)
	}
	async handleCommand(user, payload) {
		const args = payload.text.split(' ')
		const cmdName = args[0].slice(1)
		const cmd = this.getCommand(cmdName)
		if (!cmd) {
			return 404
		}
		if (cmd.info.level > user.level) {
			return 403
		}
		return await this.runCommand(cmd, user, args, payload)
	}
	loadHooks(client) {
		this.commands.forEach((m) => {
			if (typeof m.initHooks === 'function') m.initHooks(client)
		})
	}
}

module.exports = CommandManager
