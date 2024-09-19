import {
  HarmBlockThreshold,
  HarmCategory,
  VertexAI,
} from '@google-cloud/vertexai';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();
const project = process.env.PROJECT;
const location = process.env.LOCATION;
const apiKey = process.env.API_KEY;
const endpoint = `https://places.googleapis.com/v1/places:searchText`;

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

export async function searchPlaces(req, res) {
  const {query} = req.body;

  if (!query) {
    return res.status(400).json({error: 'Query is required'});
  }

  try {
    const response = await axios.post(
      endpoint,
      {
        textQuery: query,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': '*',
        },
      },
    );

    return res.status(200).json(response.data.places[0]);
  } catch (error) {
    console.error('Error fetching data from Google Places API:', error);
    return res.status(500).json({error: 'Internal Server Error'});
  }
}

export async function getPhoto(req, res) {
  const {name} = req.params;
  console.log('test : ', name);
  if (!name) {
    return res.status(400).json({error: 'Name is required'});
  }

  try {
    const url = `https://places.googleapis.com/v1/${encodeURIComponent(name)}/media?key=${apiKey}&max_height_px=100`;
    const response = await axios.get(url);
    console.log('test :', response);
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching data from Google Phto API:', error);
    return res.status(500).json({error: 'Internal Server Error'});
  }
}