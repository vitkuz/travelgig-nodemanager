import React from 'react';
import classNames from 'classnames';
import { Button, Card } from 'react-bootstrap';
import { Pencil, Trash2, Image, Clock } from 'lucide-react';
import { Image as LazyImage } from './Image';
import { Node as NodeType, PredictionStatus } from '../types';
import { replicateService } from '../services/replicate';

interface ReplicateResponse {
  predictionId: string;
  status: PredictionStatus;
  output: string[];
}

interface NodeProps {
  node: NodeType;
  index: number;
  onEdit: (node: NodeType) => void;
  onDelete: (nodeId: string) => void;
  editNode: (pageId: string, nodeId: string, node: Partial<NodeType>) => void;
  isGeneratingImage: boolean;
  pageId: string;
  readOnly?: boolean;
}

export function Node({ node, index, onEdit, onDelete, editNode, isGeneratingImage, pageId, readOnly }: NodeProps) {
  const [response, setResponse] = React.useState<ReplicateResponse | null>(null);
  const isPolling = node.predictionStatus === 'starting';

  const handleGenerateImage = async () => {
    try {
      // setResponse({ predictionId: '', status: PredictionStatus.STARTING, output: [] });
      const response = await replicateService.generateImage({
        prompt: node.prompt || `${node.prompt}`,
        numOutputs: 4
      });

      // Extract and rename only the fields we want
      const { id, status, output } = response;
      setResponse({
        predictionId: id,
        status,
        output
      });

      editNode(pageId, node.id, {
        predictionId: id,
        predictionStatus: status
      });

    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  return (
      <Card className={classNames('h-100', {
        'border-success': node.predictionStatus === PredictionStatus.SUCCEEDED,
        'border-warning': node.predictionStatus === PredictionStatus.STARTING,
        'border-danger': node.predictionStatus === PredictionStatus.FAILED
      })}>
        <Card.Header className="d-flex justify-content-end gap-2 bg-white border-0 pt-3 pe-3">
        <span className="position-absolute top-0 start-0 mt-2 ms-2">
          <span className="badge bg-secondary">{index + 1}</span>
        </span>
          {!readOnly && (<>
            <Button
                variant="outline-primary"
                className="d-flex align-items-center p-1"
                onClick={handleGenerateImage}
                disabled={isPolling}
            >
              {isPolling ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Starting...</span>
                  </div>
              ) : (
                  <Image size={16} />
              )}
            </Button>
            <Button
                variant="outline-primary"
                size="sm"
                className="d-flex align-items-center p-1"
                onClick={() => onEdit(node)}
            >
              <Pencil size={16} />
            </Button>
            <Button
                variant="outline-danger"
                size="sm"
                className="d-flex align-items-center p-1"
                onClick={() => onDelete(node.id)}
            >
              <Trash2 size={16} />
            </Button>
          </>)}
        </Card.Header>
        <Card.Body>
          <Card.Title>{node.title}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            ID: {node.id}
            {(node.createdAt || node.updatedAt) && (
                <div className="mt-1 d-flex flex-column gap-1">
                  {node.createdAt && (
                      <small className="d-flex align-items-center gap-1">
                        <Clock size={12} />
                        Created: {new Date(node.createdAt).toLocaleString()}
                      </small>
                  )}
                  {node.updatedAt && node.updatedAt !== node.createdAt && (
                      <small className="d-flex align-items-center gap-1">
                        <Clock size={12} />
                        Updated: {new Date(node.updatedAt).toLocaleString()}
                      </small>
                  )}
                </div>
            )}
          </Card.Subtitle>
          <Card.Text>{node.description}</Card.Text>
          {node.prompt && (
              <Card.Text className="text-muted">
                <small className="d-block mb-2">Prompt: {node.prompt}</small>
              </Card.Text>
          )}
          {node.predictionId && (
              <div className="mb-3">
                <small className="text-muted d-block">Prediction ID: {node.predictionId}</small>
                <small className={`d-block ${node.predictionStatus === PredictionStatus.STARTING ? 'text-primary' : 'text-muted'}`}>
                  Status: {node.predictionStatus}
                </small>
              </div>
          )}
          {node.generatedImages && node.generatedImages.length > 0 && (
              <div className={classNames('mt-3 grid', {
                'grid-cols-2': node.generatedImages.length > 1,
                'grid-cols-1': node.generatedImages.length === 1
              }, 'gap-2')}>
                {node.generatedImages.map((url, index) => (
                    <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={classNames('block transition-all hover:opacity-90', {
                          'col-span-2': node.generatedImages?.length === 1
                        })}
                    >
                      <LazyImage
                          src={url}
                          alt={`Generated ${index + 1}`}
                          className="w-full h-auto rounded hover:opacity-90 transition-opacity"
                      />
                    </a>
                ))}
              </div>
          )}
          {response && (
              <div className="mt-3">
                <div className="bg-light p-3 rounded">
                  {isPolling && (
                      <div className="text-center mb-3">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Polling...</span>
                        </div>
                      </div>
                  )}
                  <pre className="m-0" style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflow: 'auto' }}>
                {JSON.stringify(response, null, 2)}
              </pre>
                </div>
              </div>
          )}
          {isGeneratingImage && (
              <div className="text-center mt-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Generating...</span>
                </div>
              </div>
          )}

          <pre>
            {
              JSON.stringify(node, null, 2)
            }
          </pre>
        </Card.Body>
      </Card>
  );
}