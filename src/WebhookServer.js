"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.runServer = void 0;
const Util_1 = require("./utils/Util");
const http = __importStar(require("http"));
const url = __importStar(require("url"));
const child_process_1 = require("child_process");
const runServer = (update) => {
    let server = null;
    try {
        let settings = (0, Util_1.getSettings)();
        const port = settings.servicePort;
        const hostname = settings.host;
        server = http.createServer((req, res) => {
            let settings = (0, Util_1.getSettings)();
            const { method, headers } = req;
            let hooks = settings.webhooks;
            res.setHeader('Content-Type', 'application/json');
            let found = false;
            hooks.map((hook) => {
                if (req.url.startsWith("/hook/" + hook.id)) {
                    res.statusCode = 200;
                    let params = url.parse(req.url, true).query;
                    let cmd = "";
                    if (method == "GET") {
                        cmd = (0, Util_1.buildCommand)(hook, new URL(req.url, `http://${req.headers.host}`));
                    }
                    let output = "";
                    try {
                        output = (0, child_process_1.execSync)(cmd).toString();
                        console.log(output);
                        res.end(JSON.stringify({ name: hook.name, id: hook.id, command: hook.command, applied_command: cmd, variables: hook.variables, output }));
                    }
                    catch (e) {
                        output = e.toString();
                        res.end(JSON.stringify({ name: hook.name, id: hook.id, command: hook.command, applied_command: cmd, variables: hook.variables, error: true, error_msg: output }));
                    }
                    hook.last = {
                        date: new Date(),
                        ip: req.connection.remoteAddress,
                        result: output
                    };
                    (0, Util_1.updateHook)(hook);
                    update();
                    found = true;
                }
            });
            if (!found) {
                if (req.url.includes("/hook")) {
                    res.statusCode = 200;
                    res.end(JSON.stringify({ output: "Hook has not found" }));
                }
                else {
                    res.statusCode = 401;
                    res.end(JSON.stringify({ output: "Welcome" }));
                }
            }
        });
        server.listen(port, hostname, () => {
            console.log(`Server is running at http://${hostname}:${port}/`);
        });
    }
    catch (e) {
        console.log(e);
    }
    return server;
};
exports.runServer = runServer;
