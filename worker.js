chrome.runtime.onMessage.addListener(async (message) => {
    if (message.type === "open-tab") {
        chrome.tabs.create({ url: message.url });
    }
})

let lastActives = new Map()

chrome.commands.onCommand.addListener(async (chrome_command) => {
    let [command, direction] = chrome_command.split("_")

    let tabs = await chrome.tabs.query({ currentWindow: true })
    let [ activeTab ] = await chrome.tabs.query({ active: true, currentWindow: true })
    let tabIndex = tabs.findIndex((tab) => tab.id == activeTab.id)

    if (tabIndex == -1) return

    if (command == "move") {
        if (direction == "left") {
            if (tabIndex == 0) return

            await chrome.tabs.move(activeTab.id, {index: tabIndex - 1})
        }

        if (direction == "right") {
            if (tabIndex == tabs.length - 1) return

            await chrome.tabs.move(activeTab.id, {index: tabIndex + 1})
        }
    }

    if (chrome_command == "new_tab") {
        const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })

        if (!activeTab) {
            await chrome.tabs.create({})
            return
        }

        await chrome.tabs.create({ windowId: activeTab.windowId, index: activeTab.index + 1 })
    }

    if (chrome_command == "close_tab") {
        let focus_direction = 0

        if (tabIndex == 0) {
            focus_direction = 1

            if (tabIndex == tabs.length - 1) {
                focus_direction = -1
            }
        }

        if (focus_direction == 0) {
            await chrome.tabs.update(tabs[tabIndex - 1].id, { active: true })
        }

        if (focus_direction == 1) {
            await chrome.tabs.update(tabs[tabIndex + 1].id, { active: true })
        }

        await chrome.tabs.remove(activeTab.id)
    }

    if (chrome_command == "switch_tabs") {
        await CleanLastActiveTabs(activeTab.windowId)

        let activeTabs = lastActives.get(activeTab.windowId)
        let other_tab_id = activeTabs[activeTabs.length - 2]

        if (other_tab_id != -1 && tabs.findIndex(tab => tab.id == other_tab_id) != -1) {
            await chrome.tabs.update(other_tab_id, { active: true })
        }
    }

    if (chrome_command.startsWith("goto_tab_")) {
        if (!activeTab) return

        const n = Number(chrome_command.slice("goto_tab_".length))
        const tabs = await chrome.tabs.query({ windowId: activeTab.windowId })
        const target = n === 9 ? tabs[tabs.length - 1] : tabs.find((t) => t.index === n - 1)

        if (target) {
            await chrome.tabs.update(target.id, { active: true })
        }
    }
})

chrome.tabs.onActivated.addListener(async ({ tabId, windowId }) => {
    if (!lastActives.has(windowId)) {
        lastActives.set(windowId, [])
    }

    let ids = lastActives.get(windowId)

    ids.push(tabId)

    await CleanLastActiveTabs(windowId)
})

async function CleanLastActiveTabs(windowId) {
    if (!lastActives.has(windowId)) return

    let tabs = await chrome.tabs.query({ currentWindow: true })

    let newTabIDs = []

    let oldTabIDs = lastActives.get(windowId)

    oldTabIDs.forEach((x) => {
        if (tabs.findIndex((y) => y.id == x) == -1) {
            return
        }

        newTabIDs.push(x)
    })

    lastActives.set(windowId, newTabIDs.slice(-100))
}