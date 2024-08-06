'use client'

import * as React from 'react';
import { useState } from 'react'

import ResponsiveAppBar from './appbar';
import './page.css';

import { Box, Button, Stack, TextField } from '@mui/material'
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
      light: '#F3BA58',
      main: '#F3B13D',
      dark: '#EB9C13',
      contrastText: '#F9F7EF',
    },
  },
});

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Welcome to Planr, your hangout planner, how can we assist you today?",
    },
  ])
  const [message, setMessage] = useState('')

  const sendMessage = async () => {
    // if (!message.trim()) return; // Don't send empty messages

    // setMessage('')
    // setMessages((messages) => [
    //   ...messages,
    //   { role: 'user', content: message },
    //   { role: 'assistant', content: '' },
    // ])

    // try {
    //   const response = await fetch("https://openrouter.ai/api/v1", {
    //     method: "POST",
    //     headers: {
    //       "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       "model": "openai/gpt-3.5-turbo",
    //       "messages": [
    //         ...messages,
    //         { role: "user", content: message }
    //       ],
    //     })
    //   })

    //   if (!response.ok) {
    //     throw new Error('Network response was not ok')
    //   }

    //   const reader = response.body.getReader()
    //   const decoder = new TextDecoder()

    //   while (true) {
    //     const { done, value } = await reader.read()
    //     if (done) break
    //     const text = decoder.decode(value, { stream: true })
    //     setMessages((messages) => {
    //       let lastMessage = messages[messages.length - 1]
    //       let otherMessages = messages.slice(0, messages.length - 1)
    //       return [
    //         ...otherMessages,
    //         { ...lastMessage, content: lastMessage.content + text },
    //       ]
    //     })
    //   }
    // } catch (error) {
    //   console.error('Error:', error)
    //   setMessages((messages) => [
    //     ...messages,
    //     { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
    //   ])
    // }

    if (!message.trim()) return;  // Don't send empty messages

    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

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
      {/* <ResponsiveAppBar /> */}

      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        

        <Stack
        sx = {{
          boxShadow: 3,
        }}
          direction={'column'}
          width="500px"
          height="700px"
          borderRadius={4}
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
                      : theme.palette.secondary.light
                  }
                  color="white"
                  borderRadius={6}
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
                  border: '1px solid #3f51b5', // Change this to the desired border color when focused
                },
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
              label="Message Planr"
              borderRadius={6}
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              color="success"
            />

            <Button 
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark, // Change this to the desired hover color
                },
                color: theme.palette.primary.contrastText,
                fontSize: 25,
              }}
              borderRadius={2}
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
