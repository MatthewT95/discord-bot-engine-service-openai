import { spawn } from 'child_process';
import fetch from 'node-fetch';

async function testAPI() {
  console.log('🚀 Starting OpenAI Wrapper API test...\n');

  // Start the server in development mode
  const serverProcess = spawn('npm', ['run', 'dev'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, PORT: '4001' } // Use port 4001 for testing
  });

  let shuttingDown = false;
  const shutdownServer = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    if (signal) {
      console.log(`\n🛑 Stopping server (${signal})...`);
    } else {
      console.log('\n🛑 Stopping server...');
    }
    serverProcess.kill('SIGTERM');
    setTimeout(() => {
      if (!serverProcess.killed) {
        serverProcess.kill('SIGKILL');
      }
    }, 2000);
  };

  const exitHandler = (signal) => {
    shutdownServer(signal);
    setTimeout(() => {
      process.exit(0);
    }, 500);
  };

  process.once('SIGINT', exitHandler);
  process.once('SIGTERM', exitHandler);
  process.once('SIGHUP', exitHandler);
  process.once('exit', () => shutdownServer());
  process.once('uncaughtException', (err) => {
    console.error('❌ Uncaught exception:', err);
    exitHandler('uncaughtException');
  });
  process.once('unhandledRejection', (err) => {
    console.error('❌ Unhandled rejection:', err);
    exitHandler('unhandledRejection');
  });

  serverProcess.on('close', (code, signal) => {
    if (!shuttingDown) {
      console.log(`\n🛑 Server exited (code: ${code}, signal: ${signal || 'none'})`);
      process.exit(code ?? 0);
    }
  });

  let serverReady = false;

  // Wait for server to start
  await new Promise((resolve) => {
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Server output:', output.trim());
      if (output.includes('Server running on port') && !serverReady) {
        serverReady = true;
        setTimeout(resolve, 2000); // Wait a bit more for server to be fully ready
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });
  });

  try {
    const baseUrl = 'http://localhost:4001';

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

    console.log('📤 Sending request:', JSON.stringify(chatPayload, null, 2));

    const chatResponse = await fetch(`${baseUrl}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chatPayload),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      throw new Error(`HTTP error! status: ${chatResponse.status}, body: ${errorText}`);
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
      body: JSON.stringify({ model: 'gpt-5' }), // Missing input
    });

    const errorData = await errorResponse.json();
    console.log('✅ Error response:', errorData);

    console.log('\n🎯 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Clean up: stop the server
    shutdownServer();

    // Give it a moment to shut down gracefully
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }
}

// Run the test
testAPI().catch(console.error);