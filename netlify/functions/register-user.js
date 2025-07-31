const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
        };
    }

    try {
        if (!event.body) {
            throw new Error('No data provided');
        }

        const { username, email, password, role, instagram } = JSON.parse(event.body);
        
        if (!username || !email || !password || !role) {
            throw new Error('Missing required fields');
        }
        
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Insert user - USING CORRECT COLUMN NAMES
        const result = await pool.query(
            'INSERT INTO users (username, email, password, role, status, instagram, reputatior, created_a, updated_a) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id, username, email, role, status',
            [username, email, passwordHash, role, 'active', instagram || null, 0]
        );
        
        const user = result.rows[0];
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Registrazione completata con successo!',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    status: user.status
                }
            })
        };
        
    } catch (error) {
        console.error('Registration error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: `Errore durante la registrazione: ${error.message}`
            })
        };
    }
};
