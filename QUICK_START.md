# 🚀 Quick Start: Deploy Complete N8N Stack to Railway

## The Problem (Solved!)

The original issue was:
> "the issue where only the n8n service and not the n8n service and the postgrees service with the n8n service flowing into the postgres encased togeteher"

**The user expected a complete n8n setup with PostgreSQL database properly connected to n8n, not just the workflow builder client.**

## The Solution ✅

This repository now provides a **complete N8N automation stack** for Railway deployment with proper database connectivity:

**PostgreSQL Stack (Recommended):**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ PostgreSQL DB   │◄───┤   N8N Server    │◄───┤ Workflow Builder│
│   Port: 5432    │    │   Port: 5678    │    │   Port: 1937    │
│                 │    │                 │    │                 │
│ • Workflow data │    │ • Web UI        │    │ • MCP Server    │
│ • User accounts │    │ • API endpoints │    │ • AI Integration│
│ • Executions    │    │ • Automations   │    │ • Claude/ChatGPT│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**MySQL Stack (Legacy):**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MySQL DB      │◄───┤   N8N Server    │◄───┤ Workflow Builder│
│   Port: 3306    │    │   Port: 5678    │    │   Port: 1937    │
│                 │    │                 │    │                 │
│ • Workflow data │    │ • Web UI        │    │ • MCP Server    │
│ • User accounts │    │ • API endpoints │    │ • AI Integration│
│ • Executions    │    │ • Automations   │    │ • Claude/ChatGPT│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 What You Get

1. **Database** - Stores all your workflows, user data, and execution history
   - **PostgreSQL** (Recommended): Modern, powerful, feature-rich
   - **MySQL** (Legacy): Stable, widely supported
2. **N8N Server** - The full n8n application with web interface
3. **Workflow Builder** - MCP server for AI assistant integration

## 🚀 One-Click Deploy

**PostgreSQL Version (Recommended):**
[![Deploy PostgreSQL Stack](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/Islamhassana3/n8n-workflow-builder/blob/main/railway-template-postgres.toml)

**MySQL Version (Legacy):**
[![Deploy MySQL Stack](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/Islamhassana3/n8n-workflow-builder/blob/main/railway-template.toml)

**Or manually:**

1. Fork this repo
2. Connect to Railway
3. Deploy all 3 services using the template files
4. Configure environment variables

## 📋 Post-Deployment Setup

After deployment, you'll have 3 URLs:
- **N8N Web UI**: `https://n8n-[id].up.railway.app`
- **Workflow Builder**: `https://workflow-builder-[id].up.railway.app`
- **MySQL**: Internal only

### Step 1: Access N8N
1. Go to your N8N URL
2. Login with admin credentials (set during deployment)
3. Create workflows using the visual editor

### Step 2: Generate API Key
1. In N8N, go to Settings → API Keys
2. Create new API key
3. Copy the key

### Step 3: Configure Workflow Builder
1. Go to Railway dashboard
2. Find the workflow-builder service
3. Add environment variable: `N8N_API_KEY=your_key_here`
4. Redeploy the service

### Step 4: Test Integration
```bash
# Test the workflow builder
curl https://your-workflow-builder.railway.app/health

# Should return:
{
  "status": "healthy",
  "service": "n8n-workflow-builder", 
  "version": "0.10.3",
  "n8nHost": "https://your-n8n.railway.app",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🤖 Use with AI Assistants

### Claude Desktop Configuration
```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["@makafeli/n8n-workflow-builder"],
      "env": {
        "N8N_HOST": "https://your-n8n.railway.app",
        "N8N_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Example Usage
Ask Claude:
- "List all my n8n workflows"
- "Create a new workflow that sends Slack notifications"
- "Execute the customer onboarding workflow"
- "Show me recent workflow executions"

## 📝 Example Commands

```bash
# List workflows
curl -X POST https://your-workflow-builder.railway.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_workflows",
      "arguments": {}
    }
  }'

# Create workflow
curl -X POST https://your-workflow-builder.railway.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0", 
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "create_workflow",
      "arguments": {
        "workflow": {
          "name": "Test Workflow",
          "nodes": [...],
          "connections": {...}
        }
      }
    }
  }'
```

## 🔧 Architecture Comparison

**Before (Problem):**
```
n8n-workflow-builder ❌ (tried to connect to non-existent n8n)
```

**After (Solution):**  
```
MySQL ← N8N Server ← Workflow Builder ← AI Assistants
  ✅        ✅           ✅              ✅
```

## 📚 Documentation

- **[Complete Railway Deployment Guide](./RAILWAY_DEPLOY.md)** - Detailed setup instructions
- **[Railway Fix Documentation](./RAILWAY_FIX.md)** - Technical implementation details
- **[Docker Compose](./docker-compose.railway.yml)** - Local development stack

## ✅ Success Indicators

You'll know it's working when:
1. **N8N UI loads** and you can login
2. **Workflow Builder health** returns status "healthy"
3. **Database connection** shows in n8n settings
4. **API calls succeed** through the workflow builder
5. **AI assistants** can list and manage workflows

This complete solution provides the full n8n experience with database backend that the user was expecting!