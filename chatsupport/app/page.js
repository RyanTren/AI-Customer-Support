'use client'

import * as React from 'react';
import { useState, useEffect, useRef } from 'react'

import './page.css';

import { AppBar, Box, Button, Stack, TextField } from '@mui/material'
import { createTheme } from '@mui/material/styles';
import AccountCircle from '@mui/icons-material/AccountCircle';
import InputAdornment from '@mui/material/InputAdornment';


const theme = createTheme({
  palette: {
    primary: {
      light: '#65A863',
      main: '#50AF4D',
      dark: '#31A72F',
      contrastText: '#F9F7EF',
    },
    secondary: {
      light: '#d4c8a1',
      main: '#ada178',
      dark: '#91886a',
      contrastText: '#F9F7EF',
    },
  },
});

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Welcome to Hangu.ai, your hangout planner, how can we assist you today?",
    },
  ])
  const [message, setMessage] = useState('')

  const sendMessage = async () => {
    if (!message.trim()) return;  // Don't send empty messages

    // Function to check if a string contains only ASCII characters
    const isAscii = (str) => /^[\x00-\x7F]*$/.test(str);

    // Check if the message contains only ASCII characters
    if (!isAscii(message)) {
      console.error('Error: Only ASCII characters are allowed.');
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "Error: Only ASCII characters are allowed." },
      ]);
      setMessage(''); //Clears the input field to get rid of non-ASCII characters
      return;
    }

    // Count the number of unique users
    const userRoles = messages.filter((msg) => msg.role === 'user');
    const uniqueUsers = new Set(userRoles.map((msg) => msg.userId)).size;
    

    // Check if there are already two users
    if (uniqueUsers >= 2) {
      console.error('Error: Only two users are allowed.');
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "Error: Only two users are allowed." },
      ]);
      return;
    }

    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      // // Added conditional responses based on user input
      if (message.toLowerCase().includes('membership') || message.toLowerCase().includes('pricing')) {
        setMessages((messages) => [
          ...messages,
          {
            role: 'assistant',
            content: `Here are the membership options available on our platform:
    
          1. **Basic Membership** - $0/month
            - Access to basic features
            - Email support
            - Monthly newsletters
            - Access to basic event planning
          
          2. Premium Membership - $15/month
            - Access to all features
            - Priority email support
            - Weekly newsletters
            - Access to exclusive event planning
          
          3. VIP Membership - $35/month
            - Access to all features
            - 24/7 priority support
            - Daily newsletters
            - Access to exclusive content
            - Personalized event planning assistance with locations, activities, and more
          
          If you have any further questions or need assistance with something else, feel free to ask!`,
          },
        ]);
      }

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
  }

  return (      
    <Box>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <h1 sx={{bgcolor:theme.palette.primary.main, color:theme.palette.primary.light}} spacing={3} gap={3}>Chat with us in real time!</h1>

        <Stack
        sx = {{
          boxShadow: 3,
          borderRadius: 4,
        }}
          direction={'column'}
          width="500px"
          height="700px"
          p={2}
          spacing={3}
        >
          <Stack
            // direction={'column'}
            // spacing={2}
            // flexGrow={1}
            // overflow="auto"
            // maxHeight="100%"
            className="scrollable"
            direction={'column'}
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
              >
                <Box
                  bgcolor={
                    message.role === 'assistant'
                      ? theme.palette.primary.light
                      : theme.palette.secondary.main
                  }
                  sx={{
                    borderRadius: 4,
                    color: theme.palette.primary.contrastText,
                  }}
                  color="white"
                  p={2}
                >
                  {message.content}
                </Box>
              </Box>
            ))}
          </Stack>
          <Stack direction={'row'} spacing={1}>
            <TextField
              sx={{
                backgroundColor: theme.palette.primary.contrastText,
                color: theme.palette.primary.contrastText,
                border: '1px solid theme.palette.primary.main',
                '&:hover': {
                  border: '1px solid theme.palette.primary.main',
                },
                '&.Mui-focused': {
                  border: '1px solid #3f51b5',
                },
                borderRadius: 6,
              }}

              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle />
                  </InputAdornment>
                ),
              }}

              id="outlined-basic" 
              variant="outlined"
              label="Message Hangu.ai"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              color="success"
            />

            <Button 
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
                color: theme.palette.primary.contrastText,
                fontSize: 25,
                borderRadius: 2,
              }}

              variant="contained" 
              onClick={sendMessage}
            >
            ↵
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>

  )
}
