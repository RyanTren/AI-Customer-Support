import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `
Welcome to Planr! 

Planr helps you effortlessly plan and organize hangouts with friends and family. 
Get personalized suggestions, assist with event planning, and coordinate seamlessly with your group. 
Enjoy calendar integration and timely notifications while ensuring top-notch data privacy. 

Let's make your next hangout unforgettable!
`;

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI(); // Create a new instance of the OpenAI client
  // const data = await req.json(); // Parse the JSON body of the incoming request
  
  let data;
  
  try {
    data = await req.json(); // Parse the JSON body of the incoming request
    console.log(data); // Log the incoming messages for debugging
  } catch (err) {
    console.error("Failed to parse request body", err);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!Array.isArray(data)) {
    console.error("Data is not an array", data);
    return NextResponse.json({ error: 'Data must be an array' }, { status: 400 });
  }

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is a LLM?"}
      ],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]);
  return NextResponse.json({message: 'Hello from the server!'});

  // Create a ReadableStream to handle the streaming response
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

  return new NextResponse(stream); // Return the stream as the response
}