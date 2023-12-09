var exec = require('child_process').exec;
var fs = require('fs');
var cuid = require('cuid');
var colors = require('colors');


exports.stats = false;

exports.compileJava = function (envData, code, fn) {
	//creating source file
	// var dirname = cuid.slug();
	var filename = envData.file;
	path = './temp/';



	fs.writeFile(path + filename + '.java', code, function (err) {
		if (err && exports.stats)
			console.log('ERROR: '.red + err);
		else {
			if (exports.stats)
				console.log('INFO: '.green + path + `/${filename}.java created`);

			if (envData.OS === "windows") {
				var command = "cd " + path + " & " + " javac " + filename + ".java";
			}
			else if (envData.OS === "linux") {
				var command = "cd " + path + " && " + " javac " + filename + ".java";
			}
			exec(command, function (error, stdout, stderr) {
				if (error) {
					if (exports.stats)
						console.log("INFO: ".green + path + "/Main.java contained an error while compiling");
					var out = { error: stderr };
					fn(out);
				}
				else {
					console.log("INFO: ".green + "compiled a java file");
					if (envData.OS === "windows") {
						var command = "cd " + path + " & java " + filename;
					}
					else if (envData.OS === "linux") {
						var command = "cd " + path + " && java " + filename;
					}
					exec(command, function (error, stdout, stderr) {
						if (error) {

							if (error.toString().indexOf('Error: stdout maxBuffer exceeded.') != -1) {
								var out = { error: 'Error: stdout maxBuffer exceeded. You might have initialized an infinite loop.' };
								fn(out);
							}
							else {
								if (exports.stats) {
									console.log('INFO: '.green + path + '/Main.java contained an error while executing');
								}
								var out = { error: stderr };
								fn(out);
							}
						}
						else {
							if (exports.stats) {
								console.log('INFO: '.green + path + '/Main.java successfully compiled and executed !');
							}
							var out = { output: stdout };
							fn(out);
						}
					});
				}
			});
		}
	});
}



exports.compileJavaWithInput = function (envData, code, input, fn) {
	//creating source file
	// var dirname = cuid.slug();
	var filename = envData.file;
	path = './temp/';



	fs.writeFile(path + filename + '.java', code, function (err) {
		if (err && exports.stats)
			console.log('ERROR: '.red + err);
		else {
			if (exports.stats)
				console.log('INFO: '.green + path + `/${filename}.java created`);
			fs.writeFile(path + "/input.txt", input, function (err) {
				if (err && exports.stats)
					console.log('ERROR: '.red + err);
				else {
					if (envData.OS === "windows") {
						var command = "cd " + path + " & " + " javac " + filename + ".java";
					}
					else if (envData.OS === "linux") {
						var command = "cd " + path + " && " + " javac " + filename + ".java";
					}
					exec(command, function (error, stdout, stderr) {
						if (error) {
							if (exports.stats)
								console.log("INFO: ".green + path + "/Main.java contained an error while compiling");
							var out = { error: stderr };
							fn(out);
						}
						else {
							console.log("INFO: ".green + "compiled a java file");
							if (envData.OS === "windows") {
								var command = "cd " + path + " & java " + filename + " < input.txt";
							}
							else if (envData.OS === "linux") {
								var command = "cd " + path + " && java " + filename + " < input.txt";
							}
							exec(command, function (error, stdout, stderr) {
								if (error) {

									if (exports.stats) {
										console.log('INFO: '.green + path + '/Main.java contained an error while executing');
									}
									if (error.toString().indexOf('Error: stdout maxBuffer exceeded.') != -1) {
										var out = { error: 'Error: stdout maxBuffer exceeded. You might have initialized an infinite loop.' };
										fn(out);
									}
									else {
										var out = { error: stderr };
										fn(out);
									}
								}
								else {
									if (exports.stats) {
										console.log('INFO: '.green + path + '/Main.java successfully compiled and executed !');
									}
									var out = { output: stdout };
									fn(out);
								}
							});
						}
					});
				}
			});
		}
	});
}