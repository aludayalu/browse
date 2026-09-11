const t = Date.now();
const { insertHTML, simulateFullClick } = await import(`./utils.js?t=${t}`);

function findWindow() {
    return document.getElementById("find-window")
}

function showOutline(target) {
    const outline = document.getElementById("find-outline");
    const rect = target.getBoundingClientRect();

    outline.style.left = `${rect.left - 3}px`;
    outline.style.top = `${rect.top - 3}px`;
    outline.style.width = `${rect.width + 6}px`;
    outline.style.height = `${rect.height + 6}px`;
    outline.style.display = "";
}

function removeOutline() {
    document.getElementById("find-outline").style.display = "none";
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

export function clickSelection(newTab = false) {
    if (lastElement !== null) {
        simulateFullClick(lastElement, newTab)
    }
}

export function WindowOnInput() {
    if (search == "") {
        choice = 0
    }

    let target = selectElementByText(search);

    removeOutline()

    if (!target) {
        lastElement = null
        return
    }

    lastElement = target

    showOutline(target)
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

    removeOutline()

    if (lastElement !== null) {
        lastElement.focus();
    }

    choice = 0
    lastElement = null
}

function findFocusableAncestor(node) {
    const focusableSelector = "a[href], button, input, select, textarea";
    let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;

    while (el && el !== document.body) {
        if (el.matches(focusableSelector)) return el;
        el = el.parentElement;
    }

    return null;
}

function isVisible(el) {
    if (!el) return false;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    return true;
}

function selectElementByText(search, preview) {
    if (!search.trim()) return;

    const lowerSearch = search.toLowerCase();
    const matches = [];
    const seen = new Set();

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const parentTag = node.parentElement?.tagName;
            if (parentTag === "SCRIPT" || parentTag === "STYLE") return NodeFilter.FILTER_REJECT;
            if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;

            return node.nodeValue.toLowerCase().includes(lowerSearch) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
    });

    let match;

    while ((match = walker.nextNode())) {
        const candidate = match.parentElement;
        if (!isVisible(candidate)) continue;

        const target = findFocusableAncestor(match) || candidate;

        if (!seen.has(target)) {
            seen.add(target);
            matches.push(target);
        }
    }

    for (const element of document.querySelectorAll("[aria-label]")) {
        const ariaLabel = element.getAttribute("aria-label");

        if (!ariaLabel) continue;
        if (!isVisible(element)) continue;
        if (!ariaLabel.toLowerCase().includes(lowerSearch)) continue;

        const target = findFocusableAncestor(element) || element;

        if (!seen.has(target)) {
            seen.add(target);
            matches.push(target);
        }
    }

    if (!matches.length) return;

    choice = Math.min(choice, matches.length - 1);

    const target = matches[choice];

    target.scrollIntoView({ behavior: "smooth", block: "center" });

    return target;
}

window.addEventListener("scroll", () => {
    if (lastElement !== null) {
        showOutline(lastElement)
    }
}, true)