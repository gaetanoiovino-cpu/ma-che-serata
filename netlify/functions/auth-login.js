const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('./database');

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    // Only allow POST method
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                error: 'Method not allowed. Use POST.'
            })
        };
    }

    try {
        // Parse request body
        const { email, password } = JSON.parse(event.body);

        // Validate input
        if (!email || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Email e password sono richiesti'
                })
            };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Formato email non valido'
                })
            };
        }

        // Find user by email
        const userResult = await query(
            'SELECT id, username, email, password_hash, role, status, instagram_handle, reputation, created_at, last_login FROM users WHERE email = $1',
            [email.toLowerCase().trim()]
        );

        if (userResult.rows.length === 0) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    error: 'Credenziali non valide'
                })
            };
        }

        const user = userResult.rows[0];

        // Check if user account is active
        if (user.status === 'banned') {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({
                    error: 'Account bannato. Contatta il supporto.'
                })
            };
        }

        if (user.status === 'pending_approval') {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({
                    error: 'Account in attesa di approvazione'
                })
            };
        }

        if (user.status === 'suspended') {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({
                    error: 'Account temporaneamente sospeso'
                })
            };
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    error: 'Credenziali non valide'
                })
            };
        }

        // Update last login timestamp
        await query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [user.id]
        );

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'fallback_secret_key',
            {
                expiresIn: '7d' // Token expires in 7 days
            }
        );

        // Generate refresh token
        const refreshToken = jwt.sign(
            {
                userId: user.id,
                type: 'refresh'
            },
            process.env.JWT_SECRET || 'fallback_secret_key',
            {
                expiresIn: '30d' // Refresh token expires in 30 days
            }
        );

        // Prepare user data (exclude sensitive information)
        const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status,
            instagramHandle: user.instagram_handle,
            reputation: user.reputation || 0,
            createdAt: user.created_at,
            lastLogin: user.last_login,
            token: token,
            refreshToken: refreshToken
        };

        // Add role-specific data
        if (user.role === 'venue') {
            // Get venue-specific information
            const venueResult = await query(
                'SELECT name, description, address, phone FROM venues WHERE user_id = $1',
                [user.id]
            );
            if (venueResult.rows.length > 0) {
                userData.venueInfo = venueResult.rows[0];
            }
        }

        if (user.role === 'artist') {
            // Get artist-specific information
            const artistResult = await query(
                'SELECT stage_name, genre, bio FROM artists WHERE user_id = $1',
                [user.id]
            );
            if (artistResult.rows.length > 0) {
                userData.artistInfo = artistResult.rows[0];
            }
        }

        if (user.role === 'pr') {
            // Get PR-specific information
            const prResult = await query(
                'SELECT company_name, verification_status FROM prs WHERE user_id = $1',
                [user.id]
            );
            if (prResult.rows.length > 0) {
                userData.prInfo = prResult.rows[0];
            }
        }

        // Log successful login
        console.log(`Successful login for user: ${user.email} (${user.role})`);

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
        
        // Don't expose internal errors to client
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Errore interno del server. Riprova più tardi.'
            })
        };
    }
};

// Utility function to verify JWT token (exported for use in other functions)
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    } catch (error) {
        throw new Error('Token non valido');
    }
};

// Middleware to extract user from request headers
const authenticateUser = async (event) => {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Token di autenticazione richiesto');
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const decoded = verifyToken(token);
    
    // Get fresh user data from database
    const userResult = await query(
        'SELECT id, username, email, role, status FROM users WHERE id = $1',
        [decoded.userId]
    );

    if (userResult.rows.length === 0) {
        throw new Error('Utente non trovato');
    }

    const user = userResult.rows[0];
    
    if (user.status !== 'active') {
        throw new Error('Account non attivo');
    }

    return user;
};

module.exports = {
    handler: exports.handler,
    verifyToken,
    authenticateUser
};
