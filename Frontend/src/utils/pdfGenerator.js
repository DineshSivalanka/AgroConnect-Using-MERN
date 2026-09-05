import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateInvoice = (order, currentUser) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(34, 139, 34); // Forest Green
  doc.text("AgroConnect Invoice", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 105, 28, { align: "center" });
  doc.text(`Order ID: ${order.id}`, 105, 33, { align: "center" });

  doc.setLineWidth(0.5);
  doc.line(14, 40, 196, 40);

  // Addresses
  doc.setFontSize(12);
  doc.setTextColor(0);
  
  // Seller details
  doc.setFont("helvetica", "bold");
  doc.text("Seller:", 14, 50);
  doc.setFont("helvetica", "normal");
  doc.text(order.farmer?.name || 'N/A', 14, 57);
  doc.text(`Phone: ${order.farmer?.phone || 'N/A'}`, 14, 64);
  doc.text(`Location: ${order.farmer?.location || 'N/A'}`, 14, 71);

  // Buyer details
  doc.setFont("helvetica", "bold");
  doc.text("Buyer:", 120, 50);
  doc.setFont("helvetica", "normal");
  doc.text(order.buyer?.name || 'N/A', 120, 57);
  doc.text(`Phone: ${order.buyer?.phone || 'N/A'}`, 120, 64);
  doc.text(`Location: ${order.buyer?.location || 'N/A'}`, 120, 71);

  // Table
  const tableColumn = ["Product", "Category", "Quantity", "Unit Price", "Total"];
  const tableRows = [
    [
      order.listing?.productName || 'N/A',
      order.listing?.category || 'N/A',
      `${order.quantity} ${order.listing?.unit || ''}`,
      `Rs. ${order.agreedPrice}`,
      `Rs. ${order.totalAmount}`
    ]
  ];

  doc.autoTable({
    startY: 85,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [34, 139, 34], textColor: 255 },
    styles: { fontSize: 11, cellPadding: 5 }
  });

  const finalY = doc.lastAutoTable.finalY || 110;

  // Total amount
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`Total Amount: Rs. ${order.totalAmount}`, 196, finalY + 15, { align: "right" });
  
  // Status
  doc.setFontSize(11);
  doc.text(`Order Status: ${order.status}`, 14, finalY + 15);
  if (order.status !== 'DELIVERED') {
      doc.setFont("helvetica", "normal");
      doc.text("This invoice is provisional until the order is delivered.", 14, finalY + 22);
  }

  // Footer
  doc.setLineWidth(0.5);
  doc.line(14, 280, 196, 280);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("Thank you for using AgroConnect!", 105, 287, { align: "center" });

  doc.save(`Invoice_AgroConnect_${order.id.substring(0, 8)}.pdf`);
};
