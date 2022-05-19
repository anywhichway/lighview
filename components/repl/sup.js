class Sup {
    static get isInline() {
        return true;
    }
    static get title() {
        return "Supercase";
    }

    constructor({api}) {
        this.api = api;
        this.button = null;
    }

    render() {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.textContent = '&sup2;';
        this.button.classList.add(this.api.styles.inlineToolButton);
        return this.button;
    }

    surround(range) {
        if (this.state) {
            return;
        }
        const selectedText = range.extractContents();
        const sup = document.createElement('SUP');

        sup.appendChild(selectedText);
        range.insertNode(sup);

        this.api.selection.expandToTag(sup);
    }

    checkState(selection) {
        const text = selection.anchorNode;
        if (!text) {
            return;
        }
        this.state = true;
    }
}

export {Sup, Sup as default}