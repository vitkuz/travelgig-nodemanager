import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Page, Node } from '../types';
import { api } from '../services/api';
import { websocketService } from '../services/websocket.ts';

interface PageContextType {
  pages: Page[];
  isLoading: boolean;
  error: string | null;
  currentPage: Page | null;
  addPage: (title: string) => Promise<Page>;
  setCurrentPage: (page: Page | null) => void;
  addNode: (pageId: string, title: string, description: string, prompt?: string) => void;
  deletePage: (pageId: string) => Promise<void>;
  togglePublish: (pageId: string) => void;
  setPages: React.Dispatch<React.SetStateAction<Page[]>>;
  deleteNode: (pageId: string, nodeId: string) => void;
  editNode: (pageId: string, nodeId: string, node: Partial<Node>) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Error state for showing error messages
  const [error, setError] = useState<string | null>(null);


  // Connect to WebSocket on mount
  useEffect(() => {
    websocketService.connect();
    const removeHandler = websocketService.addMessageHandler(async (message) => {
      console.log(message)
      const updatedNode = message;
      // @ts-ignore
      const updatedPageId = updatedNode.pageId;
      // @ts-ignore
      const updatedNodeId = updatedNode.id;

      console.log(pages, updatedPageId, updatedNodeId)

      setPages(prev =>
          prev.map(p =>
              p.id === updatedPageId
                  ? {
                    ...p,
                    nodes: p.nodes.map(node =>
                        node.id === updatedNodeId ? { ...node, ...updatedNode } : node
                    )
                  }
                  : p
          )
      );

    });

    return () => {
      removeHandler();
    };
  }, [pages]);

  // Load pages on mount
  React.useEffect(() => {
    const loadPages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedPages = await api.getAllPages();
        setPages(fetchedPages);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load pages';
        setError(message);
        console.error('Error loading pages:', message);
      } finally {
        setIsLoading(false);
      }
    };
    loadPages();
  }, []);

  const addPage = async (title: string) => {
    const newPage: Page = {
      id: uuidv4(),
      title,
      isPublished: false,
      nodes: []
    };

    try {
      const createdPage = await api.createPage(newPage);
      setPages((prev) => [...prev, { ...createdPage, nodes: [] }]);
      return createdPage;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create page';
      setError(message);
      console.error('Error creating page:', message);
      throw error;
    }
  };

  const togglePublish = async (pageId: string) => {
    try {
      const page = pages.find(p => p.id === pageId);
      if (!page) return;

      const updatedPage = await api.updatePage(pageId, {
        title: page.title,
        isPublished: !page.isPublished
      });

      setPages(prev =>
          prev.map(p =>
              p.id === pageId
                  ? { ...p, isPublished: updatedPage.isPublished, title: updatedPage.title }
                  : p
          )
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to toggle publish status';
      setError(message);
      console.error('Error toggling publish:', message);
      throw error;
    }
  };

  const addNode = async (pageId: string, title: string, description: string, prompt?: string) => {
    const newNode: Node = {
      id: uuidv4(),
      title,
      description,
      pageId,
      prompt
    };

    try {
      const createdNode = await api.createNode(pageId, newNode);

      setPages(prev =>
          prev.map(page =>
              page.id === pageId
                  ? { ...page, nodes: [...page.nodes, createdNode] }
                  : page
          )
      );

      return createdNode;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create node';
      setError(message);
      console.error('Error creating node:', message);
      throw error;
    }
  };

  const deleteNode = async (pageId: string, nodeId: string) => {
    try {
      await api.deleteNode(pageId, nodeId);

      setPages(prev =>
          prev.map(page =>
              page.id === pageId
                  ? { ...page, nodes: page.nodes.filter(node => node.id !== nodeId) }
                  : page
          )
      );
      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete node';
      setError(message);
      console.error('Error deleting node:', message);
      throw error;
    }
  };

  const deletePage = async (pageId: string) => {
    try {
      await api.deletePage(pageId);
      setPages(prev => prev.filter(page => page.id !== pageId));
      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete page';
      setError(message);
      console.error('Error deleting page:', message);
      throw error;
    }
  };

  const editNode = async (pageId: string, nodeId: string, updates: Partial<Node>) => {
    try {
      // Get the current node state
      const currentNode = pages.find(p => p.id === pageId)?.nodes.find(n => n.id === nodeId);

      if (!currentNode) {
        throw new Error('Node not found');
      }

      // Merge current state with updates
      const mergedNode = {
        ...currentNode,
        ...updates
      };

      const updatedNode = await api.updateNode(pageId, nodeId, mergedNode);

      setPages(prev =>
          prev.map(p =>
              p.id === pageId
                  ? {
                    ...p,
                    nodes: p.nodes.map(node =>
                        node.id === nodeId ? { ...node, ...updatedNode } : node
                    )
                  }
                  : p
          )
      );
      setError(null);
      return updatedNode;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update node';
      setError(message);
      console.error('Error updating node:', message);
      throw error;
    }
  };

  return (
      <PageContext.Provider
          value={{
            pages,
            isLoading,
            error,
            currentPage,
            addPage,
            setCurrentPage,
            deletePage,
            addNode,
            togglePublish,
            deleteNode,
            editNode,
            setPages,
          }}
      >
        {children}
      </PageContext.Provider>
  );
}

export function usePages() {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error('usePages must be used within a PageProvider');
  }
  return context;
}

export function useCurrentPage() {
  const { id } = useParams();
  const { pages } = usePages();
  const [currentPage, setCurrentPage] = useState<Page | null>(null);

  useEffect(() => {
    if (id) {
      const page = pages.find(p => p.id === id);
      setCurrentPage(page || null);
    } else {
      setCurrentPage(null);
    }
  }, [id, pages]);

  return currentPage;
}