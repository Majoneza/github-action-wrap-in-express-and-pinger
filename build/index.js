"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core = __importStar(require("@actions/core"));
var path_1 = require("path");
var fs_1 = require("fs");
var process_1 = require("process");
function getTemplate(pingerWebsite, port, pingerInterval, main_script_path) {
    return "const express = require('express');\nconst process = require('process');\nconst PORT = process.env.PORT || " + port + ";\nconst https = require('https');\nconst { Worker } = require('worker_threads');\n\nconst worker = new Worker('" + (main_script_path.startsWith('./') ? main_script_path : ('./' + main_script_path)) + "');\nworker.on('message', (m) => console.log('Worker message: ' + m));\nworker.on('error', (e) => console.log('Worker error: ' + e));\nworker.on('exit', (code) => {\n\tconsole.log('Worker exited with code: ' + code);\n});\n\nsetInterval(() => {\n\thttps.get('" + pingerWebsite + "', (res) => {\n\t\tres.on('data', (chunk) => {\n\t\t\ttry {\n\t\t\t\tconsole.log('WEBSITE RESPONSE: ' + chunk);\n\t\t\t}\n\t\t\tcatch(err) {\n\t\t\t\tconsole.error('Pinger http chunk crashed with ' + err.message);\n\t\t\t}\n\t\t});\n\t}).on('error', (err) => {\n\t\tconsole.error('Pinger http crashed with: ' + err.message);\n\t});\n}, " + pingerInterval + " * 1000);\n\nexpress()\n    .get('/', (req, res) => res.sendStatus(200))\n    .listen(PORT, () => console.log('Listening on ' + PORT));\n";
}
function getInputs() {
    var application_path = core.getInput('application-path', { required: true });
    var pingerWebsite = core.getInput('pinger-website', { required: true });
    try {
        var port = parseInt(core.getInput('default-port', { required: true }), 10);
        var pingerInterval = parseInt(core.getInput('pinger-interval', { required: true }), 10);
        return [application_path, pingerWebsite, port, pingerInterval];
    }
    catch (e) {
        throw new Error('Specified port is not a number');
    }
}
function checkRepository(application_path) {
    return __awaiter(this, void 0, void 0, function () {
        var dirs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs_1.promises.readdir((0, path_1.join)(process_1.env['GITHUB_WORKSPACE'], application_path))];
                case 1:
                    dirs = _a.sent();
                    if (dirs.findIndex(function (value) { return value === 'package.json'; }) === -1) {
                        throw new Error('Unable to find \"package.json\"');
                    }
                    if (dirs.findIndex(function (value) { return value === 'index.js'; }) !== -1) {
                        throw new Error('\"index.js\" not allowed in base directory');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function modifyPackageJSON(application_path) {
    return __awaiter(this, void 0, void 0, function () {
        var packagejson, _a, _b, main_script_path;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, fs_1.promises.readFile((0, path_1.join)(process_1.env['GITHUB_WORKSPACE'], application_path, 'package.json'), { encoding: 'utf-8', flag: 'r' })];
                case 1:
                    packagejson = _b.apply(_a, [_c.sent()]);
                    if (!('main' in packagejson && 'dependencies' in packagejson)) {
                        throw new Error('Missing attributes \"main\" and/or \"dependencies\" in package.json');
                    }
                    main_script_path = packagejson.main;
                    packagejson.main = './index.js';
                    if (!('express' in packagejson.dependencies)) {
                        packagejson.dependencies['express'] = '^4.15.2'; // Enable setting express version
                    }
                    return [4 /*yield*/, fs_1.promises.writeFile((0, path_1.join)(process_1.env['GITHUB_WORKSPACE'], application_path, 'package.json'), JSON.stringify(packagejson), { encoding: 'utf-8', flag: 'w' })];
                case 2:
                    _c.sent();
                    return [2 /*return*/, main_script_path];
            }
        });
    });
}
function writeApplication(application_path, template) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs_1.promises.writeFile((0, path_1.join)(process_1.env['GITHUB_WORKSPACE'], application_path, 'index.js'), template, { encoding: 'utf-8', flag: 'wx' })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, application_path, pingerWebsite, port, pingerInterval, main_script_path, template;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = getInputs(), application_path = _a[0], pingerWebsite = _a[1], port = _a[2], pingerInterval = _a[3];
                    return [4 /*yield*/, checkRepository(application_path)];
                case 1:
                    _b.sent(); // Can be removed
                    return [4 /*yield*/, modifyPackageJSON(application_path)];
                case 2:
                    main_script_path = _b.sent();
                    template = getTemplate(pingerWebsite, port, pingerInterval, main_script_path);
                    return [4 /*yield*/, writeApplication(application_path, template)];
                case 3:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (e) {
    core.setFailed('Action failed with error: ' + e.message);
});
