const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { username, email, password, role, instagram } = JSON.parse(event.body);
        
        if (!username || !email || !password || !role) {
            throw new Error('Campi obbligatori mancanti');
        }

        // Initialize Supabase with SERVICE ROLE (per scrivere nel database)
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE
        );

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert user
        const { data, error } = await supabase
            .from('users')
            .insert([{
                username,
                email,
                password_hash: passwordHash,
                role,
                status: 'active',
                instagram_handle: instagram || null,
                reputation: 0
            }])
            .select('username, email, role, status')
            .single();

        if (error) {
            throw new Error(`Errore database: ${error.message}`);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Registrazione completata con successo! 🎉',
                user: data
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: error.message
            })
        };
    }
};
