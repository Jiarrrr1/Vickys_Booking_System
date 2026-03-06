// frontend/src/services/exportService.js
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

class ExportService {
  // ==========================================
  // EXCEL EXPORT
  // ==========================================
  toExcel(data, filename = 'export') {
    try {
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
      saveAs(blob, `${filename}.xlsx`)
      return { success: true }
    } catch (error) {
      console.error('Excel export failed:', error)
      return { success: false, error: error.message }
    }
  }

  // ==========================================
  // PDF EXPORT
  // ==========================================
  toPDF(data, filename = 'export', title = 'Export Report') {
    try {
      const doc = new jsPDF()
      
      // Title
      doc.setFontSize(18)
      doc.text(title, 14, 22)
      
      // Timestamp
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)
      
      // Prepare table data
      const headers = Object.keys(data[0] || {}).map(key => key)
      const rows = data.map(item => headers.map(h => item[h] || ''))
      
      // Add table
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 40,
        styles: { 
          fontSize: 8,
          cellPadding: 3
        },
        headStyles: { 
          fillColor: [102, 126, 234],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 250]
        }
      })
      
      doc.save(`${filename}.pdf`)
      return { success: true }
    } catch (error) {
      console.error('PDF export failed:', error)
      return { success: false, error: error.message }
    }
  }

  // ==========================================
  // DATA FORMATTERS
  // ==========================================
  
  // Format Bookings
  formatBookings(bookings) {
    return bookings.map(b => ({
      'Booking ID': b.id || b.reservationId,
      'Guest Name': b.guest || b.fullName,
      'Room': b.room || b.roomName,
      'Guests': b.guests || b.guestQuantity,
      'Check-in Date': b.checkIn,
      'Check-out Date': b.checkOut,
      'Total Nights': b.totalNights || this.calculateNights(b.checkIn, b.checkOut),
      'Total Amount': `₱${Number(b.totalAmount || b.total).toLocaleString()}`,
      'Payment Method': b.paymentMethod || 'N/A',
      'Payment Type': b.paymentType || 'N/A',
      'Downpayment': `₱${Number(b.downpayment || 0).toLocaleString()}`,
      'Remaining Balance': `₱${Number(b.remainingBalance || 0).toLocaleString()}`,
      'Status': b.status || 'Pending',
      'Email': b.email || 'N/A',
      'Phone': b.phoneNumber || 'N/A',
      'Special Request': b.request || b.notes || 'None',
      'Created At': b.createdAt || b.bookedOn || 'N/A'
    }))
  }

  // Format Payments
  formatPayments(payments) {
    return payments.map(p => ({
      'Payment ID': p.paymentId,
      'Reservation ID': p.bookingId || p.reservationId,
      'Guest Name': p.guest || p.guestName,
      'Room': p.room || p.roomName,
      'Amount': `₱${Number(p.amt || p.amount).toLocaleString()}`,
      'Payment Method': p.method || p.paymentMethod,
      'Reference Number': p.referenceNumber || 'N/A',
      'Payment Type': p.paymentType,
      'Status': p.status,
      'Payment Date': p.date || p.paymentDate || 'N/A',
      'Notes': p.notes || 'None'
    }))
  }

  // Format Feedbacks
  formatFeedbacks(feedbacks) {
    return feedbacks.map(f => ({
      'Feedback ID': f.id || f.feedBackId,
      'Guest Name': f.from || f.guestName || 'Anonymous',
      'Email': f.email || 'N/A',
      'Rating': `${f.rate || 0} / 5`,
      'Comment': f.comment || 'No comment',
      'Status': f.status || 'pending',
      'Display Status': f.isDisplay ? 'Displayed' : 'Hidden',
      'Date': f.createdAt || f.date || 'N/A'
    }))
  }

  // Format Deleted Items
  formatDeletedItems(deletedItems) {
    return deletedItems.map(item => ({
      'Item Type': item.itemType,
      'Original ID': item.originalId,
      'Deleted By': item.deletedBy || 'System',
      'Deleted At': this.formatDate(item.deletedAt),
      'Expires At': this.formatDate(item.expiresAt),
      'Details': this.getItemDetails(item)
    }))
  }

  // Format Revenue Report
  formatRevenueReport(payments, startDate, endDate) {
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amt || p.amount || 0), 0)
    
    // Group by payment method
    const byMethod = {}
    payments.forEach(p => {
      const method = p.method || p.paymentMethod || 'Other'
      byMethod[method] = (byMethod[method] || 0) + (p.amt || p.amount || 0)
    })

    // Group by month
    const byMonth = {}
    payments.forEach(p => {
      const date = new Date(p.date || p.paymentDate || p.createdAt)
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' })
      byMonth[monthYear] = (byMonth[monthYear] || 0) + (p.amt || p.amount || 0)
    })

    const summary = [{
      'Report Period': startDate && endDate 
        ? `${this.formatDate(startDate)} to ${this.formatDate(endDate)}`
        : 'All Time',
      'Total Transactions': payments.length,
      'Total Revenue': `₱${totalRevenue.toLocaleString()}`,
      'Average per Transaction': `₱${(totalRevenue / (payments.length || 1)).toLocaleString()}`,
      'Generated On': new Date().toLocaleString()
    }]

    // Method breakdown
    const methodRows = Object.entries(byMethod).map(([method, amount]) => ({
      'Payment Method': method,
      'Amount': `₱${amount.toLocaleString()}`,
      'Percentage': `${((amount / totalRevenue) * 100).toFixed(1)}%`
    }))

    // Month breakdown
    const monthRows = Object.entries(byMonth).map(([month, amount]) => ({
      'Month': month,
      'Revenue': `₱${amount.toLocaleString()}`,
      'Percentage': `${((amount / totalRevenue) * 100).toFixed(1)}%`
    }))

    return { summary, byMethod: methodRows, byMonth: monthRows }
  }

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================
  
  calculateNights(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 'N/A'
    try {
      const start = new Date(checkIn)
      const end = new Date(checkOut)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return 'N/A'
    }
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  getItemDetails(item) {
    if (item.itemType === 'feedback') {
      return `${item.originalData?.from || 'Anonymous'}: ${item.originalData?.comment || ''}`
    } else if (item.itemType === 'booking') {
      return `${item.originalData?.fullName || item.originalData?.guest} - ${item.originalData?.roomName || item.originalData?.room}`
    } else if (item.itemType === 'payment') {
      return `${item.originalData?.guestName || item.originalData?.guest} - ₱${item.originalData?.amount || 0}`
    }
    return 'N/A'
  }

  // ==========================================
  // MULTI-SHEET EXCEL EXPORT
  // ==========================================
  
  toMultiSheetExcel(data, filename = 'export') {
    try {
      const wb = XLSX.utils.book_new()
      
      Object.entries(data).forEach(([sheetName, sheetData]) => {
        if (sheetData && sheetData.length > 0) {
          const ws = XLSX.utils.json_to_sheet(sheetData)
          XLSX.utils.book_append_sheet(wb, ws, sheetName)
        }
      })
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
      saveAs(blob, `${filename}.xlsx`)
      return { success: true }
    } catch (error) {
      console.error('Multi-sheet Excel export failed:', error)
      return { success: false, error: error.message }
    }
  }
}

export default new ExportService()