const t = Date.now();
const { insertHTML, simulateFullClick } = await import(`./utils.js?t=${t}`);

function findWindow() {
    return document.getElementById("find-window")
}

let lastElement = null
let choice = 0
export let search = ""

export function setChoice(newChoice) {
    choice = newChoice
}

export function getChoice() {
    return choice
}

export function clickSelection() {
    if (lastElement !== null) {
        simulateFullClick(lastElement)
    }
}

export function WindowOnInput() {
    if (search == "") {
        choice = 0
    }

    let target = selectElementByText(search);

    if (lastElement !== null) {
        lastElement.classList.remove("select-outline")
    }

    if (!target) {
        lastElement = null
        return
    }

    lastElement = target

    target.classList.add("select-outline")
}

export function SetupWindow() {
    findWindow().style.display = ""
    findWindow().focus();
    findWindow().oninput = (e) => {
        search = e.target.value
        WindowOnInput(e)
    }
    choice = 0
}

export function WindDown() {
    findWindow().style.display = "none"
    findWindow().value = ""

    if (lastElement !== null) {
        lastElement.classList.remove("select-outline")
        lastElement.focus();
    }

    choice = 0
}

let lastTaggedElement = null;

function cleanupPreviousTag() {
    if (lastTaggedElement) {
        lastTaggedElement.removeAttribute("tabindex");
        lastTaggedElement = null;
    }
}

function findFocusableAncestor(node) {
    const focusableSelector = "a[href], button, input, select, textarea, [tabindex]";
    let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (el && el !== document.body) {
        if (el.matches(focusableSelector)) return el;
        el = el.parentElement;
    }
    return null;
}

function isVisible(el) {
    return !!(el.offsetParent !== null || el.getClientRects().length);
}

function selectElementByText(search, preview) {
    cleanupPreviousTag();
    if (!search.trim()) return;

    const lowerSearch = search.toLowerCase();
    const matches = [];

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const parentTag = node.parentElement?.tagName;
            if (parentTag === "SCRIPT" || parentTag === "STYLE") return NodeFilter.FILTER_REJECT;
            if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;

            return node.nodeValue.toLowerCase().includes(lowerSearch)
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_SKIP;
        }
    });

    let match;

    while ((match = walker.nextNode())) {
        const candidate = match.parentElement;
        if (isVisible(candidate)) {
            matches.push(match);
        }
    }

    for (const element of document.querySelectorAll("[aria-label]")) {
        if (
            isVisible(element) &&
            element.getAttribute("aria-label").toLowerCase().includes(lowerSearch)
        ) {
            matches.push(element);
        }
    }

    if (!matches.length) return;

    choice = Math.min(choice, matches.length - 1);

    const selected = matches[choice];

    let target = selected.nodeType === Node.TEXT_NODE
        ? findFocusableAncestor(selected)
        : findFocusableAncestor(selected) || selected;

    if (!target) {
        target = selected.parentElement;
        target.setAttribute("tabindex", "-1");
        lastTaggedElement = target;
    }

    target.scrollIntoView({ behavior: "smooth", block: "center" });

    return target;
}