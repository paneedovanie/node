const
	fs = require('fs'),
	requireContext = require('node-require-context')

module.exports.getAllFiles = (dir = '/', ext = null) => {
	let files = []
	fs.readdirSync(dir).forEach(function (file) {
		const fileExt = new RegExp(ext, "g")
		if (file.match(fileExt) === null) return
		files.push(file)
	});
	return files
}

module.exports.upload = async (dir, name, buffer) => {
	ensureDirectoryExistence(dir)
	return await fs.writeFile(dir + name, buffer, "buffer", function (err) {
		if (err) console.log(err)
		return name
	})
}

async function ensureDirectoryExistence(filePath) {
	const dirs = filePath.split('/').filter(e => e != '')
	let currentDir = ''
	dirs.forEach(dir => {
		currentDir += dir
		if (!fs.existsSync(currentDir)) {
			fs.mkdirSync(currentDir)
		}
		currentDir += '/'
	})
}

module.exports.streamToBuffer = async function (stream) {
	return new Promise((resolve, reject) => {
		const data = [];

		stream.on('data', (chunk) => {
			data.push(chunk);
		});

		stream.on('end', () => {
			resolve(Buffer.concat(data))
		})

		stream.on('error', (err) => {
			reject(err)
		})

	})
}

module.exports.fileToStream = async function (file) {
	return fs.createReadStream(file.path)
}

module.exports.requireContext = (dir = '/', regex = []) => {
	let files = requireContext(dir, true, regex[0])
	if (files.keys().length === 0)
		files = requireContext(dir, true, regex[1])
	return files
}