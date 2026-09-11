const t = Date.now();
const { insertHTML, simulateFullClick } = await import(`./utils.js?t=${t}`);
const { SetupWindow, WindDown, setChoice, getChoice, WindowOnInput, clickSelection } = await import(`./browse.js?t=${t}`);

console.log("[main.js] executing");

async function getFile(file) {
    const url = chrome.runtime.getURL(file);
    const response = await fetch(url + "?t=" + String(new Date()));
    return await response.text();
}

document.addEventListener("keydown", async (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key == "f") {
        SetupWindow()
        e.preventDefault();
    }

    let isFinding = (findWindow().style.display == "" || findWindow().style.display == "initial") && findWindow() == document.activeElement

    if (e.key == "Escape") {
        WindDown()
    }

    if (e.key == "Enter" && isFinding) {
        e.preventDefault();
        clickSelection(e.shiftKey || e.ctrlKey || e.metaKey);
        WindDown();
    }

    if (e.key == "Tab" && isFinding) {
        e.preventDefault();

        if (e.shiftKey) {
            setChoice(getChoice() - 1)
        } else {
            setChoice(getChoice() + 1)
        }

        if (getChoice() <= 0) {
            setChoice(0)
        }

        WindowOnInput()        
    }
})

function findWindow() {
    return document.getElementById("find-window")
}

insertHTML(await getFile("find.html"))