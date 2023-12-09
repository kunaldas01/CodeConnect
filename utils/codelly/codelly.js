var exec = require('child_process').exec;
var fs = require('fs');
var cuid = require('cuid');
var cppModule = require('./cppModule.js');
var javaModule = require('./javaModule.js');
var pyModule = require('./pyModule.js');
var csModule = require('./csModule.js');
var vbModule = require('./vbModule.js');
var goModule = require('./goModule.js');
var swiftModule = require('./swiftModule.js');
var rustModule = require('./rustModule.js');
var phpModule = require('./phpModule.js');

exports.stats = false;

exports.init = function (option) {
	if (option) {
		if (option.stats === true) {
			console.log('Statistics for codelly is on'.green);
			exports.stats = true;
		}
	}
	fs.exists('./temp', function (exists) {
		if (!exists) {
			if (exports.stats) {
				console.log('INFO: '.cyan + 'temp directory created for storing temporary files.'.cyan)
			}
			fs.mkdirSync('./temp');
		}
	});
}

exports.compileCPP = function (envData, code, fn) {
	if (exports.stats)
		cppModule.stats = true;
	cppModule.compileCPP(envData, code, fn);
}

exports.compileCPPWithInput = function (envData, code, input, fn) {
	if (exports.stats)
		cppModule.stats = true;
	cppModule.compileCPPWithInput(envData, code, input, fn);
}


exports.compileJava = function (envData, code, fn) {
	if (exports.stats)
		javaModule.stats = true;
	javaModule.compileJava(envData, code, fn);
}

exports.compileJavaWithInput = function (envData, code, input, fn) {
	if (exports.stats)
		javaModule.stats = true;
	javaModule.compileJavaWithInput(envData, code, input, fn);
}

exports.compilePython = function (envData, code, fn) {
	if (exports.stats)
		pyModule.stats = true;
	pyModule.compilePython(envData, code, fn);
}

exports.compilePythonWithInput = function (envData, code, input, fn) {
	if (exports.stats)
		pyModule.stats = true;
	pyModule.compilePythonWithInput(envData, code, input, fn);

}

exports.compileCS = function (envData, code, fn) {
	if (exports.stats)
		csModule.stats = true;
	csModule.compileCS(envData, code, fn);
}

exports.compileCSWithInput = function (envData, code, input, fn) {
	if (exports.stats)
		csModule.stats = true;
	csModule.compileCSWithInput(envData, code, input, fn);
}

exports.compileVB = function (envData, code, fn) {
	if (exports.stats)
		vbModule.stats = true;
	vbModule.compileVB(envData, code, fn);
}

exports.compileVBWithInput = function (envData, code, input, fn) {
	if (exports.stats)
		vbModule.stats = true;
	vbModule.compileVBWithInput(envData, code, input, fn);
}

exports.compileGO = function (envData, code, fn) {
	if (exports.stats)
		goModule.stats = true;
	goModule.compileGO(envData, code, fn);
}

exports.compileGOWithInput = function (envData, code, input, fn) {
	if (exports.stats)
		goModule.stats = true;
	goModule.compileGOWithInput(envData, code, input, fn);
}

exports.compileSwift = function (envData, code, fn) {
	if (exports.stats)
		swiftModule.stats = true;
	swiftModule.compileSwift(envData, code, fn);
}

exports.compileSwiftWithInput = function (envData, code, input, fn) {
	if (exports.stats)
		swiftModule.stats = true;
	swiftModule.compileSwiftWithInput(envData, code, input, fn);
}

exports.compileRust = function (envData, code, fn) {
	if (exports.stats)
		rustModule.stats = true;
	rustModule.compileRust(envData, code, fn);
}

exports.compileRustWithInput = function (envData, code, input, fn) {
	if (exports.stats)
		rustModule.stats = true;
	rustModule.compileRustWithInput(envData, code, input, fn);
}

exports.compilePHP = function (envData, code, fn) {
	if (exports.stats)
		phpModule.stats = true;
	phpModule.compilePHP(envData, code, fn);
}

exports.compilePHPWithInput = function (envData, code, input, fn) {
	if (exports.stats)
		phpModule.stats = true;
	phpModule.compilePHPWithInput(envData, code, input, fn);
}

exports.flushSync = function () {
	path = '	./temp/';
	fs.readdir(path, function (err, files) {
		if (!err) {
			for (var i = 0; i < files.length; i++) {

				fs.unlinkSync(path + files[i]);

			}
		}
	});
}

exports.flush = function (fn) {
	path = './temp/';
	fs.readdir(path, function (err, files) {
		if (!err) {
			for (var i = 0; i < files.length; i++) {

				fs.rm(path + files[i], { recursive: true }, (err) => {
					if (err) {
						throw err;
					}
				});

			}
		}
	});
	fn();
}

exports.fullStat = function (fn) {
	var uptime = process.uptime();


	var cppCount = 0;
	var javaCount = 0;
	var pyCount = 0;
	var rustCount = 0;
	var phpCount = 0;
	var swiftCount = 0;
	var goCount = 0;
	var cCount = 0;
	var csCount = 0;
	var total = 0;

	var files = fs.readdirSync('temp');
	for (var file in files) {
		var stat = fs.statSync('temp/' + files[file]);
		if (stat.isFile()) {
			if (files[file].indexOf('.cpp') !== -1) {
				cppCount++;
			}
			if (files[file].indexOf('.py') !== -1) {
				pyCount++;
			}
			if (files[file].indexOf('.rc') !== -1) {
				rustCount++;
			}
			if (files[file].indexOf('.php') !== -1) {
				phpCount++;
			}
			if (files[file].indexOf('.swift') !== -1) {
				swiftCount++;
			}
			if (files[file].indexOf('.go') !== -1) {
				goCount++;
			}
			if (files[file].indexOf('.c') !== -1) {
				cCount++;
			}
			if (files[file].indexOf('.cs') !== -1) {
				csCount++;
			}
		}
		else {
			javaCount++;
		}
	}

	var jsonData = {
		serverUptime: uptime,
		fileDetails: {
			cpp: cppCount,
			java: javaCount,
			python: pyCount,
			cs: csCount,
			c: cCount,
			go: goCount,
			swift: swiftCount,
			php: phpCount,
			rust: rustCount
		}
	}
	if (exports.stats) {

		var str = "Server Statistics".yellow + "\n"
			+ "Server Uptime : " + uptime + "\n"
			+ "Files on storage :" + "\n"
			+ "CPP files : " + cppCount + "\n"
			+ "Java files : " + javaCount + "\n"
			+ "C files : " + cCount + "\n"
			+ "C# files : " + csCount + "\n"
			+ "Swift files : " + swiftCount + "\n"
			+ "Rust files : " + rustCount + "\n"
			+ "GO files : " + goCount + "\n"
			+ "PHP files : " + phpCount + "\n"
			+ "Python files : " + pyCount;
		console.log(str);
	}
	fn(jsonData);

}
