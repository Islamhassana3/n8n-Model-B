#!/usr/bin/env node

import express from 'express';
import { randomUUID } from 'node:crypto';
import cors from 'cors';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from "zod";
import axios from "axios";

// Configuration
const N8N_HOST = process.env.N8N_HOST || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const COPILOT_INTEGRATION = process.env.COPILOT_INTEGRATION === 'true';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 1937;

console.error("N8N Workflow Builder HTTP Server with Copilot Integration");
console.error("N8N API Configuration:");
console.error("Host:", N8N_HOST);
console.error("API Key:", N8N_API_KEY ? `${N8N_API_KEY.substring(0, 4)}****` : 'Not set');
console.error("OpenAI Key:", OPENAI_API_KEY ? `${OPENAI_API_KEY.substring(0, 4)}****` : 'Not set');
console.error("Copilot Integration:", COPILOT_INTEGRATION);
console.error("Port:", PORT);

// Create axios instances
const n8nApi = axios.create({
  baseURL: N8N_HOST,
  headers: {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Type': 'application/json'
  }
});

const openaiApi = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Factory function to create a new server instance with Copilot tools
const createServer = () => {
  const server = new McpServer({
    name: "n8n-workflow-builder-copilot",
    version: "0.11.0"
  });

  // Core workflow management tools (existing functionality)
  server.tool(
    "list_workflows",
    "List all workflows from n8n instance",
    {},
    async () => {
      try {
        const response = await n8nApi.get('/workflows');
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // AI-powered workflow generation tool
  server.tool(
    "generate_workflow_with_ai",
    "Generate a workflow using AI/Copilot based on natural language description",
    {
      description: z.string().describe("Natural language description of the workflow to create"),
      complexity: z.enum(["simple", "moderate", "complex"]).optional().describe("Complexity level of the workflow"),
      includeErrorHandling: z.boolean().optional().describe("Whether to include error handling nodes")
    },
    async ({ description, complexity = "moderate", includeErrorHandling = true }) => {
      try {
        if (!OPENAI_API_KEY) {
          throw new Error("OpenAI API key not configured");
        }

        const prompt = `Generate an n8n workflow configuration based on this description: "${description}"
        
Complexity: ${complexity}
Include error handling: ${includeErrorHandling}

Please respond with a valid n8n workflow JSON that includes:
1. Appropriate trigger nodes
2. Processing nodes
3. ${includeErrorHandling ? 'Error handling nodes' : ''}
4. Proper node connections
5. Realistic node configurations

The workflow should be functional and follow n8n best practices.`;

        const aiResponse = await openaiApi.post('/chat/completions', {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert n8n workflow designer. Generate valid n8n workflow JSON configurations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        });

        const generatedWorkflow = aiResponse.data.choices[0].message.content;

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              description: `AI-generated workflow for: ${description}`,
              workflow: generatedWorkflow,
              metadata: {
                complexity,
                includeErrorHandling,
                generatedAt: new Date().toISOString()
              }
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // AI workflow optimization tool
  server.tool(
    "optimize_workflow_with_ai",
    "Analyze and optimize an existing workflow using AI suggestions",
    {
      workflowId: z.string().describe("ID of the workflow to optimize"),
      optimizationGoals: z.array(z.enum(["performance", "reliability", "maintainability", "cost"])).describe("Goals for optimization")
    },
    async ({ workflowId, optimizationGoals }) => {
      try {
        if (!OPENAI_API_KEY) {
          throw new Error("OpenAI API key not configured");
        }

        // Get current workflow
        const workflowResponse = await n8nApi.get(`/workflows/${workflowId}`);
        const currentWorkflow = workflowResponse.data;

        const prompt = `Analyze this n8n workflow and suggest optimizations:

${JSON.stringify(currentWorkflow, null, 2)}

Optimization goals: ${optimizationGoals.join(', ')}

Please provide:
1. Current workflow analysis
2. Identified issues or inefficiencies
3. Specific optimization recommendations
4. Implementation steps
5. Expected benefits`;

        const aiResponse = await openaiApi.post('/chat/completions', {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert n8n workflow optimizer. Analyze workflows and provide detailed optimization recommendations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1500
        });

        const optimizationSuggestions = aiResponse.data.choices[0].message.content;

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              workflowId,
              optimizationGoals,
              currentWorkflow: {
                name: currentWorkflow.name,
                nodeCount: currentWorkflow.nodes?.length || 0,
                connectionCount: Object.keys(currentWorkflow.connections || {}).length
              },
              suggestions: optimizationSuggestions,
              analyzedAt: new Date().toISOString()
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // AI-powered workflow documentation generator
  server.tool(
    "generate_workflow_documentation",
    "Generate comprehensive documentation for a workflow using AI",
    {
      workflowId: z.string().describe("ID of the workflow to document"),
      includeUseCases: z.boolean().optional().describe("Include use case examples"),
      includeTroubleshooting: z.boolean().optional().describe("Include troubleshooting guide")
    },
    async ({ workflowId, includeUseCases = true, includeTroubleshooting = true }) => {
      try {
        if (!OPENAI_API_KEY) {
          throw new Error("OpenAI API key not configured");
        }

        // Get workflow details
        const workflowResponse = await n8nApi.get(`/workflows/${workflowId}`);
        const workflow = workflowResponse.data;

        const prompt = `Generate comprehensive documentation for this n8n workflow:

${JSON.stringify(workflow, null, 2)}

Please include:
1. Overview and purpose
2. Trigger conditions
3. Step-by-step flow description
4. Node configurations and their purposes
5. Input/output data structures
${includeUseCases ? '6. Use case examples' : ''}
${includeTroubleshooting ? '7. Common issues and troubleshooting' : ''}
8. Configuration requirements
9. Dependencies and prerequisites

Format as clear, structured documentation.`;

        const aiResponse = await openaiApi.post('/chat/completions', {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a technical documentation expert specializing in n8n workflows. Create clear, comprehensive documentation.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 2000
        });

        const documentation = aiResponse.data.choices[0].message.content;

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              workflowId,
              workflowName: workflow.name,
              documentation,
              generatedAt: new Date().toISOString(),
              includes: {
                useCases: includeUseCases,
                troubleshooting: includeTroubleshooting
              }
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Copilot chat interface
  server.tool(
    "copilot_chat",
    "Interactive chat with AI Copilot for workflow development assistance",
    {
      message: z.string().describe("Your question or request to the AI Copilot"),
      context: z.object({
        currentWorkflow: z.string().optional().describe("ID of currently edited workflow"),
        lastAction: z.string().optional().describe("Last action performed"),
        errorMessage: z.string().optional().describe("Any error message encountered")
      }).optional().describe("Context information for better assistance")
    },
    async ({ message, context }) => {
      try {
        if (!OPENAI_API_KEY) {
          throw new Error("OpenAI API key not configured");
        }

        let contextInfo = "";
        if (context?.currentWorkflow) {
          try {
            const workflowResponse = await n8nApi.get(`/workflows/${context.currentWorkflow}`);
            contextInfo = `Current workflow: ${workflowResponse.data.name} (${context.currentWorkflow})`;
          } catch (e) {
            contextInfo = `Current workflow ID: ${context.currentWorkflow}`;
          }
        }

        if (context?.lastAction) {
          contextInfo += `\nLast action: ${context.lastAction}`;
        }

        if (context?.errorMessage) {
          contextInfo += `\nError encountered: ${context.errorMessage}`;
        }

        const prompt = `${contextInfo ? `Context: ${contextInfo}\n\n` : ''}User question: ${message}`;

        const aiResponse = await openaiApi.post('/chat/completions', {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are GitHub Copilot integrated with n8n. Help users with workflow development, debugging, optimization, and n8n best practices. Be concise but helpful.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        });

        const copilotResponse = aiResponse.data.choices[0].message.content;

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              copilotResponse,
              context: context || {},
              timestamp: new Date().toISOString()
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Include all existing workflow management tools...
  // (Add the existing tools from your original http-server.ts here)

  return server;
};

// Create Express app
const app = express();

// Enable CORS for all origins
app.use(cors());

// Parse JSON requests
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'n8n-workflow-builder-copilot',
    version: '0.11.0',
    n8nHost: N8N_HOST,
    copilotEnabled: COPILOT_INTEGRATION,
    aiEnabled: !!OPENAI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'N8N Workflow Builder MCP Server with Copilot',
    version: '0.11.0',
    description: 'HTTP-enabled MCP server for n8n workflow management with AI/Copilot integration',
    endpoints: {
      health: '/health',
      mcp: '/mcp',
      copilot: '/copilot'
    },
    features: {
      workflowManagement: true,
      aiGeneration: !!OPENAI_API_KEY,
      copilotIntegration: COPILOT_INTEGRATION,
      optimization: !!OPENAI_API_KEY,
      documentation: !!OPENAI_API_KEY
    },
    transport: 'HTTP (Streamable)',
    n8nHost: N8N_HOST
  });
});

// Copilot panel endpoint
app.get('/copilot', (req, res) => {
  if (!COPILOT_INTEGRATION) {
    return res.status(404).json({ error: 'Copilot integration not enabled' });
  }
  
  res.json({
    copilotPanel: true,
    features: ['workflow_generation', 'optimization', 'documentation', 'chat'],
    status: 'active',
    aiProvider: 'openai',
    version: '0.11.0'
  });
});

// Store active transports
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Handle MCP requests over HTTP (existing implementation)
app.post('/mcp', async (req, res) => {
  try {
    const sessionId = req.headers['mcp-session-id'] as string;
    const isInitRequest = req.body?.method === 'initialize';

    let transport: StreamableHTTPServerTransport;

    if (isInitRequest) {
      const newSessionId = randomUUID();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => newSessionId,
        onsessioninitialized: (sessionId) => {
          console.log(`Session initialized: ${sessionId}`);
        },
        onsessionclosed: (sessionId) => {
          console.log(`Session closed: ${sessionId}`);
          delete transports[sessionId];
        }
      });
      
      transports[newSessionId] = transport;
      
      transport.onclose = () => {
        console.log(`Transport closed for session ${newSessionId}`);
        delete transports[newSessionId];
      };

      const server = createServer();
      await server.connect(transport);
      
      await transport.handleRequest(req, res, req.body);
      return;
    } else {
      if (!sessionId || !transports[sessionId]) {
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: No valid session ID provided'
          },
          id: null
        });
        return;
      }
      
      transport = transports[sessionId];
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error'
        },
        id: null
      });
    }
  }
});

// Handle other MCP methods
app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string;
  
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  
  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
});

app.delete('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string;
  
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  
  console.log(`Received session termination request for session ${sessionId}`);
  
  try {
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error('Error handling session termination:', error);
    if (!res.headersSent) {
      res.status(500).send('Error processing session termination');
    }
  }
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`N8N Workflow Builder with Copilot v0.11.0 running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`Copilot panel: http://localhost:${PORT}/copilot`);
  console.log(`AI/Copilot features: ${COPILOT_INTEGRATION ? 'Enabled' : 'Disabled'}`);
  console.log("Enhanced SDK with AI-powered workflow tools available");
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  
  for (const sessionId in transports) {
    try {
      console.log(`Closing transport for session ${sessionId}`);
      await transports[sessionId].close();
      delete transports[sessionId];
    } catch (error) {
      console.error(`Error closing transport for session ${sessionId}:`, error);
    }
  }
  
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  
  for (const sessionId in transports) {
    try {
      await transports[sessionId].close();
      delete transports[sessionId];
    } catch (error) {
      console.error(`Error closing transport for session ${sessionId}:`, error);
    }
  }
  
  server.close(() => {
    process.exit(0);
  });
});