import { Page, Node } from '../types';

/**
 * Updates a node in a page's nodes array
 * @param nodes Current array of nodes
 * @param nodeId ID of the node to update
 * @param updates Partial updates to apply to the node
 * @returns New array with the updated node
 */
export function updateNodeInArray(nodes: Node[], nodeId: string, updates: Partial<Node>): Node[] {
    return nodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
    );
}

/**
 * Updates a specific page in an array of pages
 * @param pages Current array of pages
 * @param pageId ID of the page to update
 * @param updates Partial updates to apply to the page
 * @returns New array with the updated page
 */
export function updatePageInArray(pages: Page[], pageId: string, updates: Partial<Page>): Page[] {
    return pages.map(page =>
        page.id === pageId ? { ...page, ...updates } : page
    );
}

/**
 * Updates a node within a specific page in an array of pages
 * @param pages Current array of pages
 * @param pageId ID of the page containing the node
 * @param nodeId ID of the node to update
 * @param updates Partial updates to apply to the node
 * @returns New array with the updated node within the specified page
 */
export function updateNodeInPages(
    pages: Page[],
    pageId: string,
    nodeId: string,
    updates: Partial<Node>
): Page[] {
    return pages.map(page =>
        page.id === pageId
            ? {
                ...page,
                nodes: updateNodeInArray(page.nodes, nodeId, updates)
            }
            : page
    );
}

/**
 * Adds a node to a specific page in an array of pages
 * @param pages Current array of pages
 * @param pageId ID of the page to add the node to
 * @param node Node to add
 * @returns New array with the added node
 */
export function addNodeToPage(pages: Page[], pageId: string, node: Node): Page[] {
    return pages.map(page =>
        page.id === pageId
            ? { ...page, nodes: [...page.nodes, node] }
            : page
    );
}

/**
 * Removes a node from a specific page in an array of pages
 * @param pages Current array of pages
 * @param pageId ID of the page containing the node
 * @param nodeId ID of the node to remove
 * @returns New array with the node removed
 */
export function removeNodeFromPage(pages: Page[], pageId: string, nodeId: string): Page[] {
    return pages.map(page =>
        page.id === pageId
            ? { ...page, nodes: page.nodes.filter(node => node.id !== nodeId) }
            : page
    );
}