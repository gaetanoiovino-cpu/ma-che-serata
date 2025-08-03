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
            // Get all users with extended info
            const { data: users, error } = await supabase
                .from('users')
                .select(`
                    id, username, email, user_type, account_status, 
                    trial_expires_at, created_at, professional_info,
                    reputation, instagram_handle, last_login
                `)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }

            // Calculate trial status for each user
            const usersWithStatus = users.map(user => {
                let status = user.account_status;
                let trialStatus = null;
                
                if (user.account_status === 'trial_period' && user.trial_expires_at) {
                    const trialExpiry = new Date(user.trial_expires_at);
                    const now = new Date();
                    const hoursLeft = Math.max(0, Math.floor((trialExpiry - now) / (1000 * 60 * 60)));
                    
                    if (hoursLeft > 0) {
                        trialStatus = `${hoursLeft}h rimanenti`;
                    } else {
                        trialStatus = 'Scaduto';
                        status = 'pending_validation';
                    }
                }

                return {
                    ...user,
                    status,
                    trialStatus,
                    professional_details: user.professional_info ? JSON.parse(user.professional_info) : null
                };
            });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    users: usersWithStatus
                })
            };
        }

        if (event.httpMethod === 'PUT') {
            // Update user status/validation
            const { userId, action, notes } = JSON.parse(event.body);

            if (!userId || !action) {
                throw new Error('Missing required fields: userId, action');
            }

            let updates = {};
            
            switch (action) {
                case 'approve':
                    updates = {
                        account_status: 'active',
                        trial_expires_at: null,
                        validation_notes: notes || null,
                        validated_at: new Date().toISOString()
                    };
                    break;
                    
                case 'reject':
                    updates = {
                        account_status: 'rejected',
                        validation_notes: notes || 'Account rejected by admin'
                    };
                    break;
                    
                case 'ban':
                    updates = {
                        account_status: 'banned',
                        validation_notes: notes || 'Account banned by admin'
                    };
                    break;
                    
                case 'extend_trial':
                    const newExpiry = new Date();
                    newExpiry.setHours(newExpiry.getHours() + 48);
                    updates = {
                        account_status: 'trial_period',
                        trial_expires_at: newExpiry.toISOString(),
                        validation_notes: notes || 'Trial extended by admin'
                    };
                    break;
                    
                default:
                    throw new Error('Invalid action');
            }

            const { data, error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', userId)
                .select('username, email, account_status')
                .single();

            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: `User ${action} successfully`,
                    user: data
                })
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
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