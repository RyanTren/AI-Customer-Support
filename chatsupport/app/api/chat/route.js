// import { NextResponse } from 'next/server'; // Import NextResponse from Next.js for handling responses
// import { GoogleGenerativeAI } from '@google/generative-ai'; // Import Google Generative AI library

// const systemPrompt = `
// Welcome to Planr!
// ` // Use your own system prompt here

// // POST function to handle incoming requests
// export async function POST(req) {
//   const genAI = new GoogleGenerativeAI(process.env.API_KEY); // Initialize GoogleGenerativeAI with your API key
  
//   try {
//     const data = await req.json(); // Parse the JSON body of the incoming request
//     console.log('Received data:', data); // Log the received data for debugging

//     // Check if data is an array or an object and handle accordingly
//     const messages = Array.isArray(data) ? data : [{ role: 'user', parts: [{ text: data.message || '' }] }];

//     // Create a chat completion request to the Google Generative AI API
//     const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
//     const chat = model.startChat({
//       history: [
//         {
//           role: 'user',
//           parts: [{ text: systemPrompt }],
//         },
//         {
//           role: 'model',
//           parts: [{ text: 'Great to meet you. How can I assist you today?' }],
//         },
//         ...messages, // Include user messages from the request
//       ],
//       generationConfig: {
//         maxOutputTokens: 100,
//       },
//     });

//     const stream = new ReadableStream({
//       async start(controller) {
//         const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
//         try {
//           // Send the user's message and get the response
//           const result = await chat.sendMessage(data.message || '');
//           const response = await result.response;

//           // Process the streamed chunks of the response
//           for await (const chunk of response) {
//             const content = chunk.text; // Extract the content from the chunk
//             if (content) {
//               const text = encoder.encode(content); // Encode the content to Uint8Array
//               controller.enqueue(text); // Enqueue the encoded text to the stream
//             }
//           }
//         } catch (err) {
//           controller.error(err); // Handle any errors that occur during streaming
//         } finally {
//           controller.close(); // Close the stream when done
//         }
//       },
//     });

//     return new NextResponse(stream); // Return the stream as the response

//   } catch (error) {
//     console.error('Error in POST request:', error); // Log any errors that occur
//     return new NextResponse('Internal Server Error', { status: 500 }); // Return an error response
//   }
// }


import { NextResponse } from 'next/server'; // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai';

const systemPrompt = 
`
Welcome to Planr! 

Planr helps you effortlessly plan and organize hangouts with friends and family. 
Get personalized suggestions, assist with event planning, and coordinate seamlessly with your group. 
Enjoy calendar integration and timely notifications while ensuring top-notch data privacy. 

Let's make your next hangout unforgettable!
`

export async function POST(req) {
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  })
  const data = await req.json()

const completion = await openai.chat.completions.create({
  messages: [
    { role: "system", content: systemPrompt }, ...data
  ],
  model: "openai/gpt-3.5-turbo", // ai model being used
  stream: true, // enables streaming responses
});


const stream = new ReadableStream({
  async start(controller) {
    const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
    try {
      // Iterate over the streamed chunks of the response
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
        if (content) {
          const text = encoder.encode(content); // Encode the content to Uint8Array
          controller.enqueue(text); // Enqueue the encoded text to the stream
        }
      }
    } catch (err) {
      controller.error(err); // Handle any errors that occur during streaming
    } finally {
      controller.close(); // Close the stream when done
    }
  },
});
  return new NextResponse(stream);
}