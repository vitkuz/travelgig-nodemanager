import { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { usePages } from '../context/PageContext';

interface FormInputs {
  title: string;
}

interface AddPageModalProps {
  show: boolean;
  onClose: () => void;
}

export function AddPageModal({ show, onClose }: AddPageModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>();
  const { addPage } = usePages();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: FormInputs) => {
    try {
      setIsSubmitting(true);
      const newPage = await addPage(data.title.trim());
      reset();
      onClose();
      navigate(`/page/${newPage.id}`);
    } catch (error) {
      console.error('Error creating page:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        reset();
        onClose();
      }}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Add New Page</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Page Title</Form.Label>
            <Form.Control
              type="text"
              {...register("title", {
                required: "Title is required",
                minLength: { value: 3, message: "Title must be at least 3 characters" }
              })}
              isInvalid={!!errors.title}
            />
            <Form.Control.Feedback type="invalid">
              {errors.title?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating...
              </>
            ) : 'Save'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}