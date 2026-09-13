const t = Date.now();
const { insertHTML, simulateFullClick } = await import(`./utils.js?t=${t}`);

function findWindow() {
    return document.getElementById("find-window")
}

function findOutline() {
    return document.getElementById("find-outline")
}

let matches = new Set();

export function getMatchesSize() {
    return matches.size
}

let positionCheckerAnimFrameID = null;

function showOutline(target) {
    const outline = findOutline();
    
    if (positionCheckerAnimFrameID) {
        cancelAnimationFrame(positionCheckerAnimFrameID)
        positionCheckerAnimFrameID = null;
    }

    let last_rect = {};

    const updatePositionFrameLoop = () => {
        if (!document.body.contains(target)) {
            removeOutline();
            WindowOnInput();
            return;
        }

        const rect = target.getBoundingClientRect();

        if (rect.top == last_rect.top && rect.height == last_rect.height && rect.width == last_rect.width && rect.left == last_rect.left) {
            positionCheckerAnimFrameID = requestAnimationFrame(updatePositionFrameLoop)
            return;
        }

        last_rect = rect;
        
        if (rect.width === 0 && rect.height === 0) {
            removeOutline();
            WindowOnInput();
            return;
        }

        outline.style.left = `${rect.left - 3}px`;
        outline.style.top = `${rect.top - 3}px`;
        outline.style.width = `${rect.width + 6}px`;
        outline.style.height = `${rect.height + 6}px`;
        outline.style.display = "";

        positionCheckerAnimFrameID = requestAnimationFrame(updatePositionFrameLoop)
    };

    updatePositionFrameLoop();
}

function removeOutline() {
    findOutline().style.display = "none";
    
    if (positionCheckerAnimFrameID) {
        cancelAnimationFrame(positionCheckerAnimFrameID)
        positionCheckerAnimFrameID = null
    }
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

let last_search = ""

export function WindowOnInput(userChangedChoice = false) {    
    if (search == "") {
        choice = 0
    }

    let target = selectElementByText(search, search == last_search && userChangedChoice);

    last_search = search

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
        choice = 0
        WindowOnInput(e)
    }

    last_search = ""
    
    choice = 0
}

export function WindDown() {
    findWindow().style.display = "none"
    findWindow().value = ""

    last_search = ""

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

function selectElementByText(search, recalculateChoice) {
    if (!search.trim()) return;

    const lowerSearch = search.toLowerCase();
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
        }
    }

    for (const element of document.querySelectorAll("[aria-label]")) {
        const ariaLabel = element.getAttribute("aria-label");

        if (!ariaLabel || !ariaLabel.toLowerCase().includes(lowerSearch)) continue;
        if (!isVisible(element)) continue;

        const target = findFocusableAncestor(element) || element;

        if (!seen.has(target)) {
            seen.add(target);
        }
    }

    if (!seen.size) return;

    let seen_array = Array.from(seen);

    if (recalculateChoice && seen.has(lastElement)) {
        choice = seen_array.indexOf(lastElement)
    }

    choice = Math.min(choice, seen.size - 1);

    const target = seen_array[choice];

    matches = seen;

    target.scrollIntoView({ behavior: "smooth", block: "center" });

    return target;
}

window.addEventListener("scroll", () => {
    if (lastElement) {
        WindowOnInput();
    }
})