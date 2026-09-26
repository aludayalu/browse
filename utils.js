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

 export function fuzzyMatch(text, pattern, maxDistance = 2) {
     const m = pattern.length;
     if (m === 0) return true;
     if (m > 30) return text.includes(pattern);

     const mask = {};
     for (let i = 0; i < m; i++) {
         const ch = pattern[i];
         mask[ch] = (mask[ch] | 0) | (1 << i);
     }

     const R = new Array(maxDistance + 1);
     for (let d = 0; d <= maxDistance; d++) R[d] = ~0;

     for (let i = 0; i < text.length; i++) {
         const cm = mask[text[i]] | 0;

         let prev = R[0];
         R[0] = (R[0] << 1) & cm;

         for (let d = 1; d <= maxDistance; d++) {
             const old = R[d];
             R[d] = ((R[d] << 1) & cm) | prev | (prev << 1) | 1;
             prev = old;
         }

         if (R[maxDistance] & (1 << (m - 1))) return true;
     }

     return false;
 }