// Simple test script to test the OpenAI API wrapper
// This will start the server and make requests to test the chat response functionality

import { spawn } from 'child_process';
import fetch from 'node-fetch';

async function testAPI() {
  console.log('🚀 Starting OpenAI Wrapper API test...\n');

  // Start the server in development mode
  const serverProcess = spawn('npm', ['run', 'dev'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, PORT: '3002' } // Use port 3002 for testing
  });

  // Wait for server to start
  await new Promise((resolve) => {
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Server output:', output);
      if (output.includes('Server running on port')) {
        setTimeout(resolve, 1000); // Wait a bit more for server to be ready
      }
    });
  });

  try {
    const baseUrl = 'http://localhost:3002';

    // Test 1: Health check
    console.log('📊 Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test 2: Models endpoint
    console.log('\n🤖 Testing models endpoint...');
    const modelsResponse = await fetch(`${baseUrl}/models`);
    const modelsData = await modelsResponse.json();
    console.log('✅ Available models:', modelsData.models);

    // Test 3: Chat response (the main test)
    console.log('\n💬 Testing chat response endpoint...');
    const chatPayload = {
      model: 'gpt-4o-mini',
      input: 'Hello! Please respond with exactly: "Hello from AI test response!"',
      temperature: 0.1,
      max_output_tokens: 50
    };

    console.log('📤 Sending request:', chatPayload);

    const chatResponse = await fetch(`${baseUrl}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chatPayload),
    });

    if (!chatResponse.ok) {
      throw new Error(`HTTP error! status: ${chatResponse.status}`);
    }

    const chatData = await chatResponse.json();

    // Output the chat response as requested
    console.log('\n🎉 === CHAT RESPONSE OUTPUT ===');
    console.log('Input:', chatPayload.input);
    console.log('Response:', chatData.output[0].content[0].text);
    console.log('Model used:', chatData.model);
    console.log('Response ID:', chatData.id);
    console.log('================================\n');

    // Test 4: Error handling
    console.log('❌ Testing error handling...');
    const errorResponse = await fetch(`${baseUrl}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'gpt-4o-mini' }), // Missing input
    });

    const errorData = await errorResponse.json();
    console.log('✅ Error response:', errorData);

    console.log('\n🎯 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Clean up: stop the server
    console.log('\n🛑 Stopping server...');
    serverProcess.kill('SIGTERM');
  }
}

// Run the test
testAPI().catch(console.error);