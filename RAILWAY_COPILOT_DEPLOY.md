# 🚀 N8N with GitHub Copilot Integration - Railway Deployment

Deploy a complete N8N automation stack with built-in GitHub Copilot AI assistance directly in your workflow editor's side panel.

## 🎯 What's Included

This Railway template provides a comprehensive n8n setup with AI-powered workflow assistance:

### Core Services
- **N8N Primary**: Main n8n instance with web UI and API
- **N8N Worker**: Background worker for scalable workflow execution
- **PostgreSQL**: Database for workflow and execution data
- **Redis**: Message queue for job distribution
- **Workflow Builder**: Enhanced MCP server with AI tools
- **Copilot Panel**: AI assistant side panel integration

### 🤖 AI-Powered Features

#### 1. **Workflow Generation**
- Generate complete workflows from natural language descriptions
- Specify complexity levels (simple, moderate, complex)
- Automatic error handling integration
- Best practices implementation

#### 2. **Workflow Optimization**
- AI analysis of existing workflows
- Performance, reliability, and cost optimization suggestions
- Automated bottleneck detection
- Implementation guidance

#### 3. **Smart Documentation**
- Auto-generate comprehensive workflow documentation
- Include use cases and troubleshooting guides
- Step-by-step flow descriptions
- Configuration requirements

#### 4. **Interactive Copilot Chat**
- Real-time AI assistance while building workflows
- Context-aware suggestions based on current work
- Error debugging and resolution help
- n8n best practices guidance

## 🚀 Quick Deploy

[![Deploy to Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://raw.githubusercontent.com/Islamhassana3/n8n-workflow-builder/main/railway-template-copilot.json)

## ⚙️ Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `N8N_ADMIN_USER` | Admin username for n8n | `admin` |
| `N8N_ADMIN_PASSWORD` | Admin password (8+ chars) | `secure_password_123` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `postgres_secure_pass` |
| `REDIS_PASSWORD` | Redis password | `redis_secure_pass` |
| `N8N_ENCRYPTION_KEY` | 32-character encryption key | `abcd1234efgh5678ijkl9012mnop3456` |
| `OPENAI_API_KEY` | OpenAI API key for AI features | `sk-...` |
| `GITHUB_TOKEN` | GitHub Personal Access Token | `ghp_...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `N8N_API_KEY` | N8N API key (generated after deployment) | - |
| `GITHUB_COPILOT_API_KEY` | GitHub Copilot API key for advanced features | - |

## 🛠️ Setup Instructions

### 1. Deploy to Railway
Click the deploy button above and configure the required environment variables.

### 2. Generate N8N API Key
1. Access your deployed n8n instance
2. Go to Settings → API Keys
3. Create a new API key
4. Add it to Railway environment variables

### 3. Configure GitHub Integration
1. Create a GitHub Personal Access Token with `copilot` scope
2. Add it as `GITHUB_TOKEN` in Railway
3. Optionally add `GITHUB_COPILOT_API_KEY` for advanced features

### 4. Access Services
- **N8N UI**: `https://n8n-primary-[project-id].up.railway.app`
- **Workflow Builder**: `https://workflow-builder-[project-id].up.railway.app`
- **Copilot Panel**: `https://copilot-panel-[project-id].up.railway.app`

## 🎮 Using the Copilot Features

### Workflow Generation
```bash
# Example: Generate a data processing workflow
curl -X POST https://workflow-builder-[project-id].up.railway.app/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "generate_workflow_with_ai",
      "arguments": {
        "description": "Process customer data from webhook, validate email addresses, and send to CRM",
        "complexity": "moderate",
        "includeErrorHandling": true
      }
    }
  }'
```

### Interactive Chat
```bash
# Ask Copilot for help
curl -X POST https://workflow-builder-[project-id].up.railway.app/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "copilot_chat",
      "arguments": {
        "message": "How do I handle rate limiting in API calls?",
        "context": {
          "currentWorkflow": "workflow-123",
          "lastAction": "added HTTP node"
        }
      }
    }
  }'
```

### Workflow Optimization
```bash
# Get AI optimization suggestions
curl -X POST https://workflow-builder-[project-id].up.railway.app/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "optimize_workflow_with_ai",
      "arguments": {
        "workflowId": "workflow-123",
        "optimizationGoals": ["performance", "reliability"]
      }
    }
  }'
```

## 🔧 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ PostgreSQL DB   │◄───┤ N8N Primary     │◄───┤ Workflow Builder│
│   Port: 5432    │    │   Port: 5678    │    │   Port: 1937    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Redis       │◄───┤ N8N Worker      │    │ Copilot Panel   │
│   Port: 6379    │    │   (Background)  │    │   Port: 3000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚨 Troubleshooting

### Common Issues

#### 1. **Copilot Features Not Working**
- Verify `OPENAI_API_KEY` is set correctly
- Check `GITHUB_TOKEN` has proper permissions
- Ensure `COPILOT_INTEGRATION=true` in workflow-builder service

#### 2. **Worker Not Processing Jobs**
- Check Redis connection between services
- Verify `REDIS_PASSWORD` matches across all services
- Review worker logs for connection errors

#### 3. **AI Generation Fails**
- Validate OpenAI API key has sufficient credits
- Check rate limits on OpenAI API
- Review workflow-builder logs for API errors

### Debug Commands

```bash
# Check service health
curl https://workflow-builder-[project-id].up.railway.app/health

# Test Copilot integration
curl https://workflow-builder-[project-id].up.railway.app/copilot

# View service logs in Railway dashboard
railway logs --service=workflow-builder
railway logs --service=copilot-panel
```

## 🔐 Security Considerations

1. **API Keys**: Store securely in Railway environment variables
2. **Access Control**: Use strong passwords for admin accounts
3. **Network**: Services communicate via Railway's private network
4. **Encryption**: All data encrypted with `N8N_ENCRYPTION_KEY`

## 📈 Scaling

- **Workers**: Add more worker services for increased throughput
- **Database**: Upgrade PostgreSQL resources as needed
- **Redis**: Monitor memory usage and scale accordingly
- **AI**: Consider OpenAI usage limits and costs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your enhancements
4. Test with Railway deployment
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Resources

- [N8N Documentation](https://docs.n8n.io/)
- [Railway Documentation](https://docs.railway.app/)
- [OpenAI API Reference](https://platform.openai.com/docs/)
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)

---

**Built with ❤️ for the n8n and AI automation community**