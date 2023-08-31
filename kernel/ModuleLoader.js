const fs = require("fs")
const path = require('path')

class ModuleLoader {
	constructor() {
		this.modules = {}
	}
	clearCache(dir) {
		Object.keys(require.cache).forEach((path) => {
			if (!path.startsWith(dir)) {
				return
			}
			delete require.cache[path]
		})
	}
	load(dir) {
		if (this.modules[dir]) {
			this.clearCache(dir)
		}
		this.modules[dir] = {}
		let err = []

		
		fs.readdirSync(dir).forEach((file) => {
			if (file.startsWith('.') || file.startsWith('_') || !file.endsWith('.js')) {
				return
			}
			try{
				this.modules[dir][file] = require(path.resolve(dir, file))
			} catch (e) {
				err.push(`Failed to load ${path.resolve(dir, file)}: ${e.message}`)
			}
		})

		return err.length === 0 ? null : err.join('\n')
	}
	get(dir) {
		return this.modules[dir] || null
	}
}

module.exports = ModuleLoader
