import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { usePages } from '../context/PageContext';
import { Layout, Globe, Clock, Plus, ArrowRight } from 'lucide-react';
import classNames from 'classnames';

export function HomePage() {
    const { pages, isLoading } = usePages();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <Container className="mt-5">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading pages...</span>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="mb-2 d-flex align-items-center gap-2">
                        <Layout className="text-primary" />
                        Welcome to Node Manager
                    </h1>
                    <p className="text-muted mb-0">
                        Manage your pages and nodes efficiently
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => document.querySelector<HTMLButtonElement>('[data-add-page]')?.click()}
                    className="d-flex align-items-center gap-2"
                >
                    <Plus size={16} />
                    Create New Page
                </Button>
            </div>

            {pages.length === 0 ? (
                <Card className="text-center p-5 border-2">
                    <Card.Body>
                        <Layout size={48} className="text-muted mb-3" />
                        <h3>No Pages Yet</h3>
                        <p className="text-muted mb-4">
                            Get started by creating your first page
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => document.querySelector<HTMLButtonElement>('[data-add-page]')?.click()}
                            className="d-flex align-items-center gap-2 mx-auto"
                            style={{ width: 'fit-content' }}
                        >
                            <Plus size={16} />
                            Create New Page
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <Row>
                    {pages.map(page => {
                        return (
                            <Col key={page.id} md={4} className="mb-4">
                                <Card className="h-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div>
                                                <Card.Title className="mb-1">{page.title}</Card.Title>
                                                <div className="text-muted small">ID: {page.id}</div>
                                            </div>
                                            {page.isPublished && (
                                                <span className="badge bg-success bg-opacity-10 text-success px-2 py-1">
                          <Globe size={14} className="me-1" />
                          Published
                        </span>
                                            )}
                                        </div>

                                        {page.createdAt && (
                                            <div className="text-muted small mb-3 mt-auto d-flex align-items-center gap-1">
                                                <Clock size={14} />
                                                Created {new Date(page.createdAt).toLocaleDateString()}
                                            </div>
                                        )}

                                        <Button
                                            onClick={() => navigate(`/page/${page.id}`)}
                                            className={classNames(
                                                "d-flex align-items-center gap-2 btn btn-primary",
                                            )}
                                        >
                                            Open Page
                                            <ArrowRight size={16} />
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}
        </Container>
    );
}