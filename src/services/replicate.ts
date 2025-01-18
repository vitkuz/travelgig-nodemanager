import axios from 'axios';

const REPLICATE_API_URL = 'https://j9y3r5j656.execute-api.us-east-1.amazonaws.com/prod/';
const MODEL_VERSION = '70a95a700a394552368f765fee2e22aa77d6addb933ba3ad914683c5e11940e1';

interface GenerateImageInput {
  prompt: string;
  numOutputs?: number;
}

const defaultConfig = {
  model: "dev",
  go_fast: false,
  lora_scale: 1,
  megapixels: "1",
  aspect_ratio: "1:1",
  output_format: "jpg",
  guidance_scale: 3,
  output_quality: 80,
  prompt_strength: 0.8,
  extra_lora_scale: 1,
  num_inference_steps: 28
};

export const replicateService = {
  generateImage: async ({ prompt, numOutputs = 1 }: GenerateImageInput) => {
    const response = await axios.post(REPLICATE_API_URL, {
      version: MODEL_VERSION,
      input: {
        ...defaultConfig,
        prompt,
        num_outputs: numOutputs
      }
    });

    const { id, status, output } = response.data;
    return { id, status, output };
  },

  getPrediction: async (predictionId: string) => {
    const response = await axios.get(`${REPLICATE_API_URL}?predictionId=${predictionId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const { id, status, output } = response.data;
    return { id, status, output };
  }
};