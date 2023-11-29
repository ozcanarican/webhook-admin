"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCommand = exports.deleteHook = exports.updateHook = exports.saveHook = exports.createNewHook = exports.randomID = exports.saveSettings = exports.getSettings = exports.createDefaultSettings = exports.mainFolder = void 0;
const electron_1 = require("electron");
const original_fs_1 = require("original-fs");
const path = require('path');
const configPath = path.join(electron_1.app.getPath('appData'), "Webhooks", "settings.json");
exports.mainFolder = path.join(electron_1.app.getPath('appData'), "Webhooks");
const createDefaultSettings = () => {
    const defaultFile = require("./settings.json");
    if (!(0, original_fs_1.existsSync)(exports.mainFolder)) {
        (0, original_fs_1.mkdirSync)(exports.mainFolder);
    }
    (0, original_fs_1.writeFileSync)(configPath, JSON.stringify(defaultFile));
};
exports.createDefaultSettings = createDefaultSettings;
const getSettings = () => {
    if (!(0, original_fs_1.existsSync)(configPath)) {
        (0, exports.createDefaultSettings)();
    }
    let settings = JSON.parse((0, original_fs_1.readFileSync)(configPath, "utf-8"));
    return settings;
};
exports.getSettings = getSettings;
const saveSettings = (settings) => {
    if (!(0, original_fs_1.existsSync)(configPath)) {
        (0, exports.createDefaultSettings)();
    }
    (0, original_fs_1.writeFileSync)(configPath, JSON.stringify(settings));
};
exports.saveSettings = saveSettings;
const randomID = () => {
    let r = (Math.random() + 1).toString(36).substring(3);
    return r;
};
exports.randomID = randomID;
const createNewHook = (command, method, name, needPassword = false, password = "", variables = []) => {
    let hook = { command, id: (0, exports.randomID)(), last: {}, method, name, needPassword, password, variables };
    let settings = (0, exports.getSettings)();
    settings.webhooks.push(hook);
    (0, exports.saveSettings)(settings);
    console.log(`Created new hook ${hook.id}`);
};
exports.createNewHook = createNewHook;
const saveHook = (hook) => {
    let settings = (0, exports.getSettings)();
    settings.webhooks.push(hook);
    (0, exports.saveSettings)(settings);
    console.log(`Created new hook ${hook.id}`);
};
exports.saveHook = saveHook;
const updateHook = (hook) => {
    let settings = (0, exports.getSettings)();
    let index = -1;
    settings.webhooks.map((h, i) => {
        if (h.id == hook.id) {
            index = i;
        }
    });
    if (index > -1) {
        settings.webhooks[index] = hook;
    }
    (0, exports.saveSettings)(settings);
    console.log(`Updated the hook ${hook.id}`);
};
exports.updateHook = updateHook;
const deleteHook = (id) => {
    let settings = (0, exports.getSettings)();
    let deleted = settings.webhooks.filter((w) => {
        if (w.id == id)
            return false;
        else
            return true;
    });
    let ys = Object.assign(Object.assign({}, settings), { webhooks: deleted });
    console.log(deleted);
    (0, exports.saveSettings)(ys);
};
exports.deleteHook = deleteHook;
const buildCommand = (hook, url) => {
    let params = url.searchParams;
    console.log(params);
    let cmd = hook.command;
    hook.variables.map((v) => {
        console.log(v, params.get(v));
        cmd = params.get(v) ? cmd.replace(`$${v}`, params.get(v)) : cmd.replace(`$${v}`, "");
    });
    console.log("build command:", cmd);
    return cmd;
};
exports.buildCommand = buildCommand;
