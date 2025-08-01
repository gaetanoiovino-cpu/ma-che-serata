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

    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE
        );

        if (event.httpMethod === 'GET') {
            // Get all posts
            const { data: posts, error } = await supabase
                .from('forum_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, posts })
            };
        }

        if (event.httpMethod === 'POST') {
            // Create new post
            const postData = JSON.parse(event.body);
            
            const { data: savedPost, error } = await supabase
                .from('forum_posts')
                .insert([postData])
                .select()
                .single();

            if (error) throw error;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, post: savedPost })
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('Forum posts error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
