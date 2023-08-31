class Command{
	constructor(core) {
		this.core = core
		if (!Array.isArray(core.config.ops)) {
			core.config.ops = []
			core.configManager.save()
		}
	}
	get info() {
		return {
			name: 'op',
			developer: 'ZhangSoft',
			level: 3,
			explain: '添加或删除一位协管，不传递参数则显示所有协管列表',
			usage: '^op 识别码',
		}
	}
	run(core, bot, user, args, payload){
		if (!args[1]) {
			return bot.chat('协管列表：'+core.config.ops.join(' '))
		}
		const trip = args[1]
		if (core.config.ops.includes(trip)) {
			core.config.ops = core.config.ops.filter((t) => t !== trip)
			core.configManager.save()
			return bot.chat('已删除协管：' + trip)
		}
		core.config.ops.push(trip)
		core.configManager.save()
		bot.chat('已添加协管：' + trip)
	}
}

module.exports = Command
