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
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 1937;

console.error("N8N Workflow Builder HTTP Server");
console.error("N8N API Configuration:");
console.error("Host:", N8N_HOST);
console.error("API Key:", N8N_API_KEY ? `${N8N_API_KEY.substring(0, 4)}****` : 'Not set');
console.error("Port:", PORT);

// Create axios instance for n8n API
const n8nApi = axios.create({
  baseURL: N8N_HOST,
  headers: {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Factory function to create a new server instance
const createServer = () => {
  const server = new McpServer({
    name: "n8n-workflow-builder",
    version: "0.10.3"
  });

  // Register all the workflow management tools
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

  server.tool(
    "create_workflow",
    "Create a new workflow in n8n",
    {
      workflow: z.object({
        name: z.string().describe("Name of the workflow"),
        nodes: z.array(z.any()).describe("Array of workflow nodes"),
        connections: z.record(z.string(), z.any()).optional().describe("Node connections"),
        settings: z.record(z.string(), z.any()).optional().describe("Workflow settings"),
        tags: z.array(z.any()).optional().describe("Workflow tags")
      }).describe("Workflow configuration")
    },
    async ({ workflow }) => {
      try {
        const response = await n8nApi.post('/workflows', workflow);
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

  server.tool(
    "get_workflow",
    "Get a workflow by ID",
    {
      id: z.string().describe("Workflow ID")
    },
    async ({ id }) => {
      try {
        const response = await n8nApi.get(`/workflows/${id}`);
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

  server.tool(
    "update_workflow",
    "Update an existing workflow by ID",
    {
      id: z.string().describe("Workflow ID"),
      workflow: z.object({
        name: z.string().optional().describe("Name of the workflow"),
        nodes: z.array(z.any()).optional().describe("Array of workflow nodes"),
        connections: z.record(z.string(), z.any()).optional().describe("Node connections"),
        settings: z.record(z.string(), z.any()).optional().describe("Workflow settings"),
        tags: z.array(z.any()).optional().describe("Workflow tags")
      }).describe("Updated workflow configuration")
    },
    async ({ id, workflow }) => {
      try {
        const response = await n8nApi.put(`/workflows/${id}`, workflow);
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

  server.tool(
    "delete_workflow",
    "Delete a workflow by ID",
    {
      id: z.string().describe("Workflow ID")
    },
    async ({ id }) => {
      try {
        const response = await n8nApi.delete(`/workflows/${id}`);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: `Workflow ${id} deleted successfully`,
              deletedWorkflow: response.data
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

  server.tool(
    "activate_workflow",
    "Activate a workflow by ID",
    {
      id: z.string().describe("Workflow ID")
    },
    async ({ id }) => {
      try {
        const response = await n8nApi.post(`/workflows/${id}/activate`);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: `Workflow ${id} activated successfully`,
              workflow: response.data
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

  server.tool(
    "deactivate_workflow",
    "Deactivate a workflow by ID",
    {
      id: z.string().describe("Workflow ID")
    },
    async ({ id }) => {
      try {
        const response = await n8nApi.post(`/workflows/${id}/deactivate`);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: `Workflow ${id} deactivated successfully`,
              workflow: response.data
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

  server.tool(
    "execute_workflow",
    "Execute a workflow manually",
    {
      id: z.string().describe("Workflow ID")
    },
    async ({ id }) => {
      try {
        const response = await n8nApi.post(`/workflows/${id}/execute`);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: `Workflow ${id} executed successfully`,
              execution: response.data
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

  server.tool(
    "create_workflow_and_activate",
    "Create a new workflow and immediately activate it",
    {
      workflow: z.object({
        name: z.string().describe("Name of the workflow"),
        nodes: z.array(z.any()).describe("Array of workflow nodes"),
        connections: z.record(z.string(), z.any()).optional().describe("Node connections"),
        settings: z.record(z.string(), z.any()).optional().describe("Workflow settings"),
        tags: z.array(z.any()).optional().describe("Workflow tags")
      }).describe("Workflow configuration")
    },
    async ({ workflow }) => {
      try {
        // First create the workflow
        const createResponse = await n8nApi.post('/workflows', workflow);
        const workflowId = createResponse.data.id;

        // Then activate it
        const activateResponse = await n8nApi.post(`/workflows/${workflowId}/activate`);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: `Workflow created and activated successfully`,
              workflow: activateResponse.data
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

  // Execution Management Tools
  server.tool(
    "list_executions",
    "List workflow executions with filtering and pagination support",
    {
      includeData: z.boolean().optional().describe("Include execution's detailed data"),
      status: z.enum(["error", "success", "waiting"]).optional().describe("Filter by execution status"),
      workflowId: z.string().optional().describe("Filter by specific workflow ID"),
      projectId: z.string().optional().describe("Filter by project ID"),
      limit: z.number().min(1).max(250).optional().describe("Number of executions to return (max: 250)"),
      cursor: z.string().optional().describe("Pagination cursor for next page")
    },
    async ({ includeData, status, workflowId, projectId, limit, cursor }) => {
      try {
        const params = new URLSearchParams();

        if (includeData !== undefined) params.append('includeData', includeData.toString());
        if (status) params.append('status', status);
        if (workflowId) params.append('workflowId', workflowId);
        if (projectId) params.append('projectId', projectId);
        if (limit) params.append('limit', limit.toString());
        if (cursor) params.append('cursor', cursor);

        const response = await n8nApi.get(`/executions?${params.toString()}`);
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

  server.tool(
    "get_execution",
    "Get detailed information about a specific workflow execution",
    {
      id: z.string().describe("Execution ID"),
      includeData: z.boolean().optional().describe("Include detailed execution data")
    },
    async ({ id, includeData }) => {
      try {
        const params = new URLSearchParams();
        if (includeData !== undefined) params.append('includeData', includeData.toString());

        const url = `/executions/${id}${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await n8nApi.get(url);
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

  server.tool(
    "delete_execution",
    "Delete a workflow execution record from the n8n instance",
    {
      id: z.string().describe("Execution ID to delete")
    },
    async ({ id }) => {
      try {
        const response = await n8nApi.delete(`/executions/${id}`);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: `Execution ${id} deleted successfully`,
              deletedExecution: response.data
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

  // Tag Management Tools
  server.tool(
    "list_tags",
    "List all workflow tags with pagination support",
    {
      limit: z.number().min(1).max(250).optional().describe("Number of tags to return (max: 250)"),
      cursor: z.string().optional().describe("Pagination cursor for next page")
    },
    async ({ limit, cursor }) => {
      try {
        const params = new URLSearchParams();

        if (limit) params.append('limit', limit.toString());
        if (cursor) params.append('cursor', cursor);

        const response = await n8nApi.get(`/tags?${params.toString()}`);
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

  server.tool(
    "create_tag",
    "Create a new workflow tag for organization and categorization",
    {
      name: z.string().describe("Name of the tag to create")
    },
    async ({ name }) => {
      try {
        const response = await n8nApi.post('/tags', { name });
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: `Tag '${name}' created successfully`,
              tag: response.data
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

  server.tool(
    "get_tag",
    "Retrieve individual tag details by ID",
    {
      id: z.string().describe("Tag ID")
    },
    async ({ id }) => {
      try {
        const response = await n8nApi.get(`/tags/${id}`);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              tag: response.data,
              message: `Tag ${id} retrieved successfully`
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

  server.tool(
    "update_tag",
    "Modify tag names for better organization",
    {
      id: z.string().describe("Tag ID"),
      name: z.string().describe("New name for the tag")
    },
    async ({ id, name }) => {
      try {
        const response = await n8nApi.put(`/tags/${id}`, { name });
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: `Tag ${id} updated successfully`,
              tag: response.data
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

  server.tool(
    "delete_tag",
    "Remove unused tags from the system",
    {
      id: z.string().describe("Tag ID to delete")
    },
    async ({ id }) => {
      try {
        const response = await n8nApi.delete(`/tags/${id}`);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: `Tag ${id} deleted successfully`,
              deletedTag: response.data
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

  server.tool(
    "get_workflow_tags",
    "Get all tags associated with a specific workflow",
    {
      workflowId: z.string().describe("Workflow ID")
    },
    async ({ workflowId }) => {
      try {
        const response = await n8nApi.get(`/workflows/${workflowId}/tags`);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              workflowId,
              tags: response.data,
              message: `Tags for workflow ${workflowId} retrieved successfully`
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

  server.tool(
    "update_workflow_tags",
    "Assign or remove tags from workflows",
    {
      workflowId: z.string().describe("Workflow ID"),
      tagIds: z.array(z.string()).describe("Array of tag IDs to assign to the workflow")
    },
    async ({ workflowId, tagIds }) => {
      try {
        const response = await n8nApi.put(`/workflows/${workflowId}/tags`, { tagIds });
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: `Tags for workflow ${workflowId} updated successfully`,
              workflowId,
              assignedTags: response.data
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

  // Credential Management Tools
  server.tool(
    "create_credential",
    "Create a new credential for workflow authentication. Use get_credential_schema first to understand required fields for the credential type.",
    {
      name: z.string().describe("Name for the credential"),
      type: z.string().describe("Credential type (e.g., 'httpBasicAuth', 'httpHeaderAuth', 'oAuth2Api', etc.)"),
      data: z.record(z.string(), z.any()).describe("Credential data object with required fields for the credential type")
    },
    async ({ name, type, data }) => {
      try {
        const response = await n8nApi.post('/credentials', {
          name,
          type,
          data
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: `Credential '${name}' created successfully`,
              credential: {
                id: response.data.id,
                name: response.data.name,
                type: response.data.type,
                createdAt: response.data.createdAt
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

  server.tool(
    "get_credential_schema",
    "Get the schema for a specific credential type to understand what fields are required when creating credentials.",
    {
      credentialType: z.string().describe("Credential type name (e.g., 'httpBasicAuth', 'httpHeaderAuth', 'oAuth2Api', 'githubApi', 'slackApi', etc.)")
    },
    async ({ credentialType }) => {
      try {
        const response = await n8nApi.get(`/credentials/schema/${credentialType}`);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              credentialType,
              schema: response.data,
              message: `Schema for credential type '${credentialType}' retrieved successfully`
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

  server.tool(
    "delete_credential",
    "Delete a credential by ID. This will remove the credential and make it unavailable for workflows. Use with caution as this action cannot be undone.",
    {
      id: z.string().describe("Credential ID to delete")
    },
    async ({ id }) => {
      try {
        const response = await n8nApi.delete(`/credentials/${id}`);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: `Credential ${id} deleted successfully`,
              deletedCredential: response.data
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

  // Security Audit Tool
  server.tool(
    "generate_audit",
    "Generate a comprehensive security audit report for the n8n instance",
    {
      additionalOptions: z.object({
        daysAbandonedWorkflow: z.number().optional().describe("Number of days to consider a workflow abandoned"),
        categories: z.array(z.enum(["credentials", "database", "nodes", "filesystem", "instance"])).optional().describe("Audit categories to include")
      }).optional().describe("Additional audit configuration options")
    },
    async ({ additionalOptions }) => {
      try {
        const auditPayload: any = {};

        if (additionalOptions) {
          if (additionalOptions.daysAbandonedWorkflow !== undefined) {
            auditPayload.daysAbandonedWorkflow = additionalOptions.daysAbandonedWorkflow;
          }
          if (additionalOptions.categories) {
            auditPayload.categories = additionalOptions.categories;
          }
        }

        const response = await n8nApi.post('/audit', auditPayload);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: "Security audit generated successfully",
              audit: response.data
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

  return server;
};

// Create Express app
const app = express();

// Enable CORS for all origins
app.use(cors());

// Parse JSON requests
app.use(express.json({ limit: '10mb' }));

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'n8n-workflow-builder',
    version: '0.10.3',
    n8nHost: N8N_HOST,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'N8N Workflow Builder MCP Server',
    version: '0.10.3',
    description: 'HTTP-enabled MCP server for n8n workflow management',
    endpoints: {
      health: '/health',
      mcp: '/mcp'
    },
    transport: 'HTTP (Streamable)',
    n8nHost: N8N_HOST
  });
});

// Store active transports
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Handle MCP requests over HTTP
app.post('/mcp', async (req, res) => {
  try {
    const sessionId = req.headers['mcp-session-id'] as string;
    const isInitRequest = req.body?.method === 'initialize';

    let transport: StreamableHTTPServerTransport;

    if (isInitRequest) {
      // Create new transport for initialization
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
      
      // Store the transport
      transports[newSessionId] = transport;
      
      // Set up event handlers
      transport.onclose = () => {
        console.log(`Transport closed for session ${newSessionId}`);
        delete transports[newSessionId];
      };

      // Connect to a new server instance
      const server = createServer();
      await server.connect(transport);
      
      await transport.handleRequest(req, res, req.body);
      return;
    } else {
      // Use existing transport
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

// Handle GET requests for SSE streams  
app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string;
  
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  
  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
});

// Handle DELETE requests for session termination
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
const server = app.listen(PORT, () => {
  console.log(`N8N Workflow Builder HTTP Server v0.10.3 running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log("Modern SDK 1.17.0 with HTTP transport and 23 tools available");
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  
  // Close all active transports
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
  
  // Close all active transports
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