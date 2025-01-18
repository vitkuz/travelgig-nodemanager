import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Container, Form, Button } from 'react-bootstrap';
import { usePages } from '../context/PageContext';
import { AddPageModal } from './AddPageModal';
import { Layout, AlertCircle, ChevronRight, Plus } from 'lucide-react';

export function Navigation() {
  const [showAddPage, setShowAddPage] = useState(false);
  const { pages, isLoading, error } = usePages();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract page ID from URL path
  const currentPageId = location.pathname.match(/\/page\/([^/]+)/)?.[1] || '';
  const currentPageTitle = pages.find(p => p.id === currentPageId)?.title;

  const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pageId = e.target.value;
    if (pageId) {
      navigate(`/page/${pageId}`);
    }
  };

  return (
      <>
        <Navbar bg="primary" variant="dark" expand="lg">
          <Container className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <Navbar.Brand href="/" className="d-flex align-items-center gap-2">
                <Layout size={24} />
              </Navbar.Brand>
              <div className="d-flex align-items-center">
                <Form.Select
                    className="form-select-sm border-0"
                    value={currentPageId || ''}
                    onChange={handlePageChange}
                    style={{ minWidth: '200px' }}
                    disabled={isLoading}
                    aria-label="Select page"
                >
                  <option value="">
                    {isLoading ? 'Loading pages...' : 'Select a page...'}
                  </option>
                  {pages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.title}
                      </option>
                  ))}
                </Form.Select>
              </div>
            </div>
            <div>
              <Button
                  variant="outline-light"
                  onClick={() => setShowAddPage(true)}
                  data-add-page
                  className="d-flex align-items-center gap-1"
                  disabled={isLoading}
                  size="sm"
              >
                <Plus size={16} />
                Add Page
              </Button>
            </div>
          </Container>
        </Navbar>
        <AddPageModal show={showAddPage} onClose={() => setShowAddPage(false)} />
      </>
  );
}