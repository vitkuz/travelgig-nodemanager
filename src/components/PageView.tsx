import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar, Container, Button, Row, Col, Modal } from 'react-bootstrap';
import { usePages } from '../context/PageContext';
import { Node } from './Node';
import { AddNodeModal } from './AddNodeModal';
import { SharePageModal } from './SharePageModal';
import { DeleteNodeModal } from './DeleteNodeModal';
import { ImportScenarioModal } from './ImportScenarioModal';
import { GenerateNodesModal } from './GenerateNodesModal';
import { Plus, Share2, Globe, Trash2, Wand2, SortAsc, SortDesc, FileJson } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { updatePageInArray } from '../utils/merge';

export function PageView() {
  const [showAddNode, setShowAddNode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showGenerateNodes, setShowGenerateNodes] = useState(false);
  const [showImportScenario, setShowImportScenario] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<Node | null>(null);
  const [isLoadingNodes, setIsLoadingNodes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<{ id: string; title: string; description: string } | null>(null);
  const [sortAscending, setSortAscending] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { pages, deleteNode, editNode, togglePublish, deletePage, setPages, isLoading } = usePages();
  const navigate = useNavigate();

  const page = pages.find((p) => p.id === id);

  useEffect(() => {
    const loadNodes = async () => {
      if (!page) return;

      try {
        setIsLoadingNodes(true);
        setError(null);
        const nodes = await api.getNodes(page.id);

        // Use utility function to update page with loaded nodes
        setPages(prevPages => updatePageInArray(prevPages, page.id, { nodes }));
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

  const handleDelete = async () => {
    if (nodeToDelete && page) {
      await deleteNode(page.id, nodeToDelete.id);
      setNodeToDelete(null);
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

  if (isLoading) {
    return (
        <Container className="mt-5">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading page...</span>
            </div>
          </div>
        </Container>
    );
  }

  if (error) {
    return (
        <Container className="mt-4">
          <div className="alert alert-danger" role="alert">{error}</div>
        </Container>
    );
  }

  if (!page) {
    return (
        <Container className="mt-4">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading mb-2">Page Not Found</h4>
            <p className="mb-0">The requested page could not be found.</p>
          </div>
        </Container>
    );
  }

  return (
      <div>
        <Navbar bg="light" expand="lg">
          <Container>
            <div className="text-center w-100 p-2 text-lg-start">
              <h1 className="mb-1">
                {page.title}
              </h1>
              <small className="text-muted">{page.id}</small>
              {/*{page.isPublished && (*/}
              {/*    <span className="badge bg-success">Published</span>*/}
              {/*)}*/}
            </div>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <Button
                  variant={page.isPublished ? "success" : "outline-success"}
                  onClick={() => togglePublish(page.id)}
                  className="d-flex align-items-center gap-1"
                  size="sm"
              >
                <Globe size={16} />
                <span className="d-none d-sm-inline">
                  {page.isPublished ? 'Published' : 'Publish'}
                </span>
              </Button>
              <Button
                  variant="outline-secondary"
                  onClick={() => setSortAscending(!sortAscending)}
                  className="d-flex align-items-center gap-1"
                  size="sm"
                  title={sortAscending ? "Showing oldest first" : "Showing newest first"}
              >
                {sortAscending ? <SortAsc size={16} /> : <SortDesc size={16} />}
                <span className="d-none d-sm-inline">
                  {sortAscending ? 'Oldest First' : 'Newest First'}
                </span>
              </Button>
              <Button
                  variant="outline-primary"
                  onClick={() => setShowShareModal(true)}
                  className="d-flex align-items-center gap-1"
                  size="sm"
              >
                <Share2 size={16} />
                <span className="d-none d-sm-inline">Share</span>
              </Button>
              <Button
                  variant="outline-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="d-flex align-items-center gap-1"
                  size="sm"
              >
                <Trash2 size={16} />
                <span className="d-none d-sm-inline">Delete Page</span>
              </Button>
              <Button
                  variant="outline-primary"
                  onClick={() => setShowGenerateNodes(true)}
                  className="d-flex align-items-center gap-1"
                  size="sm"
              >
                <Wand2 size={16} />
                <span className="d-none d-sm-inline">Generate</span>
              </Button>
              <Button
                  variant="outline-primary"
                  onClick={() => setShowImportScenario(true)}
                  className="d-flex align-items-center gap-1"
                  size="sm"
              >
                <FileJson size={16} />
                <span className="d-none d-sm-inline">Import</span>
              </Button>
              <Button
                  variant="primary"
                  onClick={() => setShowAddNode(true)}
                  className="d-flex align-items-center gap-1"
                  size="sm"
              >
                <Plus size={16} />
                <span className="d-none d-sm-inline">Add Node</span>
              </Button>
            </div>
          </Container>
        </Navbar>
        <Container className="mt-4">
          {isLoadingNodes ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading nodes...</span>
                </div>
              </div>
          ) : (
              <Row>
                {[...page.nodes]
                    .sort((a, b) => {
                      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                      return sortAscending ? dateA - dateB : dateB - dateA;
                    })
                    .map((node) => (
                        <Col key={node.id} md={4} className="mb-4">
                          <Node
                              index={page.nodes.indexOf(node)}
                              node={node}
                              onEdit={setEditingNode}
                              onDelete={() => setNodeToDelete(node)}
                              editNode={editNode}
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
        <GenerateNodesModal
            show={showGenerateNodes}
            onClose={() => setShowGenerateNodes(false)}
            pageId={page.id}
        />
        <ImportScenarioModal
            show={showImportScenario}
            onClose={() => setShowImportScenario(false)}
            pageId={page.id}
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
        <DeleteNodeModal
            show={!!nodeToDelete}
            onClose={() => setNodeToDelete(null)}
            onConfirm={handleDelete}
            node={nodeToDelete}
        />
      </div>
  );
}