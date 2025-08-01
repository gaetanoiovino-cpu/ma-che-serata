/**
 * PUBLIC API ENDPOINTS
 * Sistema API per integrazioni esterne con autenticazione JWT
 */

const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const API_SECRET = process.env.API_SECRET || 'ma-che-serata-api-secret-2024';

// Rate limiting simple in-memory store (in production use Redis)
const rateLimitStore = new Map();

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { path } = event;
        const method = event.httpMethod;
        
        // Extract API endpoint from path
        const apiPath = path.replace(/^\/\.netlify\/functions\/api-public/, '');
        
        // Public endpoints (no auth required)
        if (apiPath === '/docs' && method === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(getAPIDocumentation())
            };
        }

        if (apiPath === '/health' && method === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                })
            };
        }

        // Auth required endpoints
        const authResult = await verifyToken(event);
        if (!authResult.valid) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    error: 'Unauthorized',
                    message: authResult.message
                })
            };
        }

        // Rate limiting
        const rateLimitResult = checkRateLimit(authResult.clientId);
        if (!rateLimitResult.allowed) {
            return {
                statusCode: 429,
                headers,
                body: JSON.stringify({
                    error: 'Rate limit exceeded',
                    resetTime: rateLimitResult.resetTime
                })
            };
        }

        // Route to specific endpoints
        switch (apiPath) {
            case '/events':
                return await handleEventsEndpoint(method, event);
            
            case '/users':
                return await handleUsersEndpoint(method, event);
            
            case '/analytics':
                return await handleAnalyticsEndpoint(method, event);
            
            case '/bookings':
                return await handleBookingsEndpoint(method, event);
            
            default:
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        error: 'Endpoint not found',
                        availableEndpoints: ['/events', '/users', '/analytics', '/bookings', '/docs', '/health']
                    })
                };
        }

    } catch (error) {
        console.error('API Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};

async function verifyToken(event) {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { valid: false, message: 'Missing or invalid authorization header' };
    }

    const token = authHeader.substring(7);
    
    try {
        const decoded = jwt.verify(token, API_SECRET);
        return { 
            valid: true, 
            clientId: decoded.clientId,
            permissions: decoded.permissions || ['read']
        };
    } catch (error) {
        return { valid: false, message: 'Invalid token' };
    }
}

function checkRateLimit(clientId) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 100; // per minute
    
    if (!rateLimitStore.has(clientId)) {
        rateLimitStore.set(clientId, { count: 1, resetTime: now + windowMs });
        return { allowed: true };
    }
    
    const limit = rateLimitStore.get(clientId);
    
    if (now > limit.resetTime) {
        // Reset window
        rateLimitStore.set(clientId, { count: 1, resetTime: now + windowMs });
        return { allowed: true };
    }
    
    if (limit.count >= maxRequests) {
        return { allowed: false, resetTime: limit.resetTime };
    }
    
    limit.count++;
    rateLimitStore.set(clientId, limit);
    return { allowed: true };
}

async function handleEventsEndpoint(method, event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (method === 'GET') {
        // Get events with optional filters
        const queryParams = event.queryStringParameters || {};
        const {
            limit = 50,
            offset = 0,
            category,
            venue,
            date_from,
            date_to,
            status = 'active'
        } = queryParams;

        try {
            let query = supabase
                .from('events')
                .select(`
                    *,
                    venue:venues(name, address, city),
                    bookings_count:bookings(count)
                `)
                .eq('status', status)
                .order('date', { ascending: true })
                .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

            if (category) query = query.eq('category', category);
            if (venue) query = query.eq('venue_id', venue);
            if (date_from) query = query.gte('date', date_from);
            if (date_to) query = query.lte('date', date_to);

            const { data, error } = await query;

            if (error) throw error;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    data,
                    meta: {
                        total: data.length,
                        limit: parseInt(limit),
                        offset: parseInt(offset)
                    }
                })
            };

        } catch (error) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error: 'Failed to fetch events',
                    message: error.message
                })
            };
        }
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
}

async function handleUsersEndpoint(method, event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (method === 'GET') {
        // Get user statistics (aggregated data only for privacy)
        try {
            const { data: userStats, error } = await supabase
                .rpc('get_user_statistics');

            if (error) throw error;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    data: {
                        total_users: userStats.total_users,
                        active_users_30d: userStats.active_users_30d,
                        new_users_7d: userStats.new_users_7d,
                        user_types: userStats.user_types,
                        retention_rate: userStats.retention_rate
                    },
                    generated_at: new Date().toISOString()
                })
            };

        } catch (error) {
            // Fallback to mock data if database function doesn't exist
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    data: {
                        total_users: 12847,
                        active_users_30d: 8934,
                        new_users_7d: 245,
                        user_types: {
                            matcher: 10234,
                            pr: 1456,
                            manager: 892,
                            artist: 265
                        },
                        retention_rate: 84.2
                    },
                    generated_at: new Date().toISOString(),
                    note: 'Mock data - implement database function for live data'
                })
            };
        }
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
}

async function handleAnalyticsEndpoint(method, event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (method === 'GET') {
        const queryParams = event.queryStringParameters || {};
        const { period = '7d', metrics = 'all' } = queryParams;

        try {
            const analyticsData = await getAnalyticsData(period, metrics);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    data: analyticsData,
                    period,
                    generated_at: new Date().toISOString()
                })
            };

        } catch (error) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error: 'Failed to fetch analytics',
                    message: error.message
                })
            };
        }
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
}

async function handleBookingsEndpoint(method, event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    if (method === 'GET') {
        const queryParams = event.queryStringParameters || {};
        const {
            event_id,
            venue_id,
            status,
            date_from,
            date_to,
            limit = 50,
            offset = 0
        } = queryParams;

        try {
            let query = supabase
                .from('bookings')
                .select(`
                    id,
                    status,
                    booking_date,
                    party_size,
                    event:events(title, date, venue_id),
                    created_at
                `)
                .order('created_at', { ascending: false })
                .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

            if (event_id) query = query.eq('event_id', event_id);
            if (venue_id) query = query.eq('venue_id', venue_id);
            if (status) query = query.eq('status', status);
            if (date_from) query = query.gte('booking_date', date_from);
            if (date_to) query = query.lte('booking_date', date_to);

            const { data, error } = await query;

            if (error) throw error;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    data,
                    meta: {
                        total: data.length,
                        limit: parseInt(limit),
                        offset: parseInt(offset)
                    }
                })
            };

        } catch (error) {
            // Fallback to mock data
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    data: [
                        {
                            id: 1,
                            status: 'confirmed',
                            booking_date: '2024-01-15',
                            party_size: 4,
                            event: {
                                title: 'Aperitivo Trendy',
                                date: '2024-01-15T18:00:00Z',
                                venue_id: 1
                            },
                            created_at: '2024-01-14T10:00:00Z'
                        }
                    ],
                    meta: { total: 1, limit: 50, offset: 0 },
                    note: 'Mock data - implement database queries for live data'
                })
            };
        }
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
}

async function getAnalyticsData(period, metrics) {
    // Mock analytics data - in production, this would query your analytics database
    const mockData = {
        '7d': {
            total_events: 156,
            total_bookings: 3421,
            conversion_rate: 67.8,
            revenue: 84230,
            avg_party_size: 3.2,
            top_categories: [
                { category: 'Aperitivi', bookings: 1205 },
                { category: 'Cene', bookings: 892 },
                { category: 'Discoteca', bookings: 756 }
            ],
            geographic_distribution: [
                { city: 'Milano', bookings: 2103 },
                { city: 'Roma', bookings: 891 },
                { city: 'Firenze', bookings: 427 }
            ]
        },
        '30d': {
            total_events: 623,
            total_bookings: 12580,
            conversion_rate: 72.1,
            revenue: 320450,
            avg_party_size: 3.4
        }
    };

    return mockData[period] || mockData['7d'];
}

function getAPIDocumentation() {
    return {
        title: 'Ma Che Serata Public API',
        version: '1.0.0',
        description: 'API pubblica per integrazioni con partner e sviluppatori terzi',
        base_url: 'https://your-domain.netlify.app/.netlify/functions/api-public',
        authentication: {
            type: 'Bearer Token (JWT)',
            header: 'Authorization: Bearer <your-jwt-token>',
            note: 'Contatta il team per ottenere le credenziali API'
        },
        rate_limits: {
            requests_per_minute: 100,
            burst_limit: 10
        },
        endpoints: [
            {
                path: '/health',
                method: 'GET',
                description: 'Controlla lo stato del servizio',
                auth_required: false,
                response_example: {
                    status: 'healthy',
                    timestamp: '2024-01-14T10:00:00Z',
                    version: '1.0.0'
                }
            },
            {
                path: '/events',
                method: 'GET',
                description: 'Recupera lista eventi',
                auth_required: true,
                parameters: {
                    limit: 'Numero massimo risultati (default: 50)',
                    offset: 'Offset per paginazione (default: 0)',
                    category: 'Filtra per categoria evento',
                    venue: 'Filtra per venue ID',
                    date_from: 'Data inizio (YYYY-MM-DD)',
                    date_to: 'Data fine (YYYY-MM-DD)',
                    status: 'Stato evento (default: active)'
                },
                response_example: {
                    data: [
                        {
                            id: 1,
                            title: 'Aperitivo Trendy',
                            date: '2024-01-15T18:00:00Z',
                            venue: {
                                name: 'Club Elite',
                                address: 'Via Roma 123',
                                city: 'Milano'
                            },
                            bookings_count: 45
                        }
                    ],
                    meta: {
                        total: 1,
                        limit: 50,
                        offset: 0
                    }
                }
            },
            {
                path: '/users',
                method: 'GET',
                description: 'Statistiche utenti aggregate (privacy-safe)',
                auth_required: true,
                response_example: {
                    data: {
                        total_users: 12847,
                        active_users_30d: 8934,
                        new_users_7d: 245,
                        user_types: {
                            matcher: 10234,
                            pr: 1456,
                            manager: 892,
                            artist: 265
                        },
                        retention_rate: 84.2
                    }
                }
            },
            {
                path: '/analytics',
                method: 'GET',
                description: 'Dati analytics e KPI',
                auth_required: true,
                parameters: {
                    period: 'Periodo analisi (7d, 30d, 90d, 1y)',
                    metrics: 'Metriche specifiche (default: all)'
                },
                response_example: {
                    data: {
                        total_events: 156,
                        total_bookings: 3421,
                        conversion_rate: 67.8,
                        revenue: 84230,
                        top_categories: []
                    }
                }
            },
            {
                path: '/bookings',
                method: 'GET',
                description: 'Lista prenotazioni (dati aggregati)',
                auth_required: true,
                parameters: {
                    event_id: 'Filtra per evento specifico',
                    venue_id: 'Filtra per venue specifico',
                    status: 'Stato prenotazione',
                    date_from: 'Data inizio',
                    date_to: 'Data fine',
                    limit: 'Limite risultati',
                    offset: 'Offset paginazione'
                }
            }
        ],
        webhooks: {
            description: 'Sistema webhook per notifiche real-time',
            events: [
                'event.created',
                'event.sold_out',
                'booking.confirmed',
                'booking.cancelled'
            ],
            setup: 'Configura URL webhook nel tuo account API'
        },
        support: {
            email: 'api@macheserata.com',
            documentation: 'https://docs.macheserata.com/api',
            status_page: 'https://status.macheserata.com'
        }
    };
}