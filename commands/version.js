class Command{
	constructor(core) {
		this.core = core
	}
	get info() {
		return {
			name: 'version',
			developer: 'ZhangSoft',
			level: 1,
			explain: '显示本机器人的版本信息',
			usage: '^version',
		}
	}
	run(core, bot, user, args, payload){
		const info = `# 关于 ZhangHelper365 内核版
内核：ZhangHelper Kernel
内核版本：1.0.2
内核发布日期：2023-8-31（UTC+08:00）
内核开发者：ZhangSoft（小张软件）
开源许可证：Apache-2.0
仓库：
机器人名称：ZhangHelper365 内核版
机器人版本：1.0.0
机器人开发者：ZhangSoft（小张软件）`
		bot.chat(info)
	}
}

module.exports = Command
