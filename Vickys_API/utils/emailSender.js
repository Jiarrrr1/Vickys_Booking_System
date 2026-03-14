const nodemailer = require('nodemailer');

class EmailSender {
 // In emailSender.js constructor
constructor() {    
    this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com' ,
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            servername: 'smtp.gmail.com',
            rejectUnauthorized: true
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
        debug: false,
        logger: false
    });
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
                to: process.env.COMPANY_EMAIL || process.env.EMAIL_USER,
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


async sendConfirmationEmail(toEmail, reservationData) {
    try {
        console.log(`📧 Sending confirmation email for reservation #${reservationData.reservationId}...`);
        
        if (!toEmail) {
            throw new Error('Recipient email is required');
        }

        // Email to customer only (confirmation)
        const userMailOptions = {
            from: `"Vicky's Resort" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `✅ Reservation Confirmed #${reservationData.reservationId}`,
            html: this.generateConfirmationEmailHTML(reservationData),
            headers: {
                'X-Reservation-ID': reservationData.reservationId,
                'X-Priority': '1'
            }
        };

        const result = await this.transporter.sendMail(userMailOptions);
        console.log(`✅ Confirmation email sent: ${result.messageId}`);

        return {
            success: true,
            messageId: result.messageId
        };
    } catch (error) {
        console.error('❌ Confirmation email failed:', error);
        throw error;
    }
}

generateConfirmationEmailHTML(reservation) {
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
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0;
                padding: 0;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: #f9f9f9;
                border: 1px solid #e0e0e0;
            }
            .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 40px; 
                text-align: center; 
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }
            .header p {
                margin: 10px 0 0;
                opacity: 0.9;
            }
            .content { 
                background: white; 
                padding: 40px; 
            }
            .confirmation-badge {
                text-align: center;
                margin-bottom: 30px;
            }
            .confirmation-badge span {
                background: #27ae60;
                color: white;
                padding: 8px 24px;
                border-radius: 30px;
                font-size: 14px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
            }
            .greeting strong {
                color: #667eea;
            }
            .reservation-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 24px;
                margin: 30px 0;
            }
            .reservation-id {
                text-align: center;
                font-size: 24px;
                font-weight: 700;
                color: #667eea;
                letter-spacing: 2px;
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 2px dashed #e2e8f0;
            }
            .details-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            .detail-item {
                text-align: center;
                padding: 15px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .detail-label {
                font-size: 12px;
                color: #718096;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
            }
            .detail-value {
                font-size: 16px;
                font-weight: 600;
                color: #2d3748;
            }
            .room-info {
                background: #ebf8ff;
                border: 1px solid #bee3f8;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .room-icon {
                font-size: 40px;
            }
            .room-details h3 {
                margin: 0 0 5px;
                color: #2c5282;
            }
            .room-details p {
                margin: 0;
                color: #2b6cb0;
            }
            .payment-summary {
                background: #f0fff4;
                border: 1px solid #9ae6b4;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .payment-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #c6f6d5;
            }
            .payment-row:last-child {
                border-bottom: none;
            }
            .payment-row.total {
                font-size: 18px;
                font-weight: 700;
                color: #276749;
            }
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                background: #fef3c7;
                color: #92400e;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
            }
            .message-box {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .contact-info {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 8px;
                margin: 30px 0;
                text-align: center;
            }
            .contact-info h4 {
                color: #2d3748;
                margin: 0 0 15px;
            }
            .contact-details {
                display: flex;
                justify-content: center;
                gap: 30px;
                flex-wrap: wrap;
            }
            .contact-item {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #4a5568;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                color: #a0aec0;
                font-size: 12px;
            }
            .button {
                display: inline-block;
                padding: 12px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
            }
            .weather-info {
                background: #f0f9ff;
                padding: 15px;
                border-radius: 8px;
                font-size: 13px;
                color: #0369a1;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Your Reservation is Confirmed!</h1>
                <p>We're excited to welcome you to Vicky's Resort</p>
            </div>
            
            <div class="content">
                <div class="confirmation-badge">
                    <span>✓ CONFIRMED</span>
                </div>

                <div class="greeting">
                    Dear <strong>${reservation.fullName}</strong>,
                </div>
                
                <p>Great news! Your reservation has been confirmed. Here are your booking details:</p>

                <div class="reservation-card">
                    <div class="reservation-id">
                        #${reservation.reservationId}
                    </div>

                    <div class="details-grid">
                        <div class="detail-item">
                            <div class="detail-label">Booking Date</div>
                            <div class="detail-value">${reservation.bookingDate}</div>
                        </div>
                    </div>

                    <div class="room-info">
                        <div class="room-icon">🏨</div>
                        <div class="room-details">
                            <h3>${reservation.roomName}</h3>
                            <p>• ${reservation.guestQuantity} guest${reservation.guestQuantity > 1 ? 's' : ''}</p>
                        </div>
                    </div>

                    <div class="payment-summary">
                        <div class="payment-row">
                            <span>Room Rate:</span>
                            <span>₱${parseFloat(reservation.totalAmount).toLocaleString()}</span>
                        </div>
                        <div class="payment-row">
                            <span>Payment Method:</span>
                            <span>${reservation.paymentMethod || 'To be paid at check-in'}</span>
                        </div>
                        <div class="payment-row total">
                            <span>Total Amount:</span>
                            <span>₱${parseFloat(reservation.totalAmount).toLocaleString()}</span>
                        </div>
                    </div>

                    <div style="text-align: center;">
                        <span class="status-badge">${reservation.paymentType || 'Standard'}</span>
                    </div>
                </div>

                ${reservation.request ? `
                <div class="message-box">
                    <strong>📝 Your Special Request:</strong>
                    <p style="margin: 10px 0 0;">${reservation.request}</p>
                    <p style="margin: 5px 0 0; font-size: 12px;">We'll do our best to accommodate this request.</p>
                </div>
                ` : ''}

                <div style="text-align: center;">
                    <a href="#" class="button">View Your Booking</a>
                </div>

                <div class="contact-info">
                    <h4>📞 Need Help?</h4>
                    <div class="contact-details">
                        <div class="contact-item">
                            <span>📧</span>
                            <span>${process.env.COMPANY_EMAIL || 'reservations@vickysresort.com'}</span>
                        </div>
                        <div class="contact-item">
                            <span>📞</span>
                            <span>${process.env.COMPANY_PHONE || '+63 (123) 456-7890'}</span>
                        </div>
                    </div>
                    <p style="margin: 15px 0 0; font-size: 13px;">
                        Office Hours: ${process.env.BUSINESS_HOURS || 'Monday - Saturday, 9:00 AM - 6:00 PM'}
                    </p>
                </div>

                <div style="margin: 30px 0; text-align: center; color: #4a5568;">
                    <p>We look forward to providing you with a memorable stay!</p>
                    <p style="font-size: 13px;">Warm regards,<br><strong>The Vicky's Resort Team</strong></p>
                </div>

                <div class="footer">
                    <p>This is your official reservation confirmation.</p>
                    <p>© ${new Date().getFullYear()} Vicky's Resort. All rights reserved.</p>
                    <p>${process.env.COMPANY_ADDRESS || '123 Beach Road, Paradise Island'}</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
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
                            <div class="detail-value">${reservation.roomName}</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-label">Booking Date:</div>
                            <div class="detail-value">${reservation.bookingDate}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Reservation Type</div>
                            <div class="detail-value">${reservation.reservationType}</div>
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
                    <h1>Reservation Submitted!</h1>
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
                            <div class="detail-label">Reservation Type:</div>
                            <div class="detail-value">${reservation.reservationType}</div>
                        </div>
                    </div>

                    <div class="detail-box">
                        <h3>📅 Stay Dates</h3>
                        <div class="detail-row">
                            <div class="detail-label">Check-in:</div>
                            <div class="detail-value">${reservation.bookingDate}</div>
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
                        <p><small>Please wait to confirm your reservation payment</small></p>
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