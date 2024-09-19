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
export async function generateActivities(location) {
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
    const responseJson = responseText.replace(/```json\n|\n```/g, '');
    let jsonData;
    try {
      jsonData = JSON.parse(responseJson);
      return jsonData;
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch from google');
  }
}

export async function searchPlaces(query) {
  if (!query) {
    throw new Error('Query is required');
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
          'X-Goog-FieldMask':
            'places.displayName,places.formattedAddress,places.location,places.rating,places.internationalPhoneNumber,places.priceLevel,places.googleMapsUri,places.photos',
        },
      },
    );
    const namePhoto = response.data.places[0].photos[0].name;
    const photoData = await getPhoto(namePhoto);
    const placeWithPhoto = {...response.data.places[0]};
    delete placeWithPhoto.photos;

    placeWithPhoto.photoData = photoData;

    return placeWithPhoto;
  } catch (error) {
    console.error('Error fetching data from Google Places API:', error);
    throw new Error('Internal Server Error');
  }
}

export async function getPhoto(name) {
  if (!name) {
    throw new Error('Name is required');
  }

  try {
    const url = `https://places.googleapis.com/v1/${name}/media?key=${apiKey}&maxHeightPx=200&skipHttpRedirect=true`;
    const response = await axios.get(url);
    return response.data.photoUri;
  } catch (error) {
    console.error('Error fetching data from Google Phto API:', error);
    throw new Error('Failed to fetch photo data');
  }
}

export async function getActivities(req, res) {
  const {location} = req.params;

  if (!location) {
    return res.status(400).json({error: 'Location is required'});
  }

  try {
    const activities = await generateActivities(location);
    const enrichedActivities = await Promise.all(
      activities.map(async activity => {
        const placeData = await searchPlaces(activity.location);
        return {
          ...activity,
          placeData,
        };
      }),
    );

    res.status(200).json(enrichedActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
}
