import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar, Container, Button, Row, Col, Card, ButtonGroup, Modal } from 'react-bootstrap';
import { usePages } from '../context/PageContext';
import { Node } from './Node';
import { AddNodeModal } from './AddNodeModal';
import { SharePageModal } from './SharePageModal';
import { Plus, Share2, Globe, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function PageView() {
  const [showAddNode, setShowAddNode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoadingNodes, setIsLoadingNodes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<{ id: string; title: string; description: string } | null>(null);
  const [generatingImages, setGeneratingImages] = useState<{ [key: string]: boolean }>({});
  const { id } = useParams<{ id: string }>();
  const { pages, deleteNode, editNode, togglePublish, deletePage, setPages } = usePages();
  const navigate = useNavigate();
  
  const page = pages.find((p) => p.id === id);

  useEffect(() => {
    const loadNodes = async () => {
      if (!page) return;
      
      try {
        setIsLoadingNodes(true);
        setError(null);
        const nodes = await api.getNodes(page.id);
        
        // Update the page with loaded nodes
        setPages(prevPages => prevPages.map(p => 
          p.id === page.id ? { ...p, nodes } : p
        ));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load nodes';
        setError(message);
        console.error('Error loading nodes:', error);
      } finally {
        setIsLoadingNodes(false);
      }
    };

    loadNodes();
  }, [page?.id, setPages]);

  const handleDelete = (nodeId: string) => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      deleteNode(page!.id, nodeId);
    }
  };

  const handleDeletePage = async () => {
    try {
      await deletePage(page!.id);
      setShowDeleteConfirm(false);
      navigate('/home');
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  if (!page) {
    return (
      <Container className="mt-4">
        <div className="alert alert-danger" role="alert">Page not found</div>
      </Container>
    );
  }

  return (
    <div>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand>
            {page.title}
            <small className="ms-2 text-muted">ID: {page.id}</small>
            {page.isPublished && (
              <span className="ms-2 badge bg-success">Published</span>
            )}
          </Navbar.Brand>
          <ButtonGroup>
            <Button
              variant={page.isPublished ? "success" : "outline-success"}
              onClick={() => togglePublish(page.id)}
              className="d-flex align-items-center gap-1"
            >
              <Globe size={16} />
              {page.isPublished ? 'Published' : 'Publish'}
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => setShowShareModal(true)}
              className="d-flex align-items-center gap-1"
            >
              <Share2 size={16} />
              Share
            </Button>
            <Button
              variant="outline-danger"
              onClick={() => setShowDeleteConfirm(true)}
              className="d-flex align-items-center gap-1"
            >
              <Trash2 size={16} />
              Delete Page
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowAddNode(true)}
              className="d-flex align-items-center gap-1"
            >
              <Plus size={16} />
              Add Node
            </Button>
          </ButtonGroup>
        </Container>
      </Navbar>
      <Container className="mt-4">
        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            {error}
          </div>
        )}
        {isLoadingNodes ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading nodes...</span>
            </div>
          </div>
        ) : (
        <Row>
          {page.nodes.map((node) => (
            <Col key={node.id} md={4} className="mb-4">
              <Node
                index={page.nodes.indexOf(node)}
                node={node}
                onEdit={setEditingNode}
                onDelete={handleDelete}
                editNode={editNode}
                isGeneratingImage={generatingImages[node.id]}
                pageId={page.id}
              />
            </Col>
          ))}
        </Row>
        )}
      </Container>
      <AddNodeModal
        show={showAddNode}
        onClose={() => setShowAddNode(false)}
        pageId={page.id}
        editingNode={editingNode}
        onCloseEdit={() => setEditingNode(null)}
      />
      <SharePageModal
        show={showShareModal}
        onClose={() => setShowShareModal(false)}
        pageId={page.id}
        isPublished={page.isPublished}
      />
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Page</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{page.title}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeletePage}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}