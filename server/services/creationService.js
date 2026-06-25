import { generateWithAi } from './aiService.js';
import { generateByTemplate, validateCreationInput } from '../utils/templateGenerator.js';

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getGenerationMode() {
  return process.env.GENERATION_MODE === 'ai' ? 'ai' : 'template';
}

export async function generateCreationPlan(input) {
  const validation = validateCreationInput(input);
  if (!validation.valid) {
    throw createHttpError(400, validation.errors.join('；'));
  }

  const normalizedInput = validation.value;
  const mode = getGenerationMode();

  if (mode === 'template') {
    return {
      generationMode: 'template',
      data: generateByTemplate(normalizedInput)
    };
  }

  try {
    return {
      generationMode: 'ai',
      data: await generateWithAi(normalizedInput)
    };
  } catch (error) {
    console.warn(`AI generation failed, fallback to template: ${error.message}`);
    return {
      generationMode: 'fallback_template',
      data: generateByTemplate(normalizedInput)
    };
  }
}
