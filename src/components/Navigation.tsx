import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Container, Form, Button } from 'react-bootstrap';
import { usePages, useCurrentPage } from '../context/PageContext';
import { AddPageModal } from './AddPageModal'; 
import { Layout, AlertCircle, ChevronRight } from 'lucide-react';

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
        <Container>
          <Navbar.Brand href="/" className="d-flex align-items-center gap-2">
            <Layout />
            <span>Node Manager</span>
            {currentPageTitle && (
              <div className="d-flex align-items-center">
                <ChevronRight size={16} />
                <span className="text-white-50">{currentPageTitle}</span>
              </div>
            )}
          </Navbar.Brand>
          <div className="d-flex align-items-center">
            {error ? (
              <div className="text-danger me-3 d-flex align-items-center">
                <AlertCircle size={16} className="me-1" />
                {error}
              </div>
            ) : (
              <Form.Select
                className="me-2"
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
            )}
            <Button
              variant="light"
              onClick={() => setShowAddPage(true)}
              disabled={isLoading}
            >
              Add Page
            </Button>
          </div>
        </Container>
      </Navbar>
      <AddPageModal show={showAddPage} onClose={() => setShowAddPage(false)} />
    </>
  );
}