const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        // STEP 1: Parse body
        let bodyData;
        try {
            bodyData = JSON.parse(event.body);
        } catch (e) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON', step: 'parse' }) };
        }

        const { username, email, password, role, instagram } = bodyData;

        // STEP 2: Validate data
        if (!username) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Username missing', step: 'validate' }) };
        if (!email) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email missing', step: 'validate' }) };
        if (!password) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Password missing', step: 'validate' }) };
        if (!role) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Role missing', step: 'validate' }) };

        // STEP 3: Test database connection
        let pool;
        try {
            pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false }
            });
            await pool.query('SELECT 1');
        } catch (e) {
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'DB connection failed', step: 'connection', details: e.message }) };
        }

        // STEP 4: Hash password
        let passwordHash;
        try {
            passwordHash = await bcrypt.hash(password, 10);
        } catch (e) {
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'Password hash failed', step: 'bcrypt', details: e.message }) };
        }

        // STEP 5: Insert user
        try {
            const result = await pool.query(
                'INSERT INTO users (username, email, password_hash, role, status, instagram_handle, reputation, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING username, email, role',
                [username, email, passwordHash, role, 'active', instagram || null, 0]
            );
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Registrazione OK!',
                    user: result.rows[0]
                })
            };
        } catch (e) {
            return { 
                statusCode: 500, 
                headers, 
                body: JSON.stringify({ 
                    error: 'Database insert failed', 
                    step: 'insert', 
                    details: e.message,
                    code: e.code 
                }) 
            };
        }

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'General error',
                step: 'general',
                message: error.message
            })
        };
    }
};
