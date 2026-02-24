const nodemailer = require('nodemailer');

class EmailSender {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 465,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendReservationEmail(toEmail, reservationData) {
        try {
            // Email to company
            const companyMailOptions = {
                from: `"Reservation System" <${process.env.EMAIL_USER}>`,
                to: process.env.COMPANY_EMAIL || 'company@example.com',
                subject: 'New Reservation Received',
                html: this.generateCompanyEmailHTML(reservationData)
            };

            // Email to user
            const userMailOptions = {
                from: `"Vicky's Resort" <${process.env.EMAIL_USER}>`,
                to: toEmail,
                subject: 'Reservation Confirmation',
                html: this.generateUserEmailHTML(reservationData)
            };

            // Send both emails
            await this.transporter.sendMail(companyMailOptions);
            await this.transporter.sendMail(userMailOptions);
            
            return true;
        } catch (error) {
            console.error('Email sending failed:', error);
            throw error;
        }
    }

    generateCompanyEmailHTML(reservation) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; }
                .details { margin: 20px 0; }
                .detail-item { margin: 10px 0; }
                .label { font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>New Reservation Received</h2>
                </div>
                <div class="details">
                    <div class="detail-item">
                        <span class="label">Reservation ID:</span> ${reservation.reservationId}
                    </div>
                    <div class="detail-item">
                        <span class="label">Guest Name:</span> ${reservation.fullName}
                    </div>
                    <div class="detail-item">
                        <span class="label">Email:</span> ${reservation.email}
                    </div>
                    <div class="detail-item">
                        <span class="label">Phone:</span> ${reservation.phoneNumber}
                    </div>
                    <div class="detail-item">
                        <span class="label">Check-in:</span> ${new Date(reservation.checkIn).toLocaleDateString()}
                    </div>
                    <div class="detail-item">
                        <span class="label">Check-out:</span> ${new Date(reservation.checkOut).toLocaleDateString()}
                    </div>
                    <div class="detail-item">
                        <span class="label">Guests:</span> ${reservation.guestQuantity}
                    </div>
                    ${reservation.request ? `
                    <div class="detail-item">
                        <span class="label">Special Request:</span> ${reservation.request}
                    </div>` : ''}
                    <div class="detail-item">
                        <span class="label">Payment Method:</span> ${reservation.paymentMethod}
                    </div>
                    <div class="detail-item">
                        <span class="label">Room Name:</span> ${reservation.roomName}
                    </div>
                    <div class="detail-item">
                        <span class="label">Total Amount:</span> ${reservation.totalAmount}
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    generateUserEmailHTML(reservation) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; }
                .details { margin: 20px 0; }
                .detail-item { margin: 10px 0; }
                .label { font-weight: bold; }
                .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Reservation Confirmation</h2>
                </div>
                <div class="details">
                    <p>Dear ${reservation.fullName},</p>
                    <p>Thank you for your reservation! Here are your reservation details:</p>
                    
                    <div class="detail-item">
                        <span class="label">Reservation ID:</span> ${reservation.reservationId}
                    </div>
                    <div class="detail-item">
                        <span class="label">Room Name:</span> ${reservation.roomName}
                    </div>
                    <div class="detail-item">
                        <span class="label">Check-in Date:</span> ${new Date(reservation.checkIn).toLocaleDateString()}
                    </div>
                    <div class="detail-item">
                        <span class="label">Check-out Date:</span> ${new Date(reservation.checkOut).toLocaleDateString()}
                    </div>
                    <div class="detail-item">
                        <span class="label">Number of Guests:</span> ${reservation.guestQuantity}
                    </div>
                    <div class="detail-item">
                        <span class="label">Payment Method:</span> ${reservation.paymentMethod}
                    </div>
                    <div class="detail-item">
                        <span class="label">Total Amount:</span> ${reservation.totalAmount}
                    </div>
                    <p>We will contact you shortly to confirm your reservation.</p>
                    <p>If you have any questions, please contact us at ${process.env.COMPANY_PHONE || 'your contact number'}.</p>
                </div>
                <div class="footer">
                    <p>Best regards,<br>Vicky's Resort</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

module.exports = new EmailSender();