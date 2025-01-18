import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FileJson, AlertCircle } from 'lucide-react';
import { usePages } from '../context/PageContext';
import { Node } from '../types';

interface ImportScenarioModalProps {
    show: boolean;
    onClose: () => void;
    pageId: string;
}

export function ImportScenarioModal({ show, onClose, pageId }: ImportScenarioModalProps) {
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const { addNode } = usePages();

    const validateAndParseJSON = (input: string): Node[] | null => {
        try {
            const parsed = JSON.parse(input);

            // Validate array structure
            if (!Array.isArray(parsed)) {
                throw new Error('Input must be an array of nodes');
            }

            // Validate each node
            parsed.forEach((node, index) => {
                if (!node.title || typeof node.title !== 'string') {
                    throw new Error(`Node ${index + 1} is missing a valid title`);
                }
                if (!node.description || typeof node.description !== 'string') {
                    throw new Error(`Node ${index + 1} is missing a valid description`);
                }
            });

            return parsed;
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Invalid JSON format');
            }
            return null;
        }
    };

    const handleImport = async () => {
        setError(null);
        const nodes = validateAndParseJSON(jsonInput);

        if (!nodes) return;

        setIsImporting(true);
        try {
            for (const node of nodes) {
                await addNode(
                    pageId,
                    node.title,
                    node.description,
                    node.prompt
                );
            }
            setJsonInput('');
            onClose();
        } catch (error) {
            setError('Failed to import nodes');
            console.error('Error importing nodes:', error);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center gap-2">
                    <FileJson size={20} />
                    Import Scenario
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Paste your JSON scenario</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={10}
                        value={jsonInput}
                        onChange={(e) => {
                            setJsonInput(e.target.value);
                            setError(null);
                        }}
                        placeholder={`[
  {
    "title": "Node Title",
    "description": "Node Description",
    "prompt": "Optional image generation prompt"
  }
]`}
                        className="font-monospace"
                    />
                    <Form.Text className="text-muted">
                        The JSON should be an array of nodes with title, description, and optional prompt fields.
                    </Form.Text>
                </Form.Group>

                {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleImport}
                    disabled={!jsonInput.trim() || isImporting}
                    className="d-flex align-items-center gap-2"
                >
                    <FileJson size={16} />
                    {isImporting ? 'Importing...' : 'Import'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}