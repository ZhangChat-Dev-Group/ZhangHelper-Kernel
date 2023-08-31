const colors = require('colors')
const moment = require('moment')
const fs = require('fs')
const path = require('path')

class Logger {
	constructor(dir) {
		this.dir = dir || path.resolve(__dirname, '..', 'logs')
	}
	save(text) {
		fs.appendFileSync(path.resolve(this.dir, moment().format('YYYY-MM-DD') + '.log'), text + '\n')
	}
	log(text) {
		console.log(text)
	}
	info(text) {
		const prefix = `[${moment().format('YYYY-MM-DD hh:mm:ss')}] [INFO] `
		const prefixColor = `[${moment().format('YYYY-MM-DD hh:mm:ss')}] [INFO] `.green
		this.log(prefixColor + text.split('\n').join('\n' + prefixColor))
		this.save(prefix + text.split('\n').join('\n' + prefix))
	}
	warn(text) {
		const prefix = `[${moment().format('YYYY-MM-DD hh:mm:ss')}] [WARN] `
		const prefixColor = `[${moment().format('YYYY-MM-DD hh:mm:ss')}] [WARN] `.yellow
		this.log(prefixColor + text.split('\n').join('\n' + prefixColor))
		this.save(prefix + text.split('\n').join('\n' + prefix))
	}
	error(text) {
		const prefix = `[${moment().format('YYYY-MM-DD hh:mm:ss')}] [ERROR] `
		const prefixColor = `[${moment().format('YYYY-MM-DD hh:mm:ss')}] [ERROR] `.red
		this.log(prefixColor + text.split('\n').join('\n' + prefixColor))
		this.save(prefix + text.split('\n').join('\n' + prefix))
	}
}

module.exports = Logger
