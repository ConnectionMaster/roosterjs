import { cacheGetEventData, ContentEditFeature, Editor, Keys } from 'roosterjs-editor-core';
import { PluginKeyboardEvent, PositionType } from 'roosterjs-editor-types';
import {
    getTagOfNode,
    isNodeEmpty,
    splitBalancedNodeRange,
    toArray,
    unwrap,
    wrap,
} from 'roosterjs-editor-dom';

const QUOTE_TAG = 'BLOCKQUOTE';
const STRUCTURED_TAGS = [QUOTE_TAG, 'LI', 'TD', 'TH'].join(',');

/**
 * UnquoteWhenBackOnEmpty1stLine edit feature, provides the ability to Unquote current line when
 * user press BACKSPACE on first and empty line of a BLOCKQUOTE
 */
const UnquoteWhenBackOnEmpty1stLine: ContentEditFeature = {
    keys: [Keys.BACKSPACE],
    shouldHandleEvent: (event, editor) => {
        let childOfQuote = cacheGetQuoteChild(event, editor);
        return childOfQuote && isNodeEmpty(childOfQuote) && !childOfQuote.previousSibling;
    },
    handleEvent: splitQuote,
};

/**
 * UnquoteWhenEnterOnEmptyLine edit feature, provides the ability to Unquote current line when
 * user press ENTER on an empty line of a BLOCKQUOTE
 */
const UnquoteWhenEnterOnEmptyLine: ContentEditFeature = {
    keys: [Keys.ENTER],
    shouldHandleEvent: (event, editor) => {
        let childOfQuote = cacheGetQuoteChild(event, editor);
        let shift = event.rawEvent.shiftKey;
        return !shift && childOfQuote && isNodeEmpty(childOfQuote);
    },
    handleEvent: (event, editor) =>
        editor.addUndoSnapshot(
            () => splitQuote(event, editor),
            null /*changeSource*/,
            true /*canUndoByBackspace*/
        ),
};

function cacheGetQuoteChild(event: PluginKeyboardEvent, editor: Editor): Node {
    return cacheGetEventData(event, 'QUOTE_CHILD', () => {
        let quote = editor.getElementAtCursor(STRUCTURED_TAGS);
        if (quote && getTagOfNode(quote) == QUOTE_TAG) {
            let pos = editor.getFocusedPosition();
            let block = pos && editor.getBlockElementAtNode(pos.normalize().node);
            if (block) {
                let node =
                    block.getStartNode() == quote
                        ? block.getStartNode()
                        : block.collapseToSingleElement();
                return isNodeEmpty(node) ? node : null;
            }
        }

        return null;
    });
}

function splitQuote(event: PluginKeyboardEvent, editor: Editor) {
    editor.addUndoSnapshot(() => {
        let childOfQuote = cacheGetQuoteChild(event, editor);
        let parent: Node;
        if (getTagOfNode(childOfQuote) == QUOTE_TAG) {
            childOfQuote = wrap(toArray(childOfQuote.childNodes));
        }
        parent = splitBalancedNodeRange(childOfQuote);
        unwrap(parent);
        editor.select(childOfQuote, PositionType.Begin);
    });
    event.rawEvent.preventDefault();
}

/**
 * Settings for quote features
 */
export default interface QuoteFeatureSettings {
    /**
     * When press BAckspace on empty line which is the first line of a blockquote, unquote current line
     * @default true
     */
    unquoteWhenBackspaceOnEmptyFirstLine: boolean;

    /**
     * When press Enter on empty line in a blockquote, unquote current line
     * @default true
     */
    unquoteWhenEnterOnEmptyLine: boolean;
}

/**
 * @internal
 */
export const QuoteFeatures: Record<keyof QuoteFeatureSettings, ContentEditFeature> = {
    unquoteWhenBackspaceOnEmptyFirstLine: UnquoteWhenBackOnEmpty1stLine,
    unquoteWhenEnterOnEmptyLine: UnquoteWhenEnterOnEmptyLine,
};
