chrome.runtime.onMessage.addListener(async (message) => {
    if (message.type === "open-tab") {
        chrome.tabs.create({ url: message.url });
    }
})

chrome.commands.onCommand.addListener(async (command) => {
    [command, direction] = command.split(".")

    let tabs = await chrome.tabs.query({ active: true, currentWindow: true })
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
});