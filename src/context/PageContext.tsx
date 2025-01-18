import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Page, Node } from '../types';
import { api } from '../services/api';
import { updateNodeInPages, addNodeToPage, removeNodeFromPage, updatePageInArray } from '../utils/merge';
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
      const updatedNode = message as unknown as Node;
      const updatedPageId = updatedNode.pageId;
      const updatedNodeId = updatedNode.id;

      try {
        // Fetch the latest node data from the server
        const latestNode = await api.getNodes(updatedPageId);
        const updatedNodeData = latestNode.find(node => node.id === updatedNodeId);

        if (updatedNodeData) {
          setPages(prev => updateNodeInPages(prev, updatedPageId, updatedNodeId, updatedNodeData));
        }
      } catch (error) {
        console.error('Error fetching updated node:', error);
      }
    });

    return () => {
      removeHandler();
    };
  }, []);

  // Load pages on mount
  useEffect(() => {
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
      setPages(prev => [...prev, { ...createdPage, nodes: [] }]);
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

      setPages(prev => updatePageInArray(prev, pageId, {
        isPublished: updatedPage.isPublished,
        title: updatedPage.title
      }));
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
      time: 0,
      pageId,
      prompt
    };

    try {
      const createdNode = await api.createNode(pageId, newNode);

      setPages(prev => addNodeToPage(prev, pageId, createdNode));

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

      setPages(prev => removeNodeFromPage(prev, pageId, nodeId));
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

      console.log({
        currentNode,
        updates
      })

      // Merge current state with updates
      const mergedNode = {
        ...currentNode,
        ...updates,
        time: updates.time || currentNode.time,
        narration: updates.narration || currentNode.narration
      };

      const updatedNode = await api.updateNode(pageId, nodeId, mergedNode);

      setPages(prev => updateNodeInPages(prev, pageId, nodeId, updatedNode));
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