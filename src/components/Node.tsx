import React from 'react';
import classNames from 'classnames';
import { Button, Card } from 'react-bootstrap';
import { Pencil, Trash2, Image, Clock, Info, MessageSquare, Sparkles } from 'lucide-react';
import { Image as LazyImage } from './Image';
import { Node as NodeType, PredictionStatus } from '../types';
import { replicateService } from '../services/replicate';
// import { usePolling } from '../hooks/usePolling';

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
  // const { startPolling, isPolling } = usePolling();
  // const [isUpdating, setIsUpdating] = React.useState(false);

  const isPolling = node.predictionStatus === 'starting';

  React.useEffect(() => {
    // Only start polling if we have a predictionId and status is not succeeded
    // if (node.predictionId && node.predictionStatus !== PredictionStatus.SUCCEEDED) {
    //   startPolling(node.predictionId, {
    //     onSuccess: async (pollResponse) => {
    //       setResponse({
    //         predictionId: node.predictionId!,
    //         status: pollResponse.status,
    //         output: pollResponse.output
    //       });
    //
    //       try {
    //         setIsUpdating(true);
    //         editNode(pageId, node.id, {
    //           generatedImages: [...(node.generatedImages || []), ...pollResponse.output],
    //           predictionStatus: pollResponse.status
    //         });
    //       } catch (error) {
    //         console.error('Error updating node:', error);
    //       } finally {
    //         setIsUpdating(false);
    //       }
    //     },
    //     onError: async (error) => {
    //       console.error('Polling error:', error);
    //       try {
    //         setIsUpdating(true);
    //         editNode(pageId, node.id, {
    //           predictionStatus: PredictionStatus.FAILED
    //         });
    //       } catch (error) {
    //         console.error('Error updating node status:', error);
    //       } finally {
    //         setIsUpdating(false);
    //       }
    //     }
    //   });
    // }
  }, [node.predictionId, node.predictionStatus]);

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

      // Start polling if we have a prediction ID
      // if (id) {
      //   startPolling(id, {
      //     onSuccess: async (pollResponse) => {
      //       setResponse({
      //         predictionId: id,
      //         status: pollResponse.status,
      //         output: pollResponse.output,
      //       });
      //
      //       try {
      //         setIsUpdating(true);
      //         editNode(pageId, node.id, {
      //           generatedImages: [...(node.generatedImages || []), ...pollResponse.output],
      //           predictionStatus: pollResponse.status
      //         });
      //       } catch (error) {
      //         console.error('Error updating node:', error);
      //       } finally {
      //         setIsUpdating(false);
      //       }
      //     },
      //     onError: (error) => {
      //       console.error('Polling error:', error);
      //       setResponse(prev => prev ? {
      //         ...prev,
      //         status: 'failed'
      //       } : null);
      //     }
      //   });
      // }

      // if (response.output) {
      //   try {
      //     setIsUpdating(true);
      //     editNode(pageId, node.id, {
      //       generatedImages: [...(node.generatedImages || []), ...response.output],
      //       predictionStatus: response.status
      //     });
      //   } catch (error) {
      //     console.error('Error updating node:', error);
      //   } finally {
      //     setIsUpdating(false);
      //   }
      // }
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  return (
      <Card className={classNames('h-100', {
        'border-success': node.predictionStatus === PredictionStatus.SUCCEEDED,
        'border-primary': node.predictionStatus === PredictionStatus.STARTING,
        'border-danger': node.predictionStatus === PredictionStatus.FAILED,
        'shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1': true
      })}>
        <Card.Header className="d-flex justify-content-between align-items-center bg-white border-0 pt-3 px-3">
        <span className="position-absolute top-0 start-0 mt-2 ms-2">
          <span className="badge bg-primary bg-opacity-10 text-primary fw-normal px-2 py-1">#{index + 1}</span>
        </span>
          {!readOnly && (
              <div className="d-flex gap-2 ms-auto">
                <Button
                    variant="light"
                    className="d-flex align-items-center p-1 rounded-circle"
                    onClick={handleGenerateImage}
                    disabled={isPolling}
                    title="Generate images"
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
                    variant="light"
                    className="d-flex align-items-center p-1 rounded-circle"
                    onClick={() => onEdit(node)}
                    title="Edit node"
                >
                  <Pencil size={16} />
                </Button>
                <Button
                    variant="light"
                    className="d-flex align-items-center p-1 rounded-circle text-danger"
                    onClick={() => onDelete(node.id)}
                    title="Delete node"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
          )}
        </Card.Header>
        <Card.Body className="d-flex flex-column gap-3">
          <div>
            <Card.Title className="mb-1 d-flex align-items-center gap-2">
              {node.title}
              {node.predictionStatus === PredictionStatus.SUCCEEDED && (
                  <Sparkles size={16} className="text-success" />
              )}
            </Card.Title>
            <div className="d-flex align-items-center gap-2 text-muted small">
              <Info size={12} />
              <span>ID: {node.id}</span>
            </div>
            {(node.createdAt || node.updatedAt) && (
                <div className="mt-2 d-flex flex-column gap-1">
                  {node.createdAt && (
                      <small className="d-flex align-items-center gap-1 text-muted">
                        <Clock size={12} />
                        Created: {new Date(node.createdAt).toLocaleString()}
                      </small>
                  )}
                  {node.updatedAt && node.updatedAt !== node.createdAt && (
                      <small className="d-flex align-items-center gap-1 text-muted">
                        <Clock size={12} />
                        Updated: {new Date(node.updatedAt).toLocaleString()}
                      </small>
                  )}
                </div>
            )}
          </div>

          <Card.Text className="mb-0">
            <div className="d-flex align-items-start gap-2">
              <MessageSquare size={16} className="text-muted flex-shrink-0 mt-1" />
              <span>{node.description}</span>
            </div>
          </Card.Text>

          {node.prompt && (
              <div className="bg-light rounded p-3">
                <div className="d-flex align-items-start gap-2">
                  <Sparkles size={16} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-primary fw-medium mb-1">Image Generation Prompt</div>
                    <div className="text-muted small">{node.prompt}</div>
                  </div>
                </div>
              </div>
          )}

          {node.predictionId && (
              <div className="bg-light rounded p-3">
                <div className="d-flex flex-column gap-1">
                  <small className="text-muted">Prediction ID: {node.predictionId}</small>
                  <small className={classNames('fw-medium', {
                    'text-primary': node.predictionStatus === PredictionStatus.STARTING,
                    'text-success': node.predictionStatus === PredictionStatus.SUCCEEDED,
                    'text-danger': node.predictionStatus === PredictionStatus.FAILED
                  })}>
                    Status: {node.predictionStatus}
                  </small>
                </div>
              </div>
          )}

          {node.generatedImages && node.generatedImages.length > 0 && (
              <div className={classNames('grid', {
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
              <div>
                <div className="bg-light p-3 rounded border">
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
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Generating...</span>
                </div>
              </div>
          )}
        </Card.Body>
      </Card>
  );
}