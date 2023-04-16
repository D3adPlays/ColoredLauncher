function reload() {
    window.location.reload();
}
function openDiscord(){
    //@ts-expect-error
    api.launchDiscord();
}

function closeButton() {
    //@ts-expect-error
    api.close();
}

function openSettings(){
    alert("Les parametres ne sont pas encore implémentés!");
}

if (localStorage.getItem("username") !== null && localStorage.getItem("username") !== undefined) {
    document.getElementById("usernameField")!.setAttribute("value", localStorage.getItem("username")!);
    //@ts-expect-error
    api.log("Username is already set, setting it to the field: " + localStorage.getItem("username")!);	
}

function playButton() {
    let username = (document.getElementById("usernameField") as HTMLInputElement).value;
    //@ts-expect-error
    api.log("Clicked with username: " + username);
    const usernameValidator = new RegExp("^[a-zA-Z0-9_]{3,16}$");
    if (!usernameValidator.test(username)) {
        //@ts-expect-error
        api.log("Username is not valid, toasting that fucker");
        Toastify({
            text: "Erreur: Veuillez entrer un pseudo valide!",
            duration: 3000,
            newWindow: true,
            gravity: "top",
            position: "right",
            offset: {
                x: 0,
                y: 120,
            },
            close: true,
            style: {
                background: "linear-gradient(90deg, rgba(144,12,12,1) 0%, rgba(253,29,29,1) 100%)",
            },
            stopOnFocus: true,
        }).showToast();
        return;
    }
    localStorage.setItem("username", username);
    //@ts-expect-error
    api.log("Username is valid calling login function");
    //@ts-expect-error
    api.launch(username);
}