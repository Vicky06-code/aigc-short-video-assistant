import { generateByTemplate, validateCreationInput } from '../utils/templateGenerator.js';

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function generateCreationPlan(input) {
  const validation = validateCreationInput(input);
  if (!validation.valid) {
    throw createHttpError(400, validation.errors.join('；'));
  }

  // The service boundary is kept async so a real DeepSeek/OpenAI API adapter can
  // replace template generation here without changing routes or controllers.
  return generateByTemplate(validation.value);
}
