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
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE
        );

        // Parse multipart form data
        const boundary = event.headers['content-type'].split('boundary=')[1];
        const parts = event.body.split(`--${boundary}`);
        
        let fileData = null;
        let fileName = null;
        
        for (const part of parts) {
            if (part.includes('Content-Disposition: form-data; name="file"')) {
                const lines = part.split('\r\n');
                const headerEnd = lines.findIndex(line => line === '');
                const fileContent = lines.slice(headerEnd + 1, -1).join('\r\n');
                
                // Extract filename
                const dispositionLine = lines.find(line => line.includes('Content-Disposition'));
                const filenameMatch = dispositionLine.match(/filename="([^"]+)"/);
                fileName = filenameMatch ? filenameMatch[1] : 'uploaded-image';
                
                // Convert base64 to buffer if needed
                fileData = Buffer.from(fileContent, 'binary');
                break;
            }
        }

        if (!fileData) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'No file data found' })
            };
        }

        // Generate unique filename
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('post-images')
            .upload(uniqueFileName, fileData, {
                contentType: event.headers['content-type'] || 'image/jpeg'
            });

        if (error) {
            console.error('Upload error:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: error.message })
            };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('post-images')
            .getPublicUrl(uniqueFileName);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                url: publicUrl,
                filename: uniqueFileName 
            })
        };

    } catch (error) {
        console.error('Upload function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
