const nodemailer = require('nodemailer');

class EmailSender {
    constructor() {
        // Determine secure setting based on port
        const port = parseInt(process.env.EMAIL_PORT) || 587;
        const isSecure = port === 465; // true for port 465, false for others
        
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: port,
            secure: isSecure, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            // Add timeouts to prevent hanging
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,
            socketTimeout: 15000,
            
            // Add this for better error messages
            debug: process.env.NODE_ENV === 'development',
            logger: process.env.NODE_ENV === 'development'
        });

        // Test connection on initialization
        this.verifyConnection();
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Email transporter is ready');
        } catch (error) {
            console.error('❌ Email transporter verification failed:', error.message);
        }
    }

    async sendReservationEmail(toEmail, reservationData) {
        try {
            console.log(`📧 Preparing emails for reservation #${reservationData.reservationId}...`);
            
            // Validate required data
            if (!toEmail) {
                throw new Error('Recipient email is required');
            }

            // Email to company
            const companyMailOptions = {
                from: `"Vicky's Resort Reservations" <${process.env.EMAIL_USER}>`,
                to: process.env.COMPANY_EMAIL || process.env.EMAIL_USER, // Send to yourself if company email not set
                subject: `📅 New Reservation #${reservationData.reservationId} - ${reservationData.fullName}`,
                html: this.generateCompanyEmailHTML(reservationData),
                // Add headers for better email tracking
                headers: {
                    'X-Reservation-ID': reservationData.reservationId,
                    'X-Priority': '1'
                }
            };

            // Email to customer
            const userMailOptions = {
                from: `"Vicky's Resort" <${process.env.EMAIL_USER}>`,
                to: toEmail,
                subject: `✅ Reservation Confirmation #${reservationData.reservationId}`,
                html: this.generateUserEmailHTML(reservationData),
                headers: {
                    'X-Reservation-ID': reservationData.reservationId
                }
            };

            // Send both emails concurrently
            console.log('📤 Sending company notification...');
            const companyResult = await this.transporter.sendMail(companyMailOptions);
            console.log(`✅ Company email sent: ${companyResult.messageId}`);

            console.log('📤 Sending customer confirmation...');
            const userResult = await this.transporter.sendMail(userMailOptions);
            console.log(`✅ Customer email sent: ${userResult.messageId}`);

            return {
                success: true,
                companyEmailId: companyResult.messageId,
                customerEmailId: userResult.messageId
            };
            
        } catch (error) {
            console.error('❌ Email sending failed:', error);
            
            // Provide more helpful error messages
            if (error.code === 'ECONNECTION') {
                console.error('   - Check your internet connection');
                console.error('   - Verify EMAIL_HOST is correct');
            } else if (error.code === 'EAUTH') {
                console.error('   - Check EMAIL_USER and EMAIL_PASS');
                console.error('   - For Gmail: Use App Password, not regular password');
                console.error('   - Enable 2-factor authentication first');
            } else if (error.code === 'ESOCKET') {
                console.error('   - Timeout - Check firewall or try different port');
            }
            
            throw error;
        }
    }

    // Add a method to send just one email (for testing)
    async sendTestEmail(toEmail) {
        try {
            const testMailOptions = {
                from: `"Vicky's Resort Test" <${process.env.EMAIL_USER}>`,
                to: toEmail || process.env.EMAIL_USER,
                subject: '🧪 Test Email from Vicky\'s Resort API',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background-color: #3498db; color: white; padding: 20px; text-align: center; }
                            .success { color: #27ae60; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>Email Test Successful!</h2>
                            </div>
                            <div class="content">
                                <p class="success">✅ Your email configuration is working!</p>
                                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                                <p><strong>Server:</strong> ${process.env.NODE_ENV || 'development'}</p>
                                <p><strong>Email User:</strong> ${process.env.EMAIL_USER}</p>
                                <p><strong>Email Host:</strong> ${process.env.EMAIL_HOST || 'smtp.gmail.com'}</p>
                                <p><strong>Email Port:</strong> ${process.env.EMAIL_PORT || 587}</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            const result = await this.transporter.sendMail(testMailOptions);
            console.log('✅ Test email sent:', result.messageId);
            return result;
            
        } catch (error) {
            console.error('❌ Test email failed:', error);
            throw error;
        }
    }

    generateCompanyEmailHTML(reservation) {
        // Format dates
        const checkInDate = new Date(reservation.checkIn).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const checkOutDate = new Date(reservation.checkOut).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Calculate number of nights
        const nights = Math.ceil((new Date(reservation.checkOut) - new Date(reservation.checkIn)) / (1000 * 60 * 60 * 24));

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .reservation-id { background: #f0f0f0; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 5px; margin: 20px 0; }
                .details { margin: 30px 0; }
                .detail-row { display: flex; padding: 10px; border-bottom: 1px solid #eee; }
                .detail-label { font-weight: bold; width: 40%; color: #555; }
                .detail-value { width: 60%; }
                .payment-info { background: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0; }
                .amount { font-size: 20px; color: #27ae60; font-weight: bold; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
                .badge { display: inline-block; padding: 5px 10px; background: #3498db; color: white; border-radius: 3px; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Reservation Received</h1>
                    <p>${new Date().toLocaleString()}</p>
                </div>
                <div class="content">
                    <div class="reservation-id">
                        #${reservation.reservationId}
                    </div>
                    
                    <h3>Guest Information</h3>
                    <div class="details">
                        <div class="detail-row">
                            <div class="detail-label">Full Name:</div>
                            <div class="detail-value">${reservation.fullName}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Email:</div>
                            <div class="detail-value">${reservation.email}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Phone:</div>
                            <div class="detail-value">${reservation.phoneNumber}</div>
                        </div>
                    </div>

                    <h3>Reservation Details</h3>
                    <div class="details">
                        <div class="detail-row">
                            <div class="detail-label">Room:</div>
                            <div class="detail-value">${reservation.roomName} <span class="badge">${nights} night${nights > 1 ? 's' : ''}</span></div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Check-in:</div>
                            <div class="detail-value">${checkInDate}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Check-out:</div>
                            <div class="detail-value">${checkOutDate}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Guests:</div>
                            <div class="detail-value">${reservation.guestQuantity}</div>
                        </div>
                        ${reservation.request ? `
                        <div class="detail-row">
                            <div class="detail-label">Special Request:</div>
                            <div class="detail-value">${reservation.request}</div>
                        </div>
                        ` : ''}
                    </div>

                    <h3>Payment Information</h3>
                    <div class="payment-info">
                        <div class="detail-row">
                            <div class="detail-label">Payment Method:</div>
                            <div class="detail-value">${reservation.paymentMethod || 'Not specified'}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Total Amount:</div>
                            <div class="detail-value amount">₱${parseFloat(reservation.totalAmount).toLocaleString()}</div>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated notification from your reservation system.</p>
                        <p>© ${new Date().getFullYear()} Vicky's Resort. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    generateUserEmailHTML(reservation) {
        // Format dates
        const checkInDate = new Date(reservation.checkIn).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const checkOutDate = new Date(reservation.checkOut).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Calculate number of nights
        const nights = Math.ceil((new Date(reservation.checkOut) - new Date(reservation.checkIn)) / (1000 * 60 * 60 * 24));

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
                .header { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .confirmation { text-align: center; margin: 30px 0; }
                .confirmation-number { font-size: 28px; font-weight: bold; color: #27ae60; letter-spacing: 2px; }
                .details { margin: 30px 0; }
                .detail-box { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 15px 0; }
                .detail-row { display: flex; padding: 8px; border-bottom: 1px solid #eee; }
                .detail-label { font-weight: bold; width: 40%; color: #555; }
                .detail-value { width: 60%; }
                .payment-info { background: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0; }
                .amount { font-size: 24px; color: #27ae60; font-weight: bold; }
                .button { display: inline-block; padding: 12px 30px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .contact-info { background: #f0f0f0; padding: 20px; border-radius: 5px; margin-top: 30px; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
                .important-note { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Reservation Confirmed!</h1>
                    <p>Thank you for choosing Vicky's Resort</p>
                </div>
                <div class="content">
                    <div class="confirmation">
                        <p>Your reservation number is:</p>
                        <div class="confirmation-number">#${reservation.reservationId}</div>
                    </div>
                    
                    <p>Dear <strong>${reservation.fullName}</strong>,</p>
                    <p>We are pleased to confirm your reservation at Vicky's Resort. Here are your booking details:</p>

                    <div class="detail-box">
                        <h3>🏨 Room Details</h3>
                        <div class="detail-row">
                            <div class="detail-label">Room Type:</div>
                            <div class="detail-value"><strong>${reservation.roomName}</strong></div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Number of Nights:</div>
                            <div class="detail-value">${nights} night${nights > 1 ? 's' : ''}</div>
                        </div>
                    </div>

                    <div class="detail-box">
                        <h3>📅 Stay Dates</h3>
                        <div class="detail-row">
                            <div class="detail-label">Check-in:</div>
                            <div class="detail-value">${checkInDate}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Check-out:</div>
                            <div class="detail-value">${checkOutDate}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Guests:</div>
                            <div class="detail-value">${reservation.guestQuantity}</div>
                        </div>
                    </div>

                    <div class="detail-box">
                        <h3>💰 Payment Summary</h3>
                        <div class="detail-row">
                            <div class="detail-label">Payment Method:</div>
                            <div class="detail-value">${reservation.paymentMethod || 'To be paid at check-in'}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Total Amount:</div>
                            <div class="detail-value amount">₱${parseFloat(reservation.totalAmount).toLocaleString()}</div>
                        </div>
                    </div>

                    ${reservation.request ? `
                    <div class="important-note">
                        <strong>📝 Your Special Request:</strong>
                        <p>${reservation.request}</p>
                        <p><small>We will do our best to accommodate your request.</small></p>
                    </div>
                    ` : ''}

                    <div class="contact-info">
                        <h4>📞 Need Assistance?</h4>
                        <p>If you have any questions or need to modify your reservation, please contact us:</p>
                        <p>📧 Email: <a href="mailto:${process.env.COMPANY_EMAIL || 'reservations@vickysresort.com'}">${process.env.COMPANY_EMAIL || 'reservations@vickysresort.com'}</a></p>
                        <p>📞 Phone: ${process.env.COMPANY_PHONE || '(123) 456-7890'}</p>
                        <p>🕒 Office Hours: ${process.env.BUSINESS_HOURS || 'Monday - Saturday, 9:00 AM - 6:00 PM'}</p>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <p><strong>We look forward to welcoming you!</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated confirmation email. Please do not reply to this message.</p>
                        <p>© ${new Date().getFullYear()} Vicky's Resort. All rights reserved.</p>
                        <p>${process.env.COMPANY_ADDRESS || '123 Beach Road, Paradise Island'}</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

module.exports = new EmailSender();