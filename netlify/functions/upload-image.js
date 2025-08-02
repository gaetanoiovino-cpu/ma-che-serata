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
        const contentType = event.headers['content-type'] || event.headers['Content-Type'];
        
        if (!contentType || !contentType.includes('multipart/form-data')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid content type. Expected multipart/form-data' })
            };
        }

        const boundary = contentType.split('boundary=')[1];
        if (!boundary) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'No boundary found in content-type' })
            };
        }

        // Decode base64 body if needed
        const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('binary') : event.body;
        const parts = body.split(`--${boundary}`);
        
        let fileData = null;
        let fileName = 'uploaded-image';
        let fileContentType = 'image/jpeg';
        
        for (const part of parts) {
            if (part.includes('Content-Disposition: form-data; name="file"')) {
                const lines = part.split('\r\n');
                const headerEnd = lines.findIndex(line => line === '');
                
                // Extract headers
                const headers = lines.slice(0, headerEnd);
                const dispositionLine = headers.find(line => line.includes('Content-Disposition'));
                const contentTypeLine = headers.find(line => line.includes('Content-Type'));
                
                // Extract filename
                if (dispositionLine) {
                    const filenameMatch = dispositionLine.match(/filename="([^"]+)"/);
                    fileName = filenameMatch ? filenameMatch[1] : 'uploaded-image';
                }
                
                // Extract content type
                if (contentTypeLine) {
                    fileContentType = contentTypeLine.split(':')[1].trim();
                }
                
                // Extract file content (skip empty lines at the end)
                const fileContent = lines.slice(headerEnd + 1).join('\r\n');
                const cleanContent = fileContent.replace(/\r\n$/, ''); // Remove trailing newlines
                
                fileData = event.isBase64Encoded ? 
                    Buffer.from(cleanContent, 'binary') : 
                    Buffer.from(cleanContent, 'utf8');
                break;
            }
        }

        if (!fileData || fileData.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'No file data found or file is empty' })
            };
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = fileName.split('.').pop() || 'jpg';
        const uniqueFileName = `flir2night/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('post-images')
            .upload(uniqueFileName, fileData, {
                contentType: fileContentType,
                upsert: false
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
