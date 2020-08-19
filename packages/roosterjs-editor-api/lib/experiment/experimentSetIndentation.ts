import blockFormat from '../utils/blockFormat';
import { BlockElement, IEditor, Indentation, Region } from 'roosterjs-editor-types';
import {
    collapseNodesInRegion,
    createVListFromRegion,
    findClosestElementAncestor,
    fromHtml,
    getBlockElementAtNode,
    getSelectedBlockElementsInRegion,
    getTagOfNode,
    isNodeInRegion,
    splitBalancedNodeRange,
    toArray,
    unwrap,
    wrap,
} from 'roosterjs-editor-dom';

const BlockWrapper = '<blockquote style="margin-top:0;margin-bottom:0"></blockquote>';

/**
 * @internal
 */
export default function experimentSetIndentation(editor: IEditor, indentation: Indentation) {
    const handler = indentation == Indentation.Increase ? indent : outdent;

    blockFormat(editor, (region, start, end) => {
        const blocks = getSelectedBlockElementsInRegion(region);
        const blockGroups: BlockElement[][] = [[]];

        if (blocks.length == 0 && !region.rootNode.firstChild) {
            const newNode = fromHtml('<div><br></div>', region.rootNode.ownerDocument)[0];
            region.rootNode.appendChild(newNode);
            blocks.push(getBlockElementAtNode(region.rootNode, newNode));
        }

        for (let i = 0; i < blocks.length; i++) {
            const startNode = blocks[i].getStartNode();
            const vList = createVListFromRegion(region, true /*includeSiblingLists*/, startNode);

            if (vList) {
                blockGroups.push([]);
                while (blocks[i + 1] && vList.contains(blocks[i + 1].getStartNode())) {
                    i++;
                }
                vList.setIndentation(start, end, indentation);
                vList.writeBack();
            } else {
                blockGroups[blockGroups.length - 1].push(blocks[i]);
            }
        }

        blockGroups.forEach(group => handler(region, group));
    });
}

function indent(region: Region, blocks: BlockElement[]) {
    if (blocks.length > 0) {
        const startNode = blocks[0].getStartNode();
        const endNode = blocks[blocks.length - 1].getEndNode();
        const nodes = collapseNodesInRegion(region, [startNode, endNode]);
        wrap(nodes, BlockWrapper);
    }
}

function outdent(region: Region, blocks: BlockElement[]) {
    blocks.forEach(blockElement => {
        let node = blockElement.collapseToSingleElement();
        const quote = findClosestElementAncestor(node, region.rootNode, 'blockquote');
        if (quote) {
            if (node == quote) {
                node = wrap(toArray(node.childNodes));
            }

            while (isNodeInRegion(region, node) && getTagOfNode(node) != 'BLOCKQUOTE') {
                node = splitBalancedNodeRange(node);
            }

            if (isNodeInRegion(region, node)) {
                unwrap(node);
            }
        }
    });
}
