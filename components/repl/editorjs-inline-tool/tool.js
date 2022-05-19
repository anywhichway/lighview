/**
 * GenericInlineTool returns an EditorJS.InlineTool capable of wrapping a
 * selected text with any given `tagName`.
 *
 * inspired by
 * @see https://github.com/editor-js/marker/blob/c306bcb33c88eaa3c172eaf387fbcd06ae6b297f/src/index.js
 */
var createGenericInlineTool = function (_a) {
    var _b;
    var sanitize = _a.sanitize, shortcut = _a.shortcut, tagName = _a.tagName, toolboxIcon = _a.toolboxIcon;
    return _b = /** @class */ (function () {
            /**
             * @param {{api: object}}  - Editor.js API
             */
            function GenericInlineTool(_a) {
                var api = _a.api;
                this.api = null;
                this.button = null;
                this.tag = null;
                this.iconClasses = null;
                this.api = api;
                /**
                 * Toolbar Button
                 *
                 * @type {HTMLElement|null}
                 */
                this.button = null;
                /**
                 * Tag that should is rendered in the editor
                 *
                 * @type {string}
                 */
                this.tag = tagName;
                /**
                 * CSS classes
                 */
                this.iconClasses = {
                    base: this.api.styles.inlineToolButton,
                    active: this.api.styles.inlineToolButtonActive,
                };
            }
            /**
             * Create button element for Toolbar
             *
             * @return {HTMLButtonElement}
             */
            GenericInlineTool.prototype.render = function () {
                this.button = document.createElement('button');
                this.button.type = 'button';
                this.button.classList.add(this.iconClasses.base);
                this.button.innerHTML = this.toolboxIcon;
                return this.button;
            };
            /**
             * Wrap/Unwrap selected fragment
             *
             * @param {Range} range - selected fragment
             */
            GenericInlineTool.prototype.surround = function (range) {
                if (!range) {
                    return;
                }
                var termWrapper = this.api.selection.findParentTag(this.tag);
                /**
                 * If start or end of selection is in the highlighted block
                 */
                if (termWrapper) {
                    this.unwrap(termWrapper);
                }
                else {
                    this.wrap(range);
                }
            };
            /**
             * Wrap selection with term-tag
             *
             * @param {Range} range - selected fragment
             */
            GenericInlineTool.prototype.wrap = function (range) {
                /**
                 * Create a wrapper for given tagName
                 */
                var strongElement = document.createElement(this.tag);
                /**
                 * SurroundContent throws an error if the Range splits a non-Text node with only one of its boundary points
                 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Range/surroundContents}
                 *
                 * // range.surroundContents(span);
                 */
                strongElement.appendChild(range.extractContents());
                range.insertNode(strongElement);
                /**
                 * Expand (add) selection to highlighted block
                 */
                this.api.selection.expandToTag(strongElement);
            };
            /**
             * Unwrap term-tag
             *
             * @param {HTMLElement} termWrapper - term wrapper tag
             */
            GenericInlineTool.prototype.unwrap = function (termWrapper) {
                /**
                 * Expand selection to all term-tag
                 */
                this.api.selection.expandToTag(termWrapper);
                var sel = window.getSelection();
                var range = sel.getRangeAt(0);
                var unwrappedContent = range.extractContents();
                /**
                 * Remove empty term-tag
                 */
                termWrapper.parentNode.removeChild(termWrapper);
                /**
                 * Insert extracted content
                 */
                range.insertNode(unwrappedContent);
                /**
                 * Restore selection
                 */
                sel.removeAllRanges();
                sel.addRange(range);
            };
            /**
             * Check and change Term's state for current selection
             */
            GenericInlineTool.prototype.checkState = function () {
                var termTag = this.api.selection.findParentTag(this.tag);
                this.button.classList.toggle(this.iconClasses.active, !!termTag);
                return !!termTag;
            };
            Object.defineProperty(GenericInlineTool.prototype, "toolboxIcon", {
                /**
                 * Get Tool icon's SVG
                 * @return {string}
                 */
                get: function () {
                    return toolboxIcon;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(GenericInlineTool, "sanitize", {
                /**
                 * Sanitizer rule
                 * @return {Object.<string>} {Object.<string>}
                 */
                get: function () {
                    return sanitize;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(GenericInlineTool.prototype, "shortcut", {
                /**
                 * Set a shortcut
                 */
                get: function () {
                    return shortcut;
                },
                enumerable: false,
                configurable: true
            });
            return GenericInlineTool;
        }()),
        /**
         * Specifies Tool as Inline Toolbar Tool
         *
         * @return {boolean}
         */
        _b.isInline = true,
        _b;
};
export default createGenericInlineTool;
//# sourceMappingURL=tool.js.map