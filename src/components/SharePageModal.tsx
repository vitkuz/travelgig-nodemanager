import React from 'react';
import { Modal, Button, InputGroup, Form } from 'react-bootstrap';
import { Copy, Share2 } from 'lucide-react';

interface SharePageModalProps {
  show: boolean;
  onClose: () => void;
  pageId: string;
  isPublished: boolean;
}

export function SharePageModal({ show, onClose, pageId, isPublished }: SharePageModalProps) {
  const publicUrl = `${window.location.origin}/view/${pageId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <Share2 size={20} />
          Share Page
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isPublished ? (
          <>
            <p className="text-success mb-3">
              This page is published and can be viewed by anyone with the link.
            </p>
            <InputGroup>
              <Form.Control
                type="text"
                value={publicUrl}
                readOnly
              />
              <Button 
                variant="outline-secondary"
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                <Copy size={16} />
              </Button>
            </InputGroup>
          </>
        ) : (
          <p className="text-warning">
            This page is not published. Publish it first to get a shareable link.
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}