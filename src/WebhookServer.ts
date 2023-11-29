import { buildCommand, createNewHook, getSettings, updateHook } from "./utils/Util";
import * as http from "http"
import * as url from "url"
import * as fs from "fs"
import { execSync } from "child_process"
import { WebhookMethod, WebhookType } from "./types/WebhookType";



export const runServer = (update:Function) => {
  let server:http.Server | null = null
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
          
          res.statusCode = 200;
          let params = url.parse(req.url!, true).query;
          let cmd = ""
          if(method == "GET") {
              cmd = buildCommand(hook,new URL(req.url!, `http://${req.headers.host}`))
          }
          let output = ""
          try {
            output = execSync(cmd).toString()
            console.log(output)
            res.end(JSON.stringify({ name: hook.name, id: hook.id, command: hook.command, applied_command: cmd, variables:hook.variables, output }))
          } catch(e:any) {
            output = e.toString() as string
            res.end(JSON.stringify({ name: hook.name, id: hook.id, command: hook.command, applied_command: cmd, variables:hook.variables, error:true, error_msg: output }))
          }
          hook.last = {
            date: new Date(),
            ip:req.connection.remoteAddress as string,
            result:output
          }
          updateHook(hook)
          update()
          found = true
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