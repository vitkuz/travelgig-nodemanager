import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Wand2 } from 'lucide-react';
import { usePages } from '../context/PageContext';
import { getRandomItem } from '../utils/array';
import { titles } from '../data/titles';
import { descriptions } from '../data/descriptions';
import { prompts } from '../data/prompts';

// Helper function to generate random time between 3 and 15 seconds
const getRandomTime = () => Math.floor(Math.random() * (15 - 3 + 1)) + 3;

// Helper function to generate random narration
const generateNarration = (description: string) => {
    const intros = [
        "In this scene, ",
        "Here we see ",
        "Now we explore ",
        "Let's focus on ",
        "Moving forward, "
    ];
    return `${getRandomItem(intros)}${description.toLowerCase()}`;
};

interface GenerateNodesModalProps {
    show: boolean;
    onClose: () => void;
    pageId: string;
}

export function GenerateNodesModal({ show, onClose, pageId }: GenerateNodesModalProps) {
    const [quantity, setQuantity] = React.useState(1);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const { addNode } = usePages();

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            for (let i = 0; i < quantity; i++) {
                const description = getRandomItem(descriptions);
                const newNode = {
                    id: crypto.randomUUID(),
                    title: getRandomItem(titles),
                    description,
                    pageId,
                    prompt: getRandomItem(prompts),
                    time: getRandomTime(),
                    narration: generateNarration(description)
                };

                await addNode(
                    pageId,
                    newNode
                );
            }
            onClose();
        } catch (error) {
            console.error('Error generating nodes:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center gap-2">
                    <Wand2 size={20} />
                    Generate Random Nodes
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>How many nodes would you like to generate?</Form.Label>
                    <Form.Control
                        type="number"
                        min={1}
                        max={10}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                    />
                    <Form.Text className="text-muted">
                        You can generate up to 10 nodes at once.
                    </Form.Text>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="d-flex align-items-center gap-2"
                >
                    <Wand2 size={16} />
                    {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}