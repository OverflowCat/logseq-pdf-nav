class PdfHistory {
    constructor() {
        this.locations = [];
        this.current_idx = -1;
    }

    add(pre, post) {
        if (this.locations === []) {
            this.locations = [pre, post];
            this.current_idx = 1;
        } else {
            this.locations[this.current_idx] = pre;
            if (this.locations.length === ++this.current_idx) { // there are no forwards
                this.locations.push(post);
            } else {
                this.locations[this.current_idx] = post;
                this.locations.splice(this.current_idx + 1)
            }
        }
    }

    back() {
        console.log("Back");
        if (this.canGoBack) this.locations[--this.current_idx].scrollIntoView();
        console.log(this.locations, this.current_idx);
    }

    forward() {
        console.log("Forward", this.locations);
        if (this.canGoForward) this.locations[++this.current_idx].scrollIntoView();
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
        window.lsPdfViewer.scrollPageIntoView({
            pageNumber: this.page,
            destArray: [null, { name: "XYZ" },
                this.left, this.top]
        });
        console.log("scrolledIntoView");
    }
}

let pdfHistory = new PdfHistory();

function callback(e) {
    const ele = (window.e || e)?.srcElement;
    if (ele.tagName !== 'A' || ele.className !== "internalLink")
        return;
    console.log(window.lsPdfViewer.scroll);

    /* An example of viewer._location
    {
        "pageNumber": 235,
        "scale": "auto",
        "top": 784,
        "left": 0,
        "rotation": 0,
        "pdfOpenParams": "#page=235&zoom=auto,0,784"
    } */
    const { pageNumber, left, top } = window.lsPdfViewer._location;
    const pre = new pdfLocation(pageNumber, left, top);
    setTimeout(() => {
        console.log(window.lsPdfViewer.scroll)
        const { pageNumber, left, top } = window.lsPdfViewer._location;
        const post = new pdfLocation(pageNumber, left, top);
        pdfHistory.add(pre, post);
    }, 100);
    console.log({ pdfHistory });
}

document.addEventListener('click', callback, false);

document.addEventListener('keypress', shortcut);

function shortcut(event) {
    if (event.altKey) {
        console.log(event.key);
        switch (event.key) {
            case "z":
                back();
                event.preventDefault();
                break;
            case "q":
                forward(); event.preventDefault();
                break;
        }
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

const toolbar = document.querySelector(".extensions__pdf-toolbar > div > div.buttons");
let bck_btn = document.createElement("a");
bck_btn.innerHTML = left_arr;
let fwd_btn = document.createElement("a");
fwd_btn.innerHTML = right_arr;
bck_btn.onclick = pdfHistory.back.bind(pdfHistory); // fix `this` issue
fwd_btn.onclick = pdfHistory.forward.bind(pdfHistory);
toolbar.insertBefore(fwd_btn, toolbar.children[0]);
toolbar.insertBefore(bck_btn, toolbar.children[0]);