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
        const { 
            username, email, password, user_type, instagram,
            professional_info, business_name, business_type, business_address,
            business_phone, business_website, business_description
        } = JSON.parse(event.body);
        
        if (!username || !email || !password || !user_type) {
            const missingFields = [];
            if (!username) missingFields.push('username');
            if (!email) missingFields.push('email');
            if (!password) missingFields.push('password');
            if (!user_type) missingFields.push('user_type');
            throw new Error(`Campi obbligatori mancanti: ${missingFields.join(', ')}`);
        }

        // Initialize Supabase with SERVICE ROLE (per scrivere nel database)
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE
        );

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Determine account status based on user type
        let account_status;
        let trial_expires_at = null;

        if (user_type === 'matcher') {
            account_status = 'active'; // Matcher accounts are immediately active
        } else {
            // Professional accounts start with 48h trial period
            account_status = 'trial_period';
            trial_expires_at = new Date();
            trial_expires_at.setHours(trial_expires_at.getHours() + 48);
        }

        // Prepare professional info if provided
        let professionalInfoJson = null;
        if (professional_info || business_name) {
            professionalInfoJson = JSON.stringify({
                business_name: business_name || null,
                business_type: business_type || null,
                business_address: business_address || null,
                business_phone: business_phone || null,
                business_website: business_website || null,
                business_description: business_description || null,
                ...professional_info
            });
        }

        // Insert user
        const { data, error } = await supabase
            .from('users')
            .insert([{
                username,
                email,
                password_hash: passwordHash,
                user_type,
                account_status,
                trial_expires_at: trial_expires_at ? trial_expires_at.toISOString() : null,
                instagram_handle: instagram || null,
                professional_info: professionalInfoJson,
                reputation: 0
            }])
            .select('username, email, user_type, account_status, trial_expires_at')
            .single();

        if (error) {
            throw new Error(`Errore database: ${error.message}`);
        }

        // Create appropriate success message
        let message = 'Registrazione completata con successo! 🎉';
        if (account_status === 'trial_period') {
            message = '🎉 Registrazione completata! Hai 48 ore di prova gratuita per testare la piattaforma. Per continuare dopo, il tuo account dovrà essere validato da un admin.';
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message,
                user: data,
                trial_info: account_status === 'trial_period' ? {
                    expires_at: trial_expires_at.toISOString(),
                    hours_remaining: 48
                } : null
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
