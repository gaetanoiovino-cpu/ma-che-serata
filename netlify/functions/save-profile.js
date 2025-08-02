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

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { description, interests, profile_photo } = JSON.parse(event.body);
        
        // Validate input
        if (!description || description.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Description is required' })
            };
        }

        if (description.length > 120) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Description cannot exceed 120 characters' })
            };
        }

        if (interests && interests.length > 5) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Cannot select more than 5 interests' })
            };
        }

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE
        );

        // For now, we'll use a mock user ID. In production, this should come from authentication
        const userId = 'mock-user-id-123'; // TODO: Get from JWT token

        // Check if profile already exists
        const { data: existingProfile, error: fetchError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        let result;
        
        if (existingProfile) {
            // Update existing profile
            const { data, error } = await supabase
                .from('user_profiles')
                .update({
                    description,
                    interests: JSON.stringify(interests || []),
                    profile_photo,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                throw new Error(`Database update error: ${error.message}`);
            }
            result = data;
        } else {
            // Create new profile
            const { data, error } = await supabase
                .from('user_profiles')
                .insert([{
                    user_id: userId,
                    description,
                    interests: JSON.stringify(interests || []),
                    profile_photo,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) {
                throw new Error(`Database insert error: ${error.message}`);
            }
            result = data;
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Profile saved successfully',
                profile: {
                    ...result,
                    interests: JSON.parse(result.interests || '[]')
                }
            })
        };

    } catch (error) {
        console.error('Save profile error:', error);
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