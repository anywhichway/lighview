function processMarkdown() {
    marked.setOptions({
        renderer: new marked.Renderer(),
        highlight: function(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
        pedantic: false,
        gfm: true,
        breaks: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        xhtml: false
    });
    [...document.querySelectorAll(".markdown")].forEach((el) => {
        el.innerHTML = marked.parse(el.innerHTML);
        [...el.querySelectorAll(".hljs")].forEach((el) => {
            [...el.childNodes].forEach((node) => {
                if(node.nodeType===Node.TEXT_NODE) {
                    if(["&lt;","&gt;","&amp;"].some((entity) => node.data.includes(entity))) {
                        node.data = node.data.replaceAll(/&lt;/g,"<")
                            .replaceAll(/&gt;/g,">")
                            .replaceAll(/&amp;/g,"&");
                    }
                }
            })

        })
    });
}

function ariaPatch() {
    [...document.body.querySelectorAll("input[name]")].forEach((input) => {
        if(input.id) {
            if(!document.querySelector(`label[for=${input.id}]`)) {
                const label = document.createElement("label");
                label.innerText = input.getAttribute("name");
                label.before(input);
            }
        }
    })
    //     <meta name="viewport" content="width=device-width, initial-scale=1">
}