chrome.runtime.onMessage.addListener(async (message) => {
    if (message.type === "open-tab") {
        chrome.tabs.create({ url: message.url });
    }
})

let lastActive = new Map()

chrome.commands.onCommand.addListener(async (chrome_command) => {
    let [command, direction] = chrome_command.split("_")

    let tabs = await chrome.tabs.query({ currentWindow: true })
    let [ activeTab ] = await chrome.tabs.query({ active: true, currentWindow: true })
    let tabIndex = tabs.findIndex((tab) => tab.id == activeTab.id)

    if (tabIndex == -1) return

    if (command == "focus") {
        if (direction == "left") {
            if (tabIndex == 0) return

            await chrome.tabs.update(tabs[tabIndex - 1].id, { active: true })
        }

        if (direction == "right") {
            if (tabIndex == tabs.length - 1) return

            await chrome.tabs.update(tabs[tabIndex + 1].id, { active: true })
        }
    }

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
            await chrome.tabs.move(activeTab.id, {index: tabIndex - 1})
        }

        if (focus_direction == 1) {
            await chrome.tabs.move(activeTab.id, {index: tabIndex + 1})
        }

        await chrome.tabs.remove(activeTab.id)
    }
})