// Track searches made by the user
// Adds +1 to search if exists
// If doesn't exists, creates a document in the database with a search count of 1

import {Client, Databases, ID, Query} from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;

const client = new Client()
   .setEndpoint('https://cloud.appwrite.io/v1')
   .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)

const database = new Databases(client);

export const updateSearchCount = async (query: string, movie: Movie) => {
   try {
      const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
         Query.equal('searchTerm', query)
      ])

      if(result.documents.length > 0) {
         const existingMovie = result.documents[0];

         await database.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            existingMovie.$id,
            {
               count: existingMovie.count + 1,
            }
         )

         console.log(`View count incremented. Total view count: ${existingMovie.count + 1}.`)
      } else {
         await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
            searchTerm: query,
            movie_id: movie.id,
            count: 1,
            title: movie.title,
            poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
         })
         console.log(`Created new search record for "${query}" - Movie: "${movie.title}"`);
      }
   } catch (err) {
      console.log(err);
      throw err;
   }
}

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
   // Note: Notice how typescript wants a defined return type
   try {
      const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
         Query.limit(5),
         Query.orderDesc('count'),
      ])

      return result.documents as unknown as TrendingMovie[];
      // How does this line work?
   } catch (err) {
      console.log(err)
      return undefined
   }
}