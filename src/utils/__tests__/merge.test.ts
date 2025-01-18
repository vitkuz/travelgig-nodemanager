import { describe, it, expect } from 'vitest';
import {
    updateNodeInArray,
    updatePageInArray,
    updateNodeInPages,
    addNodeToPage,
    removeNodeFromPage
} from '../merge';
import { Page, Node } from '../../types';

describe('merge utils', () => {
    const mockNode: Node = {
        id: '1',
        title: 'Test Node',
        description: 'Test Description',
        pageId: '1'
    };

    const mockPage: Page = {
        id: '1',
        title: 'Test Page',
        isPublished: false,
        nodes: [mockNode]
    };

    describe('updateNodeInArray', () => {
        it('should update a node in an array', () => {
            const nodes = [mockNode];
            const updates = { title: 'Updated Title' };
            const result = updateNodeInArray(nodes, '1', updates);

            expect(result[0].title).toBe('Updated Title');
            expect(result[0].description).toBe(mockNode.description);
        });

        it('should not modify other nodes', () => {
            const nodes = [mockNode, { ...mockNode, id: '2' }];
            const updates = { title: 'Updated Title' };
            const result = updateNodeInArray(nodes, '1', updates);

            expect(result[1]).toEqual(nodes[1]);
        });
    });

    describe('updatePageInArray', () => {
        it('should update a page in an array', () => {
            const pages = [mockPage];
            const updates = { title: 'Updated Page' };
            const result = updatePageInArray(pages, '1', updates);

            expect(result[0].title).toBe('Updated Page');
            expect(result[0].nodes).toEqual(mockPage.nodes);
        });
    });

    describe('updateNodeInPages', () => {
        it('should update a node within a page', () => {
            const pages = [mockPage];
            const updates = { title: 'Updated Node' };
            const result = updateNodeInPages(pages, '1', '1', updates);

            expect(result[0].nodes[0].title).toBe('Updated Node');
            expect(result[0].title).toBe(mockPage.title);
        });
    });

    describe('addNodeToPage', () => {
        it('should add a node to a page', () => {
            const pages = [mockPage];
            const newNode: Node = {
                id: '2',
                title: 'New Node',
                description: 'New Description',
                pageId: '1'
            };
            const result = addNodeToPage(pages, '1', newNode);

            expect(result[0].nodes).toHaveLength(2);
            expect(result[0].nodes[1]).toEqual(newNode);
        });
    });

    describe('removeNodeFromPage', () => {
        it('should remove a node from a page', () => {
            const pages = [mockPage];
            const result = removeNodeFromPage(pages, '1', '1');

            expect(result[0].nodes).toHaveLength(0);
        });

        it('should not modify other pages', () => {
            const pages = [mockPage, { ...mockPage, id: '2' }];
            const result = removeNodeFromPage(pages, '1', '1');

            expect(result[1].nodes).toHaveLength(1);
        });
    });
});