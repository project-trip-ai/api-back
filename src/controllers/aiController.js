import {
  HarmBlockThreshold,
  HarmCategory,
  VertexAI,
} from '@google-cloud/vertexai';
import dotenv from 'dotenv';
dotenv.config();
const project = process.env.PROJECT;
const location = process.env.LOCATION;

const vertexAI = new VertexAI({
  project: project,
  location: location,
});

const textModel = 'gemini-1.0-pro-002';
const generativeModel = vertexAI.getGenerativeModel({
  model: textModel,
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
  generationConfig: {maxOutputTokens: 600},
});
export async function generateActivities(req, res) {
  const {location} = req.params;
  const request = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Generate a JSON with a list of 5 activities for a trip to ${location}. In each activity, you will have with a field location (which is the correct name not the address), description and type of place`,
          },
        ],
      },
    ],
  };
  try {
    const streamingResult =
      await generativeModel.generateContentStream(request);
    const aggregatedResponse = await streamingResult.response;
    const responseText = aggregatedResponse.candidates[0].content.parts[0].text;
    const responseJson = responseText
      .replace(/```json\n/g, '')
      .replace(/```/g, '');
    res.send(responseJson);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Failed to fetch from google'});
  }
}
