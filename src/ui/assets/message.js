window.api.receive("message",(msg)=>{
    let popup = document.body.appendChild(document.createElement("div"))
    popup.classList.add("popup")
    popup.textContent = msg
    setTimeout(() => {
        document.body.removeChild(popup)
    }, 5000);
})