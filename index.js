class PdfHistory {
    constructor() {
        this.locations = [];
        this.current_idx = -1;
    }

    add(pre, post) {
        if (this.locations.length == 0) {
            this.locations = [pre, post];
            this.current_idx = 1;
            return;
        }
        this.locations[this.current_idx] = pre;
        if (this.locations.length === ++this.current_idx) { // there are no forwards
            this.locations.push(post);
        } else {
            this.locations[this.current_idx] = post;
            this.locations.splice(this.current_idx + 1)
        }
    }

    back() {
        console.log("Back");
        if (this.canGoBack()) this.locations[--this.current_idx].scrollIntoView();
        console.log(this.locations, this.current_idx);
    }

    forward() {
        console.log("Forward", this.locations);
        if (this.canGoForward()) this.locations[++this.current_idx].scrollIntoView();
        console.log(this.locations, this.current_idx);
    }

    canGoBack() {
        return this.current_idx > 0;
    }

    canGoForward() {
        return this.current_idx < this.locations.length - 1;
    }
}

class pdfLocation {
    constructor(pageNumber, left, top) {
        this.page = pageNumber;
        this.left = left;
        this.top = top;
    }

    scrollIntoView() {
        console.log("scrollIntoView");
        top?.window.lsPdfViewer.scrollPageIntoView({
            pageNumber: this.page,
            destArray: [null, { name: "XYZ" },
                this.left, this.top]
        });
        console.log("scrolledIntoView");
    }
}

function waitForElement(selector) {
    return new Promise(resolve => {
        if (top?.document.querySelector(selector)) {
            return resolve(top?.document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (top?.document.querySelector(selector)) {
                resolve(top?.document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(top?.document.querySelector("div#app-single-container"), {
            childList: true,
            subtree: true
        });
    });
}

function initialize(ele) {
    let pdfHistory = new PdfHistory();

    function callback(e) {
        isDebug && console.log({ top });
        const ele = e.srcElement;
        if (ele.tagName !== 'A' || ele.className !== "internalLink")
            return;
        const viewer = top?.lsPdfViewer;
        console.log(viewer.scroll);

        /* An example of viewer._location
        {
            "pageNumber": 235,
            "scale": "auto",
            "top": 784,
            "left": 0,
            "rotation": 0,
            "pdfOpenParams": "#page=235&zoom=auto,0,784"
        } */
        const pre = new pdfLocation(viewer._location.pageNumber, viewer._location.left, viewer._location.top);
        setTimeout(() => {
            console.log(viewer.scroll)
            const post = new pdfLocation(viewer._location.pageNumber, viewer._location.left, viewer._location.top);
            pdfHistory.add(pre, post);
        }, 100);
        console.log({ pdfHistory });
    }

    setTimeout(() => {
        const toolbar = top?.document.querySelector(".extensions__pdf-toolbar > div > div.buttons");
        let bck_btn = top?.document.createElement("a");
        bck_btn.innerHTML = left_arr;
        let fwd_btn = top?.document.createElement("a");
        fwd_btn.innerHTML = right_arr;
        bck_btn.onclick = pdfHistory.back.bind(pdfHistory); // fix `this` issue
        fwd_btn.onclick = pdfHistory.forward.bind(pdfHistory);
        fwd_btn.style.margin = "auto"; // center the svg vertically
        bck_btn.style.margin = "auto";
        bck_btn.style.marginLeft = "4px";
        fwd_btn.style.padding = "4px";
        bck_btn.style.padding = "4px";
        toolbar.insertBefore(fwd_btn, toolbar.children[0]);
        toolbar.insertBefore(bck_btn, toolbar.children[0]);
        top?.document.addEventListener('click', callback, false);
        toolbar.lastElementChild?.addEventListener('click', () => {
            pdfHistory = null;
            top?.document.removeEventListener('click', callback);
        });
    }, 1500);
}

async function main() {
    while (true) {
        if (top?.document.querySelector("div.extensions__pdf-viewer") == null) {
            const ele = await waitForElement("div.extensions__pdf-viewer");
            initialize(ele);
        }
        await new Promise(r => setTimeout(r, 800));
    }
}

const left_arr = `
<svg stroke="currentColor" fill="none" width="16" class="icon" stroke-width="2" stroke-linejoin="round" viewBox="0 0 24 24" stroke-linecap="round" height="16">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <line y1="12" x1="5" y2="12" x2="19"></line>
    <line y1="16" x1="9" y2="12" x2="5"></line>
    <line y1="8" x1="9" y2="12" x2="5"></line>
    </svg>`;

const right_arr = `
    <svg stroke="currentColor" fill="none" width="16" class="icon" stroke-width="2" stroke-linejoin="round" viewBox="0 0 24 24" stroke-linecap="round" height="16">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <line y1="12" x1="5"  y2="12"  x2="19"></line>
    <line y1="16" x1="15" y2="12" x2="19"></line>
    <line y1="8"  x1="15" y2="12" x2="19"></line>
    </svg>`;

const isDebug = true;

logseq.ready(() => {
    isDebug && logseq.App.showMsg("❤️ logseq-pdf-nav has bean loaded!");
    main();
}).catch(console.error);
