const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { query } = require('./database');

// Email transporter configuration
const createEmailTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send welcome email
const sendWelcomeEmail = async (userEmail, username, role) => {
    try {
        const transporter = createEmailTransporter();
        
        const roleMessages = {
            matcher: 'Benvenuto nella community! Inizia a scoprire eventi fantastici.',
            pr: 'Il tuo account PR è in fase di verifica. Ti contatteremo presto!',
            venue: 'Il tuo locale è in fase di verifica. Ti contatteremo per completare il profilo.',
            artist: 'Il tuo profilo artista è in verifica. Preparati a esibirti!',
            admin: 'Benvenuto nel team amministrativo!'
        };

        const mailOptions = {
            from: `"Ma Che Serata" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: '🍸 Benvenuto in Ma Che Serata!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; overflow: hidden;">
                    <div style="padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 2.5em;">🍸 Ma Che Serata</h1>
                        <p style="margin: 10px 0 0; font-size: 1.2em; opacity: 0.9;">Where Milan Nights Come Alive!</p>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.1); padding: 30px; margin: 0 20px; border-radius: 10px;">
                        <h2 style="margin: 0 0 20px; color: #fff;">Ciao ${username}! 👋</h2>
                        <p style="font-size: 1.1em; line-height: 1.6; margin: 0 0 20px;">
                            ${roleMessages[role] || 'Benvenuto nella community!'}
                        </p>
                        
                        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin: 0 0 15px; color: #fff;">🎯 Prossimi Passi:</h3>
                            <ul style="text-align: left; padding-left: 20px; line-height: 1.8;">
                                <li>Completa il tuo profilo personale</li>
                                <li>Esplora gli eventi disponibili</li>
                                <li>Unisciti alla community Flir2night</li>
                                <li>Inizia a guadagnare Cheers Points!</li>
                            </ul>
                        </div>
                        
                        <a href="https://ma-che-serata.netlify.app" style="display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0;">
                            Inizia Subito! 🚀
                        </a>
                    </div>
                    
                    <div style="padding: 20px; text-align: center; font-size: 0.9em; opacity: 0.8;">
                        <p>Hai domande? Scrivici a <a href="mailto:support@macheserata.it" style="color: #feca57;">support@macheserata.it</a></p>
                        <p>© 2024 Ma Che Serata - La tua vita notturna inizia qui!</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending welcome email:', error);
        // Don't throw error - registration should still succeed even if email fails
    }
};

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
        const {
            username,
            email,
            password,
            confirmPassword,
            role,
            instagram,
            acceptTerms,
            venueInfo,
            artistInfo,
            prInfo
        } = JSON.parse(event.body);

        // Validate required fields
        if (!username || !email || !password || !role) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Username, email, password e ruolo sono richiesti'
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

        // Validate password strength
        if (password.length < 6) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'La password deve essere di almeno 6 caratteri'
                })
            };
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Le password non coincidono'
                })
            };
        }

        // Validate username length
        if (username.length < 3 || username.length > 50) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Username deve essere tra 3 e 50 caratteri'
                })
            };
        }

        // Validate role
        const validRoles = ['matcher', 'pr', 'venue', 'artist'];
        if (!validRoles.includes(role)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Ruolo non valido'
                })
            };
        }

        // Validate Instagram for specific roles
        if (['pr', 'artist', 'venue'].includes(role) && (!instagram || !instagram.startsWith('@'))) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Instagram handle richiesto per questo ruolo (deve iniziare con @)'
                })
            };
        }

        // Validate terms acceptance
        if (!acceptTerms) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Devi accettare i termini e condizioni'
                })
            };
        }

        // Check if email already exists
        const emailCheck = await query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase().trim()]
        );

        if (emailCheck.rows.length > 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Email già registrata'
                })
            };
        }

        // Check if username already exists
        const usernameCheck = await query(
            'SELECT id FROM users WHERE username = $1',
            [username.trim()]
        );

        if (usernameCheck.rows.length > 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Username già in uso'
                })
            };
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Determine user status based on role
        let userStatus = 'active';
        let needsApproval = false;

        // PR, Venue, and Artist accounts need approval
        if (['pr', 'venue', 'artist'].includes(role)) {
            userStatus = 'pending_approval';
            needsApproval = true;
        }

        // Insert new user
        const userResult = await query(
            `INSERT INTO users (username, email, password_hash, role, status, instagram_handle, reputation, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
             RETURNING id, username, email, role, status, created_at`,
            [
                username.trim(),
                email.toLowerCase().trim(),
                passwordHash,
                role,
                userStatus,
                instagram || null,
                0 // Initial reputation
            ]
        );

        const newUser = userResult.rows[0];

        // Insert role-specific information
        if (role === 'venue' && venueInfo) {
            await query(
                `INSERT INTO venues (user_id, name, description, address, phone, created_at) 
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [
                    newUser.id,
                    venueInfo.name || '',
                    venueInfo.description || '',
                    venueInfo.address || '',
                    venueInfo.phone || ''
                ]
            );
        }

        if (role === 'artist' && artistInfo) {
            await query(
                `INSERT INTO artists (user_id, stage_name, genre, bio, created_at) 
                 VALUES ($1, $2, $3, $4, NOW())`,
                [
                    newUser.id,
                    artistInfo.stageName || username,
                    artistInfo.genre || '',
                    artistInfo.bio || ''
                ]
            );
        }

        if (role === 'pr' && prInfo) {
            await query(
                `INSERT INTO prs (user_id, company_name, verification_status, created_at) 
                 VALUES ($1, $2, $3, NOW())`,
                [
                    newUser.id,
                    prInfo.companyName || '',
                    'pending'
                ]
            );
        }

        // Send welcome email
        await sendWelcomeEmail(newUser.email, newUser.username, newUser.role);

        // Prepare response data
        let responseData = {
            success: true,
            message: 'Registrazione completata con successo!',
            needsApproval: needsApproval
        };

        // If no approval needed, generate token and log user in automatically
        if (!needsApproval) {
            const token = jwt.sign(
                {
                    userId: newUser.id,
                    email: newUser.email,
                    role: newUser.role
                },
                process.env.JWT_SECRET || 'fallback_secret_key',
                {
                    expiresIn: '7d'
                }
            );

            responseData.user = {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status,
                reputation: 0,
                token: token
            };
        }

        // Log successful registration
        console.log(`New user registered: ${newUser.email} (${newUser.role}) - Status: ${userStatus}`);

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify(responseData)
        };

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific database errors
        if (error.code === '23505') { // Unique constraint violation
            if (error.constraint && error.constraint.includes('email')) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        error: 'Email già registrata'
                    })
                };
            }
            if (error.constraint && error.constraint.includes('username')) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        error: 'Username già in uso'
                    })
                };
            }
        }
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Errore interno del server. Riprova più tardi.'
            })
        };
    }
};
