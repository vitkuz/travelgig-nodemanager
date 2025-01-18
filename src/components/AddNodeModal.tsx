import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { usePages } from '../context/PageContext';
import { prompts } from '../data/prompts';
import { descriptions } from '../data/descriptions';
import { titles } from '../data/titles';
import { getRandomItem } from '../utils/array';
import { Shuffle, Type, FileText } from 'lucide-react';

interface FormInputs {
  title: string;
  description: string;
  time: number;
  narration: string;
  prompt: string;
}

interface AddNodeModalProps {
  show: boolean;
  onClose: () => void;
  pageId: string;
  editingNode: { id: string; title: string; description: string; prompt?: string } | null;
  onCloseEdit: () => void;
}

export function AddNodeModal({ show, onClose, pageId, editingNode, onCloseEdit }: AddNodeModalProps) {
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<FormInputs>();
  const { addNode, editNode } = usePages();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRandomPrompt = () => getRandomItem(prompts);
  const getRandomTitle = () => getRandomItem(titles);
  const getRandomDescription = () => getRandomItem(descriptions);

  const handleRandomPrompt = () => {
    setValue('prompt', getRandomPrompt());
  };

  const handleRandomTitle = () => {
    setValue('title', getRandomTitle());
  };

  const handleRandomDescription = () => {
    setValue('description', getRandomDescription());
  };

  React.useEffect(() => {
    if (editingNode) {
      setValue('title', editingNode.title);
      setValue('description', editingNode.description);
      setValue('prompt', editingNode.prompt || '');
    }
  }, [editingNode, setValue]);

  const onSubmit = async (data: FormInputs) => {
    console.group('AddNodeModal - Form Submission');
    console.log('Form Data:', {
      id: editingNode?.id,
      title: data.title,
      description: data.description,
      prompt: data.prompt,
      pageId
    });

    try {
      setIsSubmitting(true);

      if (editingNode) {
        console.log('Editing existing node:', {
          nodeId: editingNode.id,
          currentValues: editingNode,
          newValues: {
            title: data.title.trim(),
            description: data.description.trim(),
            prompt: data.prompt.trim() || undefined,
          }
        });

        await editNode(pageId, editingNode.id, {
          id: editingNode.id,
          ...editingNode,
          title: data.title.trim(),
          description: data.description.trim(),
          prompt: data.prompt.trim() || undefined,
        });
        console.log('Node updated successfully');
        onCloseEdit();
      } else {
        console.log('Creating new node');
        await addNode(pageId, data.title.trim(), data.description.trim(), data.prompt.trim());
        console.log('Node created successfully');
        onClose();
      }

      reset();
    } catch (error) {
      console.error('Error submitting node:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }

    console.groupEnd();
  };

  const handleClose = () => {
    reset();
    if (editingNode) {
      onCloseEdit();
    } else {
      onClose();
    }
  };

  return (
      <Modal
          show={show || !!editingNode}
          onHide={handleClose}
          centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{editingNode ? 'Edit Node' : 'Add New Node'}</Modal.Title>
        </Modal.Header>
        {editingNode && (
            <div className="px-3 pt-3">
              <Form.Group className="mb-3">
                <Form.Label>Node ID</Form.Label>
                <Form.Control
                    type="text"
                    value={editingNode.id}
                    readOnly
                    disabled
                    className="bg-light"
                />
                <Form.Text className="text-muted">
                  This is a unique identifier for the node and cannot be changed.
                </Form.Text>
              </Form.Group>
            </div>
        )}
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                    type="text"
                    {...register("title", {
                      required: "Title is required",
                      minLength: { value: 3, message: "Title must be at least 3 characters" }
                    })}
                    isInvalid={!!errors.title}
                />
                <Button
                    variant="outline-secondary"
                    onClick={handleRandomTitle}
                    type="button"
                    className="d-flex align-items-center"
                    title="Get Random Title"
                >
                  <Type size={16} />
                </Button>
              </div>
              <Form.Control.Feedback type="invalid">
                {errors.title?.message}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                    as="textarea"
                    rows={3}
                    {...register("description", {
                      required: "Description is required",
                      minLength: { value: 10, message: "Description must be at least 10 characters" }
                    })}
                    isInvalid={!!errors.description}
                />
                <Button
                    variant="outline-secondary"
                    onClick={handleRandomDescription}
                    type="button"
                    className="d-flex align-items-center"
                    title="Get Random Description"
                >
                  <FileText size={16} />
                </Button>
              </div>
              <Form.Control.Feedback type="invalid">
                {errors.description?.message}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Scene Duration (seconds)</Form.Label>
              <Form.Control
                  type="number"
                  min="0"
                  step="1"
                  {...register("time", {
                    min: { value: 0, message: "Duration cannot be negative" },
                    valueAsNumber: true
                  })}
                  placeholder="Enter duration in seconds"
              />
              <Form.Text className="text-muted">
                Specify how long this scene should last in seconds
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Narration</Form.Label>
              <Form.Control
                  as="textarea"
                  rows={2}
                  {...register("narration")}
                  placeholder="Enter narration text (optional)"
              />
              <Form.Text className="text-muted">
                Add voice-over or narration text for this node
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image Generation Prompt (Optional)</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                    as="textarea"
                    rows={2}
                    {...register("prompt")}
                    placeholder="Enter a custom prompt for image generation"
                />
                <Button
                    variant="outline-secondary"
                    onClick={handleRandomPrompt}
                    type="button"
                    className="d-flex align-items-center"
                    title="Get Random Prompt"
                >
                  <Shuffle size={16} />
                </Button>
              </div>
              <Form.Text className="text-muted">
                Use random prompt button or enter your own. Leave empty for default product photo.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {editingNode ? 'Updating...' : 'Saving...'}
                  </>
              ) : (
                  editingNode ? 'Update' : 'Save'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
  );
}