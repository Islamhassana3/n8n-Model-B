# Environment Variables for Railway Deployment

## Service: MySQL Database

```bash
MYSQL_ROOT_PASSWORD=secure_root_password_here
MYSQL_DATABASE=n8n
MYSQL_USER=n8n
MYSQL_PASSWORD=secure_n8n_password_here
```

## Service: N8N Server

```bash
# Authentication
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_admin_password_here

# Database Connection
DB_TYPE=mysqldb
DB_MYSQLDB_HOST=${{mysql.RAILWAY_PRIVATE_DOMAIN}}
DB_MYSQLDB_PORT=3306
DB_MYSQLDB_DATABASE=n8n
DB_MYSQLDB_USER=n8n
DB_MYSQLDB_PASSWORD=secure_n8n_password_here

# URLs (Railway will populate these)
N8N_HOST=${{RAILWAY_PUBLIC_DOMAIN}}
WEBHOOK_URL=${{RAILWAY_PUBLIC_DOMAIN}}
N8N_PORT=5678
N8N_PROTOCOL=https
GENERIC_TIMEZONE=UTC
```

## Service: N8N Workflow Builder

```bash
# HTTP Mode
USE_HTTP=true

# Connection to N8N
N8N_HOST=${{n8n.RAILWAY_PUBLIC_DOMAIN}}
N8N_API_KEY=your_api_key_from_n8n_ui

# Port (automatically set by Railway)
PORT=1937
```

## Notes

1. **Railway Variables**: Variables like `${{mysql.RAILWAY_PRIVATE_DOMAIN}}` are automatically populated by Railway
2. **API Key**: Must be generated in N8N UI after deployment
3. **Passwords**: Should be secure and unique for production
4. **Dependencies**: Services must be deployed in order: MySQL → N8N → Workflow Builder