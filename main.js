const t = Date.now();
const { insertHTML, simulateFullClick } = await import(`./utils.js?t=${t}`);
const { SetupWindow, WindDown, setChoice, getChoice, WindowOnInput, clickSelection, getMatchesSize } = await import(`./browse.js?t=${t}`);

async function getFile(file) {
    const url = chrome.runtime.getURL(file);
    const response = await fetch(url + "?t=" + String(new Date()));
    return await response.text();
}

async function KeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key == "f") {
        SetupWindow()
        e.preventDefault();
        e.stopPropagation();
    }
    
    let isFinding = (findWindow().style.display == "" || findWindow().style.display == "initial") && findWindow() == document.activeElement
    
    if (isFinding) {
        e.stopPropagation();
    }

    if (e.key == "Escape") {
        e.preventDefault();
        WindDown()
        return
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
    
        if (getChoice() < 0) {
            setChoice(getChoice() + getMatchesSize())
        }
    
        if (getChoice() >= getMatchesSize()) {
            setChoice(getChoice() - getMatchesSize())
        }
    
        if (getChoice() >= getMatchesSize()) {
            if (getMatchesSize() > 0) {
                setChoice(getMatchesSize() - 1)
            } else {
                setChoice(0)
            }
        }
    
        if (getChoice() < 0) {
            setChoice(0)
        }
    
        WindowOnInput(true)
    }
}

document.addEventListener("keydown", KeyDown, { capture: true })

function findWindow() {
    return document.getElementById("find-window")
}

insertHTML(await getFile("find.html"))

const blockCmdDigits = (e) => {
    if (!e.metaKey || e.ctrlKey || e.altKey) return
    if (!/^Digit[0-9]$/.test(e.code)) return

    e.stopImmediatePropagation()
}

window.addEventListener("keydown", blockCmdDigits, true)
window.addEventListener("keyup", blockCmdDigits, true)
window.addEventListener("keypress", blockCmdDigits, true)