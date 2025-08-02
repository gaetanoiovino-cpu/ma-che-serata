const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE
        );

        // For now, we'll use a mock user ID. In production, this should come from authentication
        const userId = 'mock-user-id-123'; // TODO: Get from JWT token

        // Get user profile
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No profile found
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        profile: null,
                        message: 'No profile found'
                    })
                };
            }
            throw new Error(`Database error: ${error.message}`);
        }

        // Parse interests from JSON
        const parsedProfile = {
            ...profile,
            interests: JSON.parse(profile.interests || '[]')
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                profile: parsedProfile
            })
        };

    } catch (error) {
        console.error('Get profile error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};