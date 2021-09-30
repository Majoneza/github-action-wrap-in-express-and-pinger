import * as core from '@actions/core';
import {join} from 'path';
import {promises} from 'fs';
import {env} from 'process';

function getTemplate(pingerWebsite: string, port: number, pingerInterval: number, main_script_path: string): string {
    return `const express = require('express');
const process = require('process');
const PORT = process.env.PORT || ${port};
const { Worker } = require('worker_threads');

const worker = new Worker('${main_script_path.startsWith('./') ? main_script_path : ('./' + main_script_path)}');
worker.on('message', (m) => console.log('Worker message: ' + m));
worker.on('error', (e) => console.log('Worker error: ' + e));
worker.on('exit', (code) => {
	console.log('Worker exited with code: ' + code);
});

const worker = new Worker(new URL(\`data:text/javascript,
const { parentPort } = require('worker_threads')
const https = require('https')

setInterval(() => {
	https.get('${pingerWebsite}', (res) => {
		res.on('data', (chunk) => {
			try {
				parentPort.postMessage('WEBSITE RESPONSE: ' + chunk);
			}
			catch(err) {
				parentPort.postMessage('Pinger http chunk crashed with ' + err.message);
			}
		});
	}).on('error', (err) => {
		parentPort.postMessage('Pinger http crashed with: ' + err.message);
	});
}, ${pingerInterval} * 1000);
\`));
worker.on('message', (m) => console.log('Worker message: ' + m));
worker.on('error', (e) => console.log('Worker error: ' + e));
worker.on('exit', (code) => {
	console.log('Worker exited with code: ' + code);
});

express()
    .get('/', (req, res) => res.sendStatus(200))
    .listen(PORT, () => console.log('Listening on ' + PORT));
`;
}

function getInputs(): [application_path: string, pingerWebsite: string, port: number, pingerInterval: number] {
    const application_path = core.getInput('application-path', {required: true});
    const pingerWebsite = core.getInput('pinger-website', {required: true});
    try {
        const port = parseInt(core.getInput('default-port', {required: true}), 10);
        const pingerInterval = parseInt(core.getInput('pinger-interval', {required: true}), 10);
        return [application_path, pingerWebsite, port, pingerInterval];
    }
    catch (e) {
        throw new Error('Specified port is not a number');
    }
}

async function checkRepository(application_path: string): Promise<void> {
    const dirs = await promises.readdir(join(env['GITHUB_WORKSPACE']!, application_path));
    if (dirs.findIndex(value => value === 'package.json') === -1) {
        throw new Error('Unable to find \"package.json\"');
    }
    if (dirs.findIndex(value => value === 'index.js') !== -1) {
        throw new Error('\"index.js\" not allowed in base directory');
    }
}

async function modifyPackageJSON(application_path: string): Promise<string> {
    const packagejson = JSON.parse(await promises.readFile(join(env['GITHUB_WORKSPACE']!, application_path, 'package.json'), {encoding: 'utf-8', flag: 'r'}));
    if (!('main' in packagejson && 'dependencies' in packagejson)) {
        throw new Error('Missing attributes \"main\" and/or \"dependencies\" in package.json');
    }
    const main_script_path = packagejson.main;
    packagejson.main = './index.js';
    if (!('express' in packagejson.dependencies)) {
        packagejson.dependencies['express'] = '^4.15.2'; // Enable setting express version
    }
    await promises.writeFile(join(env['GITHUB_WORKSPACE']!, application_path, 'package.json'), JSON.stringify(packagejson), {encoding: 'utf-8', flag: 'w'});
    return main_script_path;
}

async function writeApplication(application_path: string, template: string): Promise<void> {
    await promises.writeFile(join(env['GITHUB_WORKSPACE']!, application_path, 'index.js'), template, {encoding: 'utf-8', flag: 'wx'});
}

async function main(): Promise<void> {
    const [application_path, pingerWebsite, port, pingerInterval] = getInputs();
    await checkRepository(application_path); // Can be removed
    const main_script_path = await modifyPackageJSON(application_path);
    const template = getTemplate(pingerWebsite, port, pingerInterval, main_script_path);
    await writeApplication(application_path, template);
}


main().catch((e) => {
    core.setFailed('Action failed with error: ' + e.message);
});
