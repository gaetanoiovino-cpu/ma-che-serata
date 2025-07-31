const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { email, password } = JSON.parse(event.body);

        if (!email || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Email e password sono richiesti' })
            };
        }

        // Initialize Supabase
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE
        );

        // Find user by email
        const { data: users, error } = await supabase
            .from('users')
            .select('id, username, email, password_hash, role, status, instagram_handle, reputation')
            .eq('email', email.toLowerCase().trim())
            .limit(1);

        if (error || !users || users.length === 0) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Credenziali non valide' })
            };
        }

        const user = users[0];

        // Check user status
        if (user.status === 'banned') {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({ error: 'Account bannato' })
            };
        }

        if (user.status !== 'active') {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({ error: 'Account non attivo' })
            };
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Credenziali non valide' })
            };
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '7d' }
        );

        // Prepare user data
        const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status,
            instagramHandle: user.instagram_handle,
            reputation: user.reputation || 0,
            token: token
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Login effettuato con successo',
                user: userData
            })
        };

    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Errore interno del server' })
        };
    }
};
