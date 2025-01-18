import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, ButtonGroup } from 'react-bootstrap';
import { Node } from './Node';
import { Grid, AlignJustify } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { api } from '../services/api';
import { Page } from '../types';

export function PublicPageView() {
  const { id } = useParams<{ id: string }>();
  const [viewMode, setViewMode] = React.useState<'grid' | 'stack'>('grid');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadPage = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch page data
        const pageData = await api.getPage(id);
        
        if (!pageData.isPublished) {
          setError('This page is not published.');
          return;
        }
        
        // Fetch nodes for the page
        const nodes = await api.getNodes(id);
        
        // Combine page data with nodes
        setPage({
          ...pageData,
          nodes
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load page';
        setError(message);
        console.error('Error loading public page:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [id]);

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

  if (error || !page) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <h1 className="display-4 mb-4">404</h1>
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading mb-2">Page Not Found</h4>
            <p className="mb-0">
              {error || "This page doesn't exist."}
            </p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-light py-5">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="m-0">{page.title}</h1>
            {page.createdAt && (
              <small className="text-muted">
                Created {new Date(page.createdAt).toLocaleDateString()}
              </small>
            )}
          </div>
          {isDesktop && <ButtonGroup>
            <button
              className={classNames('btn d-flex align-items-center gap-2', {
                'btn-primary': viewMode === 'grid',
                'btn-outline-primary': viewMode !== 'grid'
              })}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
              Grid
            </button>
            <button
              className={classNames('btn d-flex align-items-center gap-2', {
                'btn-primary': viewMode === 'stack',
                'btn-outline-primary': viewMode !== 'stack'
              })}
              onClick={() => setViewMode('stack')}
            >
              <AlignJustify size={16} />
              Stack
            </button>
          </ButtonGroup>}
        </div>
        <Row className={classNames({
          'flex-column': viewMode === 'stack'
        })}>
          {page.nodes.map((node) => (
            <Col key={node.id} className={classNames('mb-4', {
              'col-md-4': viewMode === 'grid'
            })}>
              <Node
                index={page.nodes.indexOf(node)}
                node={node}
                onEdit={() => {}}
                onDelete={() => {}}
                editNode={() => {}}
                isGeneratingImage={false}
                pageId={page.id}
                readOnly
              />
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}