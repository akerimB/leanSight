const PDFDocument = require('pdfkit-table');
const fs = require('fs');

// Create a document
const doc = new PDFDocument({ margin: 50 });

// Pipe its output somewhere, like to a file
doc.pipe(fs.createWriteStream('test-output.pdf'));

// Add some content
doc.fontSize(20).text('Test PDF Document', { align: 'center' });
doc.moveDown();

// Create a simple table
const table = {
  title: "Test Table",
  headers: ["Column 1", "Column 2"],
  rows: [
    ["Row 1, Cell 1", "Row 1, Cell 2"],
    ["Row 2, Cell 1", "Row 2, Cell 2"],
    ["Row 3, Cell 1", "Row 3, Cell 2"]
  ]
};

// Add the table to the document
doc.table(table, {
  prepareHeader: () => doc.fontSize(10),
  prepareRow: () => doc.fontSize(10),
  columnSpacing: 10,
  width: 500
})
.then(() => {
  // Finalize the PDF
  doc.end();
  console.log('PDF generated successfully!');
})
.catch(err => {
  console.error('Error generating PDF:', err);
}); 