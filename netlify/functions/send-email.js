const nodemailer = require('nodemailer');
const { authenticateUser } = require('./auth-login');

// Email templates
const emailTemplates = {
    welcome: (username) => ({
        subject: '🍸 Benvenuto in Ma Che Serata!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #667eea;">Ciao ${username}! 👋</h1>
                <p>Benvenuto nella community di Ma Che Serata!</p>
                <p>Inizia subito a scoprire eventi fantastici nella tua città.</p>
            </div>
        `
    }),
    
    eventReminder: (username, eventTitle, eventDate) => ({
        subject: `🎭 Reminder: ${eventTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #667eea;">Ciao ${username}!</h1>
                <p>Ti ricordiamo che hai prenotato per l'evento:</p>
                <h2 style="color: #764ba2;">${eventTitle}</h2>
                <p><strong>Data:</strong> ${eventDate}</p>
                <p>Non vediamo l'ora di vederti! 🎉</p>
            </div>
        `
    }),
    
    bookingConfirmation: (username, eventTitle, bookingId) => ({
        subject: `✅ Prenotazione Confermata - ${eventTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #22c55e;">Prenotazione Confermata! ✅</h1>
                <p>Ciao ${username},</p>
                <p>La tua prenotazione è stata confermata per:</p>
                <h2 style="color: #667eea;">${eventTitle}</h2>
                <p><strong>ID Prenotazione:</strong> ${bookingId}</p>
                <p>Ti aspettiamo! 🍸</p>
            </div>
        `
    }),
    
    passwordReset: (username, resetLink) => ({
        subject: '🔐 Reset Password - Ma Che Serata',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #667eea;">Reset Password</h1>
                <p>Ciao ${username},</p>
                <p>Hai richiesto il reset della password.</p>
                <p>Clicca sul link qui sotto per procedere:</p>
                <a href="${resetLink}" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Reset Password
                </a>
                <p><small>Il link scade in 1 ora.</small></p>
            </div>
        `
    }),

    prenotaInsieme: (username, eventTitle, groupInfo) => ({
        subject: `👥 Nuovo Gruppo "Prenota Insieme" - ${eventTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #667eea;">Nuovo Gruppo Formato! 👥</h1>
                <p>Ciao ${username},</p>
                <p>È stato formato un nuovo gruppo "Prenota Insieme" per:</p>
                <h2 style="color: #764ba2;">${eventTitle}</h2>
                <p><strong>Membri del gruppo:</strong> ${groupInfo.members}</p>
                <p><strong>Data evento:</strong> ${groupInfo.eventDate}</p>
                <p>Preparati per una serata fantastica con nuovi amici! 🎉</p>
            </div>
        `
    }),

    forumNotification: (username, postTitle, author) => ({
        subject: `💬 Nuovo post in Flir2night: ${postTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #667eea;">Nuovo Post su Flir2night! 💬</h1>
                <p>Ciao ${username},</p>
                <p><strong>${author}</strong> ha pubblicato un nuovo post:</p>
                <h2 style="color: #764ba2;">${postTitle}</h2>
                <p>Vai su Flir2night per partecipare alla discussione!</p>
                <a href="https://ma-che-serata.netlify.app/flir2night.html" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Vai al Forum
                </a>
            </div>
        `
    })
};

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    // Only allow POST method
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                error: 'Method not allowed. Use POST.'
            })
        };
    }

    try {
        // Parse request body
        const { 
            to, 
            template, 
            templateData, 
            customSubject, 
            customHtml,
            requireAuth = false 
        } = JSON.parse(event.body);

        // Authenticate user if required
        if (requireAuth) {
            try {
                await authenticateUser(event);
            } catch (error) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({
                        error: 'Authentication required'
                    })
                };
            }
        }

        // Validate required fields
        if (!to) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Recipient email is required'
                })
            };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Invalid email format'
                })
            };
        }

        let subject, html;

        // Use template or custom content
        if (template && emailTemplates[template]) {
            const templateContent = emailTemplates[template](...(templateData || []));
            subject = templateContent.subject;
            html = templateContent.html;
        } else if (customSubject && customHtml) {
            subject = customSubject;
            html = customHtml;
        } else {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Either template or custom subject/html is required'
                })
            };
        }

        // Create transporter
        const transporter = createTransporter();

        // Email options
        const mailOptions = {
            from: `"Ma Che Serata" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log(`Email sent successfully to ${to}:`, info.messageId);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Email sent successfully',
                messageId: info.messageId
            })
        };

    } catch (error) {
        console.error('Email sending error:', error);
        
        // Handle specific email errors
        if (error.code === 'EAUTH') {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error: 'Email authentication failed. Check email configuration.'
                })
            };
        }

        if (error.code === 'ECONNECTION') {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error: 'Email server connection failed. Try again later.'
                })
            };
        }
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to send email',
                message: error.message
            })
        };
    }
};

// Utility function to send bulk emails
const sendBulkEmails = async (recipients, template, templateData) => {
    const transporter = createTransporter();
    const results = [];

    for (const recipient of recipients) {
        try {
            const templateContent = emailTemplates[template](...templateData);
            
            const mailOptions = {
                from: `"Ma Che Serata" <${process.env.EMAIL_USER}>`,
                to: recipient.email,
                subject: templateContent.subject,
                html: templateContent.html
            };

            const info = await transporter.sendMail(mailOptions);
            results.push({
                email: recipient.email,
                success: true,
                messageId: info.messageId
            });
        } catch (error) {
            results.push({
                email: recipient.email,
                success: false,
                error: error.message
            });
        }
    }

    return results;
};

// Export utilities
module.exports = {
    handler: exports.handler,
    emailTemplates,
    sendBulkEmails,
    createTransporter
};
