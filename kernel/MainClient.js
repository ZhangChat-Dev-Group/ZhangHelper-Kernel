const WebSocket = require('ws')

class UserList {
	constructor (core) {
		this.users = []
		this.core = core
	}
	add(payload) {
		if (payload.trip === this.core.config.admin) payload.level = 4    // 超级管理员
		else if (payload.level >= 999999) payload.level = 3    // 普通管理员（mod）
		else if (this.core.config.ops.includes(payload.trip)) payload.level = 2    // 协管
		else payload.level = 1    // 普通用户
		this.users.push(payload)
	}
	del(nick) {
		this.users = this.users.filter(u => u.nick !== nick)
	}
	get(nick) {
		return this.users.find((u) => u.nick === nick)
	}
	change(nick,newNick) {
		this.users = this.users.map(u => {
			if (u.nick === nick) u.nick = newNick
			return u
		})
	}
}

class MainClient extends WebSocket {
	constructor(core) {
		super(core.config.auth.server)
		this.core = core
		this.core.logger.info('Connecting to ' + this.core.config.auth.server)
		this.on('error', this.handleError)
		this.on('open', this.handleOpen)
		this.on('close', this.handleClose)
		this.on('message', this.handleMessage)
		this.hooks = {}
		this.users = new UserList(core)
		this.loadHooks()
	}
	sendJSON(obj) {
		this.send(JSON.stringify(obj))
	}
	handleError() {
		this.core.logger.error(`Failed to connect to ${this.core.config.auth.server}`)
		process.exit(1)
	}
	handleOpen() {
		this.core.logger.info(`Successfully connected to ${this.core.config.auth.server}`)
		this.core.logger.info(`Joining to ?${this.core.config.auth.channel}`)
		this.sendJSON({
			cmd: 'join',
			nick: this.core.config.auth.nick,
			password: this.core.config.auth.password,
			pass: this.core.config.auth.password,    // for hack.chat
			channel: this.core.config.auth.channel,
			bot: true,    // for chat.zhangsoft.cf
		})
	}
	handleClose() {
		this.core.logger.error(`Connection to ${this.core.config.auth.server} disconnected`)
		process.exit(1)
	}
	async handleMessage(data) {
		const payload = this.runHooks(JSON.parse(data))
		if (payload === false) return
		const cmd = payload.cmd

		if (cmd === 'onlineSet') {
			payload.users.forEach((u) => this.users.add(u))
			this.core.logger.info('Users online: ' + payload.nicks.join(', '))
		}else if (cmd === 'chat') {
			this.core.logger.info(`${payload.nick}#${payload.trip || ''}: ${payload.text}`)
			if (!payload.text.startsWith('^')) return
			const user = this.users.get(payload.nick)
			if (!user) {
				this.core.logger.error(`Can\'n find user ${payload.nick}`)
				process.exit(1)
			}
			if (this.core.config.ops.includes(user.trip) && user.level < 100000) user.level = 100000
			const cmdResult = await this.core.commands.handleCommand(user, payload)
			if (cmdResult === 404) {
				this.chat(`抱歉，这好像不在我的工作范围之内。`)
				return
			}
			if (cmdResult === 403) {
				this.chat('你是想篡权夺位么？')
				return
			}
			if (cmdResult !== false){ 
				this.chat('抱歉，我在处理你的请求时，出现了未知问题。')
				return
			}
		}else if (cmd === 'onlineAdd') {
			this.users.add(payload)
			this.core.logger.info(payload.nick + ' joined')
		}else if (cmd === 'onlineRemove') {
			this.users.del(payload.nick)
			this.core.logger.info(payload.nick + ' left')
		}else if (cmd === 'changeNick') {
			this.users.change(payload.nick, payload.text)
			this.core.logger.info(`${payload.nick} => ${payload.text}`)
		}else if (cmd === 'info') {
			this.core.logger.info(`Server: ${payload.text}`)
		}else if (cmd === 'warn') {
			this.core.logger.warn(`Server: ${payload.text}`)
			this.chat(`出错了！详细信息：\n${payload.text}`)
		}
	}
	chat(text) {
		this.sendJSON({
			cmd: 'chat',
			text,
		})
	}
	whisper(nick, text) {
		this.sendJSON({
			cmd: 'whisper',
			text: '.\n' + text,
			nick,
		})
	}
	regHook(command, main, level) {
		if (!Array.isArray(this.hooks[command])) this.hooks[command] = []
		this.hooks[command].push({
			main,
			level,
		})
		this.core.logger.info(`Added a hook for ${command}, the level is ${level}`)
	}
	clearHooks() {
		this.hooks = {}
	}
	loadHooks() {
		this.clearHooks()
		this.core.commands.loadHooks(this)
		Object.keys(this.hooks).forEach((c) => {
			this.hooks[c].sort((a, b) => a.level - b.level)
		})
	}
	runHooks(data) {
		const cmd = data.cmd
		if (!Array.isArray(this.hooks[cmd])) return data
		let payload = data
		for (let i = 0; i < this.hooks[cmd].length; i++) {
			payload = this.hooks[cmd][i].main(this.core, this, data)
			if (payload === false) return false
			if (typeof payload !== 'object') throw new Error('Hook返回值类型不是对象')
		}
		return payload
	}
}

module.exports = MainClient
