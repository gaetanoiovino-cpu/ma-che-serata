const { query } = require('./database');
const { authenticateUser } = require('./auth-login');

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

    try {
        switch (event.httpMethod) {
            case 'GET':
                return await handleGetEvents(event, headers);
            case 'POST':
                return await handleCreateEvent(event, headers);
            case 'PUT':
                return await handleUpdateEvent(event, headers);
            case 'DELETE':
                return await handleDeleteEvent(event, headers);
            default:
                return {
                    statusCode: 405,
                    headers,
                    body: JSON.stringify({
                        error: 'Method not allowed'
                    })
                };
        }
    } catch (error) {
        console.error('Events API error:', error);
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

// Get events (with filtering and pagination)
async function handleGetEvents(event, headers) {
    try {
        const queryParams = event.queryStringParameters || {};
        const {
            page = 1,
            limit = 10,
            category,
            status = 'upcoming',
            venue_id,
            search,
            date_from,
            date_to,
            city = 'Milano'
        } = queryParams;

        let queryText = `
            SELECT 
                e.*,
                v.name as venue_name,
                v.address as venue_address,
                v.city as venue_city,
                u.username as created_by_username,
                COUNT(b.id) as bookings_count,
                AVG(r.rating) as average_rating
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            LEFT JOIN users u ON e.created_by = u.id
            LEFT JOIN bookings b ON e.id = b.event_id AND b.status = 'confirmed'
            LEFT JOIN reviews r ON e.id = r.event_id
            WHERE 1=1
        `;
        
        const queryValues = [];
        let paramCount = 0;

        // Add filters
        if (status) {
            paramCount++;
            queryText += ` AND e.status = $${paramCount}`;
            queryValues.push(status);
        }

        if (category) {
            paramCount++;
            queryText += ` AND e.category = $${paramCount}`;
            queryValues.push(category);
        }

        if (venue_id) {
            paramCount++;
            queryText += ` AND e.venue_id = $${paramCount}`;
            queryValues.push(venue_id);
        }

        if (city) {
            paramCount++;
            queryText += ` AND v.city ILIKE $${paramCount}`;
            queryValues.push(`%${city}%`);
        }

        if (search) {
            paramCount++;
            queryText += ` AND (e.title ILIKE $${paramCount} OR e.description ILIKE $${paramCount} OR v.name ILIKE $${paramCount})`;
            queryValues.push(`%${search}%`);
        }

        if (date_from) {
            paramCount++;
            queryText += ` AND e.event_date >= $${paramCount}`;
            queryValues.push(date_from);
        }

        if (date_to) {
            paramCount++;
            queryText += ` AND e.event_date <= $${paramCount}`;
            queryValues.push(date_to);
        }

        // Group by and order
        queryText += `
            GROUP BY e.id, v.name, v.address, v.city, u.username
            ORDER BY e.event_date ASC, e.created_at DESC
        `;

        // Add pagination
        const offset = (page - 1) * limit;
        paramCount++;
        queryText += ` LIMIT $${paramCount}`;
        queryValues.push(limit);
        
        paramCount++;
        queryText += ` OFFSET $${paramCount}`;
        queryValues.push(offset);

        const result = await query(queryText, queryValues);

        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(DISTINCT e.id) as total
            FROM events e
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE 1=1
        `;
        
        const countValues = [];
        let countParamCount = 0;

        // Add same filters for count
        if (status) {
            countParamCount++;
            countQuery += ` AND e.status = $${countParamCount}`;
            countValues.push(status);
        }

        if (category) {
            countParamCount++;
            countQuery += ` AND e.category = $${countParamCount}`;
            countValues.push(category);
        }

        if (venue_id) {
            countParamCount++;
            countQuery += ` AND e.venue_id = $${countParamCount}`;
            countValues.push(venue_id);
        }

        if (city) {
            countParamCount++;
            countQuery += ` AND v.city ILIKE $${countParamCount}`;
            countValues.push(`%${city}%`);
        }

        if (search) {
            countParamCount++;
            countQuery += ` AND (e.title ILIKE $${countParamCount} OR e.description ILIKE $${countParamCount} OR v.name ILIKE $${countParamCount})`;
            countValues.push(`%${search}%`);
        }

        if (date_from) {
            countParamCount++;
            countQuery += ` AND e.event_date >= $${countParamCount}`;
            countValues.push(date_from);
        }

        if (date_to) {
            countParamCount++;
            countQuery += ` AND e.event_date <= $${countParamCount}`;
            countValues.push(date_to);
        }

        const countResult = await query(countQuery, countValues);
        const total = parseInt(countResult.rows[0].total);

        // Process results to include computed fields
        const processedEvents = result.rows.map(event => ({
            ...event,
            bookings_count: parseInt(event.bookings_count) || 0,
            average_rating: event.average_rating ? parseFloat(event.average_rating).toFixed(1) : null,
            is_full: parseInt(event.bookings_count) >= event.max_attendees,
            spots_remaining: Math.max(0, event.max_attendees - parseInt(event.bookings_count))
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: processedEvents,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            })
        };

    } catch (error) {
        console.error('Get events error:', error);
        throw error;
    }
}

// Create new event
async function handleCreateEvent(event, headers) {
    try {
        // Authenticate user
        const user = await authenticateUser(event);
        
        // Only venues and admins can create events
        if (!['venue', 'admin'].includes(user.role)) {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({
                    error: 'Only venues and admins can create events'
                })
            };
        }

        const {
            title,
            description,
            event_date,
            event_time,
            price,
            max_attendees,
            category,
            venue_id,
            image_url,
            tags,
            requires_approval,
            age_restriction,
            dress_code
        } = JSON.parse(event.body);

        // Validate required fields
        if (!title || !event_date || !event_time || !venue_id) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Title, date, time, and venue are required'
                })
            };
        }

        // Validate event date is in the future
        const eventDateTime = new Date(`${event_date} ${event_time}`);
        if (eventDateTime <= new Date()) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Event date must be in the future'
                })
            };
        }

        // If user is a venue, they can only create events for their own venue
        if (user.role === 'venue') {
            const venueCheck = await query(
                'SELECT id FROM venues WHERE user_id = $1 AND id = $2',
                [user.id, venue_id]
            );
            
            if (venueCheck.rows.length === 0) {
                return {
                    statusCode: 403,
                    headers,
                    body: JSON.stringify({
                        error: 'You can only create events for your own venue'
                    })
                };
            }
        }

        // Check for venue availability (no overlapping events)
        const conflictCheck = await query(
            `SELECT id FROM events 
             WHERE venue_id = $1 AND event_date = $2 
             AND status NOT IN ('cancelled', 'ended')
             AND (
                 (event_time <= $3 AND ADDTIME(event_time, '4:00:00') > $3) OR
                 (event_time < ADDTIME($3, '4:00:00') AND event_time >= $3)
             )`,
            [venue_id, event_date, event_time]
        );

        if (conflictCheck.rows.length > 0) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({
                    error: 'Venue is already booked for this time slot'
                })
            };
        }

        // Insert new event
        const insertResult = await query(
            `INSERT INTO events (
                title, description, event_date, event_time, price, max_attendees,
                category, venue_id, image_url, tags, created_by, status, 
                requires_approval, age_restriction, dress_code,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
            RETURNING *`,
            [
                title,
                description || '',
                event_date,
                event_time,
                price || 0,
                max_attendees || 100,
                category || 'general',
                venue_id,
                image_url || null,
                tags ? JSON.stringify(tags) : null,
                user.id,
                'upcoming',
                requires_approval || false,
                age_restriction || null,
                dress_code || null
            ]
        );

        const newEvent = insertResult.rows[0];

        console.log(`New event created: ${newEvent.title} by user ${user.username}`);

        // Send notification to venue followers (if applicable)
        // This would be implemented with a separate notification system

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Event created successfully',
                data: newEvent
            })
        };

    } catch (error) {
        console.error('Create event error:', error);
        throw error;
    }
}

// Update event
async function handleUpdateEvent(event, headers) {
    try {
        // Authenticate user
        const user = await authenticateUser(event);
        
        const eventId = event.path.split('/').pop();
        const updateData = JSON.parse(event.body);

        // Check if event exists and user has permission
        const eventCheck = await query(
            'SELECT * FROM events WHERE id = $1',
            [eventId]
        );

        if (eventCheck.rows.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    error: 'Event not found'
                })
            };
        }

        const existingEvent = eventCheck.rows[0];

        // Only event creator or admin can update
        if (existingEvent.created_by !== user.id && user.role !== 'admin') {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({
                    error: 'You can only update your own events'
                })
            };
        }

        // Prevent updates to past events
        const eventDateTime = new Date(`${existingEvent.event_date} ${existingEvent.event_time}`);
        if (eventDateTime <= new Date() && existingEvent.status !== 'upcoming') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Cannot update past or ongoing events'
                })
            };
        }

        // Build update query dynamically
        const updateFields = [];
        const updateValues = [];
        let paramCount = 0;

        const allowedFields = [
            'title', 'description', 'event_date', 'event_time', 'price',
            'max_attendees', 'category', 'image_url', 'tags', 'status',
            'requires_approval', 'age_restriction', 'dress_code'
        ];

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                paramCount++;
                updateFields.push(`${field} = $${paramCount}`);
                updateValues.push(field === 'tags' ? JSON.stringify(updateData[field]) : updateData[field]);
            }
        }

        if (updateFields.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'No valid fields to update'
                })
            };
        }

        // Add updated_at
        paramCount++;
        updateFields.push(`updated_at = $${paramCount}`);
        updateValues.push(new Date());

        // Add event ID for WHERE clause
        paramCount++;
        updateValues.push(eventId);

        const updateQuery = `
            UPDATE events 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const updateResult = await query(updateQuery, updateValues);

        console.log(`Event updated: ${updateResult.rows[0].title} by user ${user.username}`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Event updated successfully',
                data: updateResult.rows[0]
            })
        };

    } catch (error) {
        console.error('Update event error:', error);
        throw error;
    }
}

// Delete event (soft delete)
async function handleDeleteEvent(event, headers) {
    try {
        // Authenticate user
        const user = await authenticateUser(event);
        
        const eventId = event.path.split('/').pop();

        // Check if event exists and user has permission
        const eventCheck = await query(
            'SELECT * FROM events WHERE id = $1',
            [eventId]
        );

        if (eventCheck.rows.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    error: 'Event not found'
                })
            };
        }

        const existingEvent = eventCheck.rows[0];

        // Only event creator or admin can delete
        if (existingEvent.created_by !== user.id && user.role !== 'admin') {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({
                    error: 'You can only delete your own events'
                })
            };
        }

        // Check if event has bookings
        const bookingsCheck = await query(
            'SELECT COUNT(*) as booking_count FROM bookings WHERE event_id = $1 AND status = $2',
            [eventId, 'confirmed']
        );

        const bookingCount = parseInt(bookingsCheck.rows[0].booking_count);

        if (bookingCount > 0) {
            // If event has bookings, just cancel it (soft delete)
            await query(
                'UPDATE events SET status = $1, updated_at = NOW() WHERE id = $2',
                ['cancelled', eventId]
            );

            // Here you would typically send cancellation emails to attendees
            console.log(`Event cancelled: ${existingEvent.title} (had ${bookingCount} bookings)`);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: `Event cancelled successfully. ${bookingCount} attendees will be notified.`
                })
            };
        } else {
            // If no bookings, actually delete the event
            await query('DELETE FROM events WHERE id = $1', [eventId]);
            
            console.log(`Event deleted: ${existingEvent.title} (no bookings)`);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Event deleted successfully'
                })
            };
        }

    } catch (error) {
        console.error('Delete event error:', error);
        throw error;
    }
}

// Export handler and utilities
module.exports = {
    handler: exports.handler,
    handleGetEvents,
    handleCreateEvent,
    handleUpdateEvent,
    handleDeleteEvent
};
