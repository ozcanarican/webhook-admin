import { buildCommand, buildCommandJSON, createNewHook, getSettings, updateHook } from "./utils/Util";
import * as http from "http"
import * as url from "url"
import * as fs from "fs"
import { execSync, exec } from "child_process"
import { WebhookMethod, WebhookType } from "./types/WebhookType";



export const runServer = (update: Function) => {
  let server: http.Server | null = null
  try {
    let settings = getSettings()
    const port = settings.servicePort;
    const hostname = settings.host;
    //createNewHook("ls",WebhookMethod.GET,"ls",false,"",[])
    server = http.createServer((req, res) => {
      let settings = getSettings()
      const { method, headers } = req
      let hooks: WebhookType[] = settings.webhooks
      res.setHeader('Content-Type', 'application/json')
      let found = false
      hooks.map((hook) => {
        if (req.url!.startsWith("/hook/" + hook.id)) {
          if (Object.values(WebhookMethod).includes(method as string)) {
            if (method != WebhookMethod[hook.method]) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: "INVALID_METHOD", description: `This webhook support ${WebhookMethod[hook.method]}` }))
              found = true
              return
            }

          } else {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "INVALID_METHOD", description: "Program doesnt support such method" }))
            found = true
            return
          }
          res.statusCode = 200;
          let params = url.parse(req.url!, true).query;
          let cmd = ""
          if (method == "GET") {
            cmd = buildCommand(hook, new URL(req.url!, `http://${req.headers.host}`))
            found = true
            runCommand(cmd, hook, res, req, update)
          } else {
            found = true
            var body = ''
            req.on('data', function (data) {
              body += data
            })
            req.on('end', function () {
              if (body.length > 0) {
                try {
                  let datas = JSON.parse(body)
                  cmd = buildCommandJSON(hook, datas)
                  runCommand(cmd, hook, res, req, update)
                } catch {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: "INVALID_DATA", description: "Program couldnt parse your json data" }))
                  found = true
                  return
                }
              } else {
                runCommand(hook.command, hook, res, req, update)
              }
            })
          }
        }
      })

      if (!found) {
        if (req.url!.includes("/hook")) {
          res.statusCode = 200;
          res.end(JSON.stringify({ output: "Hook has not found" }))
        } else {
          res.statusCode = 401;
          res.end(JSON.stringify({ output: "Welcome" }))
        }
      }


    });

    server.listen(port, hostname, () => {
      console.log(`Server is running at http://${hostname}:${port}/`);
    });
  } catch (e) {
    console.log(e);
  }
  return server
}

const runCommand = (cmd: string, hook: WebhookType, res: http.ServerResponse<http.IncomingMessage>, req: http.IncomingMessage, update:Function) => {
  let output = ""
  try {
    console.log("calistirilan:", cmd)
    hook.background && exec("start /min " + cmd)
    output = hook.background ? "Running in background" : execSync(cmd).toString()
    console.log(output)
    res.end(JSON.stringify({ name: hook.name, id: hook.id, command: hook.command, applied_command: cmd, variables: hook.variables, output }))
  } catch (e: any) {
    output = e.toString() as string
    res.end(JSON.stringify({ name: hook.name, id: hook.id, command: hook.command, applied_command: cmd, variables: hook.variables, error: true, error_msg: output }))
  }
  hook.last = {
    date: new Date(),
    ip: req.connection.remoteAddress as string,
    result: output
  }
  updateHook(hook)
  update()
}