
let type = 0
let oldhook
var DateTime = luxon.DateTime;

const getsettings = async () => {
    if (!document.getElementById("hooks")) return
    document.getElementById("hooks").innerHTML = ""
    let settings = await window.api.send("get-settings")
    console.log(settings)
    settings.webhooks.map((hook) => {
        //copytext
        let link = `http://${settings.host}:${settings.servicePort}/hook/${hook.id}`
        let h = document.createElement("div")
        let container = document.createElement("div")
        container.classList.add("bordered")
        container.classList.add("hook")

        let header = document.createElement("div")
        header.classList.add("flex")
        header.classList.add("space-between")
        header.classList.add("pad-0")
        header.innerHTML = `
        <div class="name"><svg viewBox="0 0 1034 1034" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#ffffff" d="M482 226h-1l-10 2q-33 4 -64.5 18.5t-55.5 38.5q-41 37 -57 91q-9 30 -8 63t12 63q17 45 52 78l13 12l-83 135q-26 -1 -45 7q-30 13 -45 40q-7 15 -9 31t2 32q8 30 33 48q15 10 33 14.5t36 2t34.5 -12.5t27.5 -25q12 -17 14.5 -39t-5.5 -41q-1 -5 -7 -14l-3 -6l118 -192 q6 -9 8 -14l-10 -3q-9 -2 -13 -4q-23 -10 -41.5 -27.5t-28.5 -39.5q-17 -36 -9 -75q4 -23 17 -43t31 -34q37 -27 82 -27q27 -1 52.5 9.5t44.5 30.5q17 16 26.5 38.5t10.5 45.5q0 17 -6 42l70 19l8 1q14 -43 7 -86q-4 -33 -19.5 -63.5t-39.5 -53.5q-42 -42 -103 -56 q-6 -2 -18 -4l-14 -2h-37zM500 350q-17 0 -34 7t-30.5 20.5t-19.5 31.5q-8 20 -4 44q3 18 14 34t28 25q24 15 56 13q3 4 5 8l112 191q3 6 6 9q27 -26 58.5 -35.5t65 -3.5t58.5 26q32 25 43.5 61.5t0.5 73.5q-8 28 -28.5 50t-48.5 33q-31 13 -66.5 8.5t-63.5 -24.5 q-4 -3 -13 -10l-5 -6q-4 3 -11 10l-47 46q23 23 52 38.5t61 21.5l22 4h39l28 -5q64 -13 110 -60q22 -22 36.5 -50.5t19.5 -59.5q5 -36 -2 -71.5t-25 -64.5t-44 -51t-57 -35q-34 -14 -70.5 -16t-71.5 7l-17 5l-81 -137q13 -19 16 -37q5 -32 -13 -60q-16 -25 -44 -35 q-17 -6 -35 -6zM218 614q-58 13 -100 53q-47 44 -61 105l-4 24v37l2 11q2 13 4 20q7 31 24.5 59t42.5 49q50 41 115 49q38 4 76 -4.5t70 -28.5q53 -34 78 -91q7 -17 14 -45q6 -1 18 0l125 2q14 0 20 1q11 20 25 31t31.5 16t35.5 4q28 -3 50 -20q27 -21 32 -54 q2 -17 -1.5 -33t-13.5 -30q-16 -22 -41 -32q-17 -7 -35.5 -6.5t-35.5 7.5q-28 12 -43 37l-3 6q-14 0 -42 -1l-113 -1q-15 -1 -43 -1l-50 -1l3 17q8 43 -13 81q-14 27 -40 45t-57 22q-35 6 -70 -7.5t-57 -42.5q-28 -35 -27 -79q1 -37 23 -69q13 -19 32 -32t41 -19l9 -3z"></path> </g></svg> ${hook.name}</div>
        `
       


        container.appendChild(header)
        let linkbutton = container.appendChild(document.createElement("div"))
        linkbutton.classList.add("url")
        linkbutton.classList.add("pointer")
        linkbutton.classList.add("hover-red")
        linkbutton.classList.add("trans")
        linkbutton.textContent = `[${hook.method == 1 ? "POST" : "GET"}] ${link}`

        linkbutton.addEventListener("click", (e) => {
            api.send("copytext", link)
        })

        let cmd = container.appendChild(document.createElement("div"))
        cmd.classList.add("cmd")
        cmd.classList.add("pointer")
        cmd.classList.add("hover-moveleft")
        cmd.classList.add("trans")
        cmd.textContent = `${hook.command}`
        cmd.setAttribute("converted","off")

        cmd.addEventListener("click",()=>{
            if(cmd.getAttribute("converted") == "on") {
                cmd.textContent = `${hook.command}`
                cmd.setAttribute("converted","off")
            } else {
                api.send("go-update",hook.id)
            }
        })


        const last = header.appendChild(document.createElement("div"))
        last.classList.add("last")
        last.classList.add("pointer")
        last.classList.add("hover-red")
        last.innerHTML = `<div class="flex w-100 flex-end gap-03">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 17V12H15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#deddda" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
         ${hook.last?.date ? DateTime.fromISO(hook.last.date).toFormat("hh:mm:ss dd.MM") : "Never"}</div>`
        last.addEventListener("click",()=>{
            if(hook.last) {
                cmd.textContent = ""
                let info = cmd.appendChild(document.createElement("div"))
                info.innerHTML = `<p>IP:</p>${hook.last.ip}<p class="mt-1">Result:</p>${hook.last.result}`
                cmd.setAttribute("converted","on")

            } 
        })


        let buttons = document.createElement("div")
        buttons.classList.add("buttons")
        buttons.classList.add("mt-0")



        let del = document.createElement("button")
        del.classList.add("bg-red")
        del.innerHTML = "Delete"
        del.addEventListener("click", () => {
            window.api.send("delete-hook", hook.id)
        })
        buttons.appendChild(del)

        let edit = document.createElement("button")
        edit.innerHTML = "Edit"
        edit.classList.add("bg-yellow")
        buttons.appendChild(edit)



        container.appendChild(buttons)
        h.appendChild(container)
        document.getElementById("hooks").appendChild(h)


    })
}
getsettings()

document.getElementById("new-hook")?.addEventListener("click", () => {
    window.api.send("new-hook")
})
window.api.receive("update", () => {
    getsettings()
});



let passport = document.getElementById("password")
if (passport) {
    let isPassport = document.getElementById("needPassword")
    isPassport.addEventListener("change", () => {
        if (isPassport.checked) {
            passport.parentElement.parentElement.classList.remove("hidden")
        } else {
            passport.parentElement.parentElement.classList.add("hidden")
        }
    })
    document.getElementById("cancel-new")?.addEventListener("click", () => {
        window.api.send("back-to-hooks")
    })
    document.getElementById("new-hook-form").addEventListener("submit", async (e) => {
        e.preventDefault()
        const data = new FormData(e.target)
        let d = {}
        for (var [key, value] of data) {
            d[key] = value
        }
        e.target.classList.add("hidden")
        document.body.innerHTML += '<div class="centered"><img src="./assets/loading.gif" alt=""></div>'
        if(type == 0) {
            window.api.send("buildhook", d)
        } else {
            window.api.send("updatehook", {...oldhook,...d})
        }
    })
    window.api.receive("hook", (hook) => {
        oldhook = hook
        type = 1
        console.log("hook",hook)
        let {elements} = document.getElementById("new-hook-form")
        for (const [ key, value ] of Object.entries(hook) ) {
            const field = elements.namedItem(key)
            field && (
                field.value = key == "method" ? (value == "1" ? "POST": "GET") : value
            )
          }
    });
    
}