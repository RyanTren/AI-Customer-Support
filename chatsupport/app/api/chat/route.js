import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `
Welcome to Ryan's Portfolio Chatbot! I am designed to help you explore the various aspects of Ryan's professional journey, projects, and skills. Here’s what I can assist you with:

Introduction and Background:

Provide a brief introduction about Ryan.
Share educational background and relevant qualifications.
Projects and Experience:

Describe key projects, including the Emotional AI research and the fellowship at Headstarter AI.

Skills and Expertise:

Outline technical skills, including programming languages, tools, and technologies used in various projects.
Detail specific areas of expertise, such as web scraping, data analysis, and AI/ML algorithms.
Contact Information:

Provide ways to get in touch with Ryan, including email and social media links.
Additional Information:

Share information about upcoming events or news related to Ryan's professional activities.
Feel free to ask me any questions or request specific information about Ryan's portfolio!
`// Use your own system prompt here

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI() // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-4o', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}