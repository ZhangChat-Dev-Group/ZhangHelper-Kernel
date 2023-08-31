class Command{
	constructor(core) {}
	get info() {
		return {
			name: 'reload',
			developer: 'ZhangSoft',
			level: 4,
			explain: '热重载所有命令',
			usage: '^reload',
		}
	}
	run(core, bot, user, args, payload){
		const loadResult = core.commands.initCommands()
		bot.loadHooks()
		var result = `已重载 ${core.commands.commands.length} 个命令\n`
		if (loadResult.length > 0) result += `错误如下：\n${loadResult.join('\n')}`
		bot.chat(result)
	}
}

module.exports = Command
