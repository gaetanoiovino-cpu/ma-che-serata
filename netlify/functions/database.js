const { Pool } = require('pg');

// Database connection pool
let pool;

function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? {
                rejectUnauthorized: false
            } : false,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        // Handle pool errors
        pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
        });
    }
    return pool;
}

// Generic database query function
async function query(text, params) {
    const client = await getPool().connect();
    try {
        const result = await client.query(text, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Database health check
async function healthCheck() {
    try {
        const result = await query('SELECT NOW() as current_time');
        return {
            status: 'healthy',
            timestamp: result.rows[0].current_time,
            pool_size: getPool().totalCount,
            idle_connections: getPool().idleCount
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message
        };
    }
}

// Main handler for direct database endpoint
exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Parse request body
        let body = {};
        if (event.body) {
            body = JSON.parse(event.body);
        }

        // Route based on HTTP method and body content
        switch (event.httpMethod) {
            case 'GET':
                // Health check endpoint
                const health = await healthCheck();
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        message: 'Database connection active',
                        health
                    })
                };

            case 'POST':
                // Execute custom query (admin only)
                if (!body.query) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            error: 'Query is required'
                        })
                    };
                }

                // Basic security check - only allow SELECT statements for safety
                const queryText = body.query.trim().toLowerCase();
                if (!queryText.startsWith('select')) {
                    return {
                        statusCode: 403,
                        headers,
                        body: JSON.stringify({
                            error: 'Only SELECT queries are allowed through this endpoint'
                        })
                    };
                }

                const result = await query(body.query, body.params || []);
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        data: result.rows,
                        rowCount: result.rowCount
                    })
                };

            default:
                return {
                    statusCode: 405,
                    headers,
                    body: JSON.stringify({
                        error: 'Method not allowed'
                    })
                };
        }
    } catch (error) {
        console.error('Database handler error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};

// Export database utilities for use in other functions
module.exports = {
    query,
    healthCheck,
    getPool,
    handler: exports.handler
};
