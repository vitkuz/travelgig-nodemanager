import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';
import { Node } from '../types';

interface DeleteNodeModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    node: Node | null;
}

export function DeleteNodeModal({ show, onClose, onConfirm, node }: DeleteNodeModalProps) {
    if (!node) return null;

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="text-danger d-flex align-items-center gap-2">
                    <AlertTriangle className="text-danger" />
                    Delete Node
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-1">Are you sure you want to delete this node?</p>
                <div className="bg-light rounded p-3 mb-3">
                    <div className="fw-medium mb-1">{node.title}</div>
                    <div className="text-muted small">{node.description}</div>
                </div>
                <p className="text-danger mb-0">
                    This action cannot be undone.
                </p>
            </Modal.Body>
            <Modal.Footer className="border-0">
                <Button variant="outline-secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant="danger"
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    className="d-flex align-items-center gap-2"
                >
                    <AlertTriangle size={16} />
                    Delete Node
                </Button>
            </Modal.Footer>
        </Modal>
    );
}