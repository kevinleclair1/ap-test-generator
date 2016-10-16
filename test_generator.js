#!/usr/bin/env node

var inquirer = require('inquirer')
var recursiveReadSync = require('recursive-readdir-sync')
var fsPath = require('fs-path')
var path = require('path')
var chalk = require('chalk')

var nameOfTest = [{
	type: "input",
	message: 'What would you like to name your test?',
	name: 'testName'
}]
var moduleName = [{
	type: 'input',
	message: 'Search for a module to test',
	name: 'moduleQuery'
}]

var cachedName

var template = (name, modulePath) => (

`var Component = require('${modulePath}');

describe('${name}', function () {
  //write your tests here
});`

)

//get name of test from user
inquirer.prompt(nameOfTest)
//get module name from the user that they want to test
.then(({testName}) => {

	cachedName = testName

	return inquirer.prompt(moduleName)
})
//go through file system and find files that match the string given
.then(({moduleQuery}) => {

	files = [...recursiveReadSync(`${process.cwd()}/js/app`), ...recursiveReadSync(`${process.cwd()}/jsx`)]
					.filter(file => file.toLowerCase().includes(moduleQuery.toLowerCase()))

	var nextQuestion = [{
		type: "list",
		name: 'moduleName',
		message: 'Choose a file from the search results',
		choices: files.map(file => file.replace(process.cwd(), ""))
	}]

	return inquirer.prompt(nextQuestion)
})
//let the user choose a module then create the test file
.then(({moduleName}) => {
	if (moduleName.includes('js/app/')){
		moduleName = moduleName.replace('js/app/', '')
	}

	var testPath = `${process.cwd()}/test/specs${moduleName.replace(moduleName.includes('.jsx') ? '.jsx' : '.js', '_test.js')}`
	var modPath = `${process.cwd()}/${moduleName}`

	fsPath.writeFileSync(testPath, template(cachedName, path.relative(testPath, modPath)))
	console.log(`\n${chalk.green(`File is created at`)}\n${chalk.cyan(testPath.replace(process.cwd(), ""))}`)
})