export function insertHTML(html) {
    document.body.insertAdjacentHTML("afterend", html)
}

export function simulateFullClick(el, newTab = false) {
    if (newTab && el.tagName == "A") {
        chrome.runtime.sendMessage({type: "open-tab", url: el.href});
        return;
    }
    
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const opts = { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y };

    el.dispatchEvent(new PointerEvent("pointerdown", { ...opts, pointerId: 1, pointerType: "mouse", isPrimary: true }));
    el.dispatchEvent(new MouseEvent("mousedown", opts));
    el.dispatchEvent(new PointerEvent("pointerup", { ...opts, pointerId: 1, pointerType: "mouse", isPrimary: true }));
    el.dispatchEvent(new MouseEvent("mouseup", opts));
    el.click();
}

 export function fuzzyMatch(text, query) {   
     if (text.length == query.length && text.length == 0) {
         return false
     }

     if (text.length < query.length) {
         return false
     }

     let found_all = false

     let j = 0;

     for (let i = 0; i < text.length; i++) {
         if (query[j] == text[i]) {
             j += 1

             if (j == query.length) {
                 found_all = true
                 break
             }
         }
     }

     return found_all
 }