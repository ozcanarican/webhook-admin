import { app,shell } from "electron";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "original-fs";
import { WebhookMethod, WebhookType } from "../types/WebhookType";
import { SettingsType } from "../types/SettingsType";

const path = require('path');
export const mainFolder = path.join(app.getPath('appData'), "Webhooks-Data")
const configPath = path.join(mainFolder, "settings.json")

export const openConfig = () => {
    shell.openPath(mainFolder)
}

export const createDefaultSettings = () => {
    const defaultFile = require("./settings.json")
    if (!existsSync(mainFolder)) {
        mkdirSync(mainFolder)
    }
    writeFileSync(configPath, JSON.stringify(defaultFile))

}

export const getSettings = () => {
    if (!existsSync(configPath)) {
        createDefaultSettings()
    }
    let settings:SettingsType = JSON.parse(readFileSync(configPath, "utf-8"))
    return settings
}

export const saveSettings = (settings:SettingsType) => {
    if (!existsSync(configPath)) {
        createDefaultSettings()
    }
    writeFileSync(configPath,JSON.stringify(settings))
}

export const randomID = () => {
    let r = (Math.random() + 1).toString(36).substring(3);
    return r
}

export const createNewHook = (command:string, method:WebhookMethod, name:string, needPassword=false,password="",variables:string[]=[]) => {
    let hook:WebhookType = {command,id:randomID(),last:{},method,name,needPassword,password, variables}
    let settings = getSettings()
    settings.webhooks.push(hook)
    saveSettings(settings)
    console.log(`Created new hook ${hook.id}`)
}

export const saveHook = (hook:WebhookType) => {
    let settings = getSettings()
    settings.webhooks.push(hook)
    saveSettings(settings)
    console.log(`Created new hook ${hook.id}`)
}

export const updateHook = (hook:WebhookType) => {
    let settings = getSettings()
    let index = -1
    settings.webhooks.map((h,i)=>{
        if(h.id == hook.id) {
            index = i
        }
    })
    if(index > -1) {
        settings.webhooks[index] = hook
    }
    saveSettings(settings)
    console.log(`Updated the hook ${hook.id}`)
}

export const deleteHook = (id:String) => {
    let settings = getSettings()
    let deleted = settings.webhooks.filter((w)=>{
        if(w.id == id) return false 
        else return true})
    let ys = {...settings, webhooks: deleted}
    console.log(deleted)
    saveSettings(ys)
}

export const buildCommand = (hook:WebhookType, url:URL) => {
    let params = url.searchParams
    console.log(params)
    let cmd = hook.command
    hook.variables.map((v)=>{
        console.log(v,params.get(v))
        cmd = params.get(v) ? cmd.replace(`$${v}`,params.get(v)!) : cmd.replace(`$${v}`,"")
    })
    console.log("build command:",cmd)
    return cmd
}


export const buildCommandJSON = (hook:WebhookType, data:any) => {
    let cmd = hook.command
    hook.variables.map((v)=>{
        cmd = data[v] ? cmd.replace(`$${v}`,data[v]) : cmd.replace(`$${v}`,"")
    })
    console.log("build command:",cmd)
    return cmd
}


