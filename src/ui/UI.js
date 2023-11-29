var DateTime = luxon.DateTime;
const getsettings = async () => {
  let settings = await window.api.send("get-settings")
  console.log("settings",settings)
  document.getElementById("active-hooks").innerHTML = settings.webhooks.length
  const last = "Never..."
  let lastDate
  settings.webhooks.map((hook)=>{
    if(!lastDate) {
      lastDate = hook.last.date ? hook.last.date : null
    } else {
      if(hook.last) {
        if(hook.last.date > lastDate) {
          lastDate = hook.last.date
        }
      }
    }
  })
  document.getElementById("server-url").innerHTML = `http://${settings.host}:${settings.servicePort}`
  console.log("last:",lastDate)
  if(lastDate) {
    console.log(DateTime.fromISO(lastDate).toFormat("hh:mm:ss dd.MM"))
    document.getElementById("last-execution").innerHTML = DateTime.fromISO(lastDate).toFormat("hh:mm:ss dd.MM")
  }
}

const getServerStatus = async () => {
  let status = await window.api.send("get-server-status")
  document.getElementById("server-status").innerHTML = status ? '<span class="bg-green padded">Running</span>' : '<span class="bg-red padded">Stopped</span>'
  if (status) {
    document.getElementById("start")?.classList.add("hidden")
    document.getElementById("stop")?.classList.remove("hidden")
  } else {
    document.getElementById("start")?.classList.remove("hidden")
    document.getElementById("stop")?.classList.add("hidden")
  }
}

const setServerStatus = async(status) => {
  document.getElementById("server-status").innerHTML = "..."
  await window.api.send("set-server-status",status)
  await getServerStatus()
}
getServerStatus()
getsettings()

document.getElementById("start")?.addEventListener("click",()=>{setServerStatus(true)})
document.getElementById("stop")?.addEventListener("click",()=>{setServerStatus(false)})
document.getElementById("hooks")?.addEventListener("click",()=>{window.api.send("hooks")})
document.getElementById("server-status")?.addEventListener("click",()=>{
  api.send("openconfig")
})
window.api.receive("update", () => {
  getsettings()
});