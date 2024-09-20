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
  generationConfig: {maxOutputTokens: 3000},
});
export async function generateActivities(location, type) {
  const request = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Generate a JSON with a list of 5 activities for a trip to ${location} with the type of activity is ${type}. In each activity, you will have with a field location (which is the correct name not the address), description and type of place`,
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

    // console.log('le resultat', response.data.places[0].photos[0].name);

    const placeData = response.data.places[0];

    if (placeData.photos && placeData.photos.length > 0) {
      const firstPhoto = placeData.photos[0];
      const photoData = await getPhoto(firstPhoto.name);
      placeData.photoData = photoData; // Ajouter uniquement la première photo
    }

    // Supprimez le champ 'photos' pour ne garder que les données nécessaires
    delete placeData.photos;

    return placeData;
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
  const {location, type} = req.params;

  if (!location || !type) {
    return res.status(400).json({error: 'Location and type are required'});
  }

  try {
    const activities = await generateActivities(location, type);
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
export async function generateActivitiesForItinerary(
  location,
  startDate,
  endDate,
  nbPerson,
  groupType,
  dietType,
) {
  const request = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Generate a valid JSON object that contains a list of 5 activities per day (with their location, starting time, and ending time) for a trip to ${location} from ${startDate} to ${endDate}. There will be ${nbPerson} person(s), the group is of type ${groupType} and the diet regime is of type ${dietType}. Each day should be a key (in 'yyyy-mm-dd' format), and the value should be a list of activities. 

Each activity should include the following fields:
- "name": a string representing the name of the activity's location
- "startTime": the starting time in 24-hour format ('HH:mm')
- "endTime": the ending time in 24-hour format ('HH:mm')

Make sure the JSON is properly formatted with commas between each activity and key-value pairs. The response must be the JSON object and nothing else, no text. Make sure that EACH day has FIVE activities`,
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

    // Nettoyer et parser la réponse en JSON
    const jsonString = responseText.match(/\{.*\}/s); // Extraction du JSON

    if (!jsonString) {
      throw new Error('Invalid JSON format');
    }

    const jsonData = JSON.parse(jsonString[0]); // Parser le JSON extrait

    return jsonData; // Retourner uniquement le JSON
  } catch (error) {
    console.error('Error fetching from Google:', error);
    throw new Error('Failed to fetch from Google');
  }
}

// Fonction pour formater la date au format yyyy-mm-dd
function formatDateToYYYYMMDD(dateString) {
  const date = new Date(dateString); // Créer un objet Date à partir de la chaîne de date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Ajouter un zéro si nécessaire
  const day = String(date.getDate()).padStart(2, '0'); // Ajouter un zéro si nécessaire
  return `${year}-${month}-${day}`;
}

// Fonction pour enrichir l'itinéraire avec des détails sur les lieux (y compris la photo)
export async function enrichItineraryWithPlaceDetails(req, res) {
  const {location} = req.params;
  const {startDate, endDate, nbPerson, groupType, dietType} = req.query;

  // Validation des dates
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Vérification que endDate n'est pas inférieur à startDate
  if (end < start) {
    return res
      .status(400)
      .json({error: 'endDate cannot be earlier than startDate'});
  }

  // Vérification que la différence entre endDate et startDate ne dépasse pas 10 jours
  const differenceInTime = end - start;
  const differenceInDays = differenceInTime / (1000 * 3600 * 24); // Convertir la différence en jours

  if (differenceInDays > 10) {
    return res.status(400).json({
      error:
        'The difference between startDate and endDate cannot exceed 10 days',
    });
  }

  try {
    // Récupérer l'itinéraire généré par generateActivitiesForItinerary
    const activitiesByDate = await generateActivitiesForItinerary(
      location,
      startDate,
      endDate,
      nbPerson,
      groupType,
      dietType,
    );

    // Vérifier la structure des données
    if (!activitiesByDate || typeof activitiesByDate !== 'object') {
      return res.status(500).json({error: 'Invalid itinerary data format'});
    }

    // Initialiser une liste pour stocker toutes les activités avec la date incluse
    let allActivities = [];

    // Parcourir chaque jour de l'itinéraire
    for (const date in activitiesByDate) {
      const formattedDate = formatDateToYYYYMMDD(date); // Formater la date

      // Vérifier si activitiesByDate[date] est un tableau
      const activitiesForDay = activitiesByDate[date];

      if (!Array.isArray(activitiesForDay)) {
        console.error(
          `Expected array but got ${activitiesForDay} for date: ${date}`,
        );
        continue; // Ignorer cette date si ce n'est pas un tableau
      }

      // Pour chaque activité d'un jour donné
      const enrichedActivities = await Promise.all(
        activitiesForDay.map(async activity => {
          try {
            // Utiliser searchPlaces pour obtenir les détails du lieu
            const placeDetails = await searchPlaces(activity.name);

            // Créer un champ "startTime" et "endTime" au format PostgreSQL 'YYYY-MM-DD HH:MM:SS'
            const startTimestamp = `${formattedDate} ${activity.startTime}:00`;
            const endTimestamp = `${formattedDate} ${activity.endTime}:00`;

            // Ajouter les détails du lieu et la photo
            return {
              name: placeDetails.displayName.text,
              date: formattedDate, // Ajouter la date au format yyyy-mm-dd
              startTime: startTimestamp, // Format PostgreSQL 'YYYY-MM-DD HH:MM:SS'
              endTime: endTimestamp, // Format PostgreSQL 'YYYY-MM-DD HH:MM:SS'
              adresse: placeDetails.formattedAddress, // Ajouter les détails du lieu à l'activité
              lat: placeDetails.location.latitude,
              long: placeDetails.location.longitude,
              phoneNumber: placeDetails.internationalPhoneNumber,
              url: placeDetails.googleMapsUri,
              image: placeDetails.photoData, // Ajouter la photo (URL)
            };
          } catch (error) {
            console.error(
              `Erreur lors de la recherche de l'endroit pour ${activity.name}:`,
              error,
            );
            // En cas d'erreur, retourner l'activité d'origine sans détails supplémentaires
            return {
              date: formattedDate, // Ajouter la date même en cas d'erreur
              ...activity,
              startTime: `${formattedDate} ${activity.startTime}:00`, // Ajout du formatage en cas d'erreur
              endTime: `${formattedDate} ${activity.endTime}:00`,
            };
          }
        }),
      );

      // Ajouter les activités enrichies à la liste globale
      allActivities = [...allActivities, ...enrichedActivities];
    }

    // Envoyer la réponse JSON avec la liste d'activités
    return res.json(allActivities);
  } catch (error) {
    console.error('Error enriching itinerary with place details:', error);
    return res.status(500).json({error: 'Failed to enrich itinerary'});
  }
}
