class Command{
	constructor(core) {
		// 用来的初始化函数
		// 可以用来检查 config 是否包含什么东西
		// 例如，可以检查 config 是否包含此命令需要的配置项，如果没有，那么就可以添加并保存
		// 只传入一个参数 core
	}
	get info() {
		return {
			name: '命令名称',
			developer: '开发者名称',
			level: 1,    // 用户最低执行权限，1代表普通用户，2代表协管，3代表管理员，4代表超级管理员
			explain: '命令说明',
			usage: '使用方法',
		}
	}
	run(core, bot, user, args, payload){
		// 这是最重要的函数
		// 当有人执行命令的时候，就会调用
		// 传入 5 个参数
		// core => 整个 kernel，可以用来存放一些全局变量，还可以做一些调整
		// bot => 本bot的客户端，用来接收、发送信息
		// user => 命令执行者 常用属性：user.nick user.trip
		// args => 执行参数 假如用户执行 `^command arg1 arg2 arg3 ...` 那么 args 就会是 ['^command', 'arg1', 'arg2', 'arg3', '...']
		// payload => 执行此命令时 bot收到的原始信息
	}
	initHooks(bot) {
		// 本函数用于注册hook，每次初始化命令的时候会自动调用
		// bot.regHook(command, mainFunction, level)
		// command => 指定bot收到服务器的哪个命令时执行hook 如 chat、warn
		// mainFunction => hook函数 也就是要执行的东西
		// level => 优先级 如果同一个command注册了多个hook 那么根据level进行升序排列 从小到大依次执行
		// mainFunction 传入 3 个参数：core bot payload
		// mainFunction 应该返回payload 可以修改payload
		// 如果返回了false 则停止执行后续的代码
	}
}

module.exports = Command
