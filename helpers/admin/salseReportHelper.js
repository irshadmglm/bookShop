const { ObjectId } = require('mongodb');
const collections = require('../../config/collection');
const db = require('../../config/connection');

const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');

const width = 800; // Chart width
const height = 600; // Chart height
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

module.exports = {
    getDashboardData: () => {
        return new Promise(async(resolve, reject) => {
          let couponDeductionResult = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
                $group: {
                    _id: null,
                    totalCouponDeduction: { $sum: "$couponDeduction" }
                }
            }
        ]).toArray();

           let result = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                { 
                    $unwind: "$items" 
                },
                { 
                    $match: { "items.orderStatus": "Delivered" } 
                },
                {
                    $group: {
                        _id: null,
                        overallSalesCount: { $sum: 1 },
                        totalRevenue: { $sum: "$totalAmount" },
                        totalDiscount: { $sum: "$items.discountValue" } 
                    }
                }
            ]).toArray();
            if (result && result[0]) {
              result[0].totalCouponDeduction = couponDeductionResult[0]?.totalCouponDeduction || 0;
            } else {
              console.log("Result[0] is undefined or empty");
            }
            
            
            resolve(result);
        });
    },
    generatePdfReport: async (data) => {
      return new Promise(async (resolve, reject) => {
          try {
              const doc = new PDFDocument();
              let buffers = [];
  
              // Collect the PDF data
              doc.on('data', buffers.push.bind(buffers));
              doc.on('end', () => {
                  const pdfData = Buffer.concat(buffers);
                  resolve(pdfData);
              });
  
              // Generate the chart image
              const chartImage = await module.exports.generateChart(data);
  
              // Add title and subtitle
              doc.fontSize(18).text('Sales Report', { align: 'center' });
              doc.moveDown();
              doc.fontSize(12).text('Summary of sales data:', { align: 'left' });
  
               // Add sales details
               doc.moveDown();
               doc.fontSize(12)
                   .text(`Total Sales Count: ${data.overallSalesCount}`)
                   .text(`Total Revenue: ₹${data.totalRevenue}`)
                   .text(`Total Discounts: ₹${data.totalDiscount}`)
                   .text(`Coupons Deduction: ₹${data.totalCouponDeduction}`);

              // Add chart image to the PDF
              doc.moveDown();
              doc.image(chartImage, {
                  fit: [500, 300],
                  align: 'center',
                  valign: 'center'
              });
  
             
  
              // Finalize the PDF
              doc.end();
          } catch (error) {
              reject(error);
          }
      });
  },
  
  

  generateExcelReport: (data) => {
    return new Promise((resolve, reject) => {
        try {
            const ExcelJS = require('exceljs');
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sales Report');

    
            worksheet.mergeCells('A1:D1'); // Merge cells for the title
            const titleCell = worksheet.getCell('A1');
            titleCell.value = 'Sales Report'; // Set the title text
            titleCell.font = { bold: true, size: 16 }; // Title font styling
            titleCell.alignment = { vertical: 'middle', horizontal: 'center' }; // Title alignment
            
            // Add an empty row after the title
            worksheet.addRow([]);

            // Define worksheet columns (headers)
            worksheet.columns = [
                { header: 'Overall Sales Count', key: 'overallSalesCount', width: 20 },
                { header: 'Total Revenue (₹)', key: 'totalRevenue', width: 20 },
                { header: 'Total Discount (₹)', key: 'totalDiscount', width: 20 },
                { header: 'Coupon Deduction (₹)', key: 'totalCouponDeduction', width: 25 }
            ];

            // Debugging: Log the data structure
            console.log('Data received:', JSON.stringify(data, null, 2));

            // Check if the array has at least one object
            if (Array.isArray(data) && data.length > 0) {
                const rowData = data[0]; // Access the first element of the array

                console.log('Individual values:');
                console.log('Overall Sales Count:', rowData.overallSalesCount);
                console.log('Total Revenue:', rowData.totalRevenue);
                console.log('Total Discount:', rowData.totalDiscount);
                console.log('Total Coupon Deduction:', rowData.totalCouponDeduction);

                // Add data row
                worksheet.addRow({
                    overallSalesCount: rowData.overallSalesCount || 0,
                    totalRevenue: rowData.totalRevenue || 0,
                    totalDiscount: rowData.totalDiscount || 0,
                    totalCouponDeduction: rowData.totalCouponDeduction || 0
                });
            } else {
                console.error('Invalid data structure:', data);
                reject(new Error('Invalid data structure or empty array'));
                return;
            }

            // Adjust column and row styles
            worksheet.eachRow((row, rowNumber) => {
                row.alignment = { vertical: 'middle', horizontal: 'center' };
                if (rowNumber === 3) { // Header row styling
                    row.font = { bold: true, size: 12 };
                }
            });

            // Write workbook to a buffer
            workbook.xlsx.writeBuffer()
                .then(buffer => resolve(buffer))
                .catch(error => {
                    console.error('Error writing Excel buffer:', error.message);
                    reject(error);
                });

        } catch (error) {
            console.error('Error generating Excel report:', error.message);
            reject(error);
        }
    });
},
    generateReport: ({ type, startDate, endDate }) => {
        return new Promise(async (resolve, reject) => {
          let matchCriteria = {};
      
    
          switch (type) {
            case 'daily':
              matchCriteria = {
                updatedAt: new Date().toISOString().split('T')[0]  
              };
              break;
            case 'weekly':
              matchCriteria = {
                updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
              };
              break;
            case 'monthly':
              matchCriteria = {
                updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
              };
              break;
            default:
              if (startDate && endDate) {
                matchCriteria = {
                  updatedAt: { $gte: new Date(startDate).toISOString().split('T')[0], $lte: new Date(endDate).toISOString().split('T')[0] }
                };
              }
              break;
          }
      
          try {
            const reportData = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
              { $unwind: "$items" },
              {
                $match: Object.assign(
                  { "items.orderStatus": "Delivered" },
                  matchCriteria
                ),
              },
              {
                $group: {
                  _id: null,
                  overallSalesCount: { $sum: 1 },
                  totalRevenue: { $sum: "$totalAmount" },
                  totalDiscount: { $sum: "$items.discount" },
                  couponDeduction: { $sum: "$couponDeduction" },
                },
              },
            ]).toArray();
      
            resolve(reportData[0] || {}); 
          } catch (error) {
            console.error("Error generating report:", error);
            reject("Failed to generate report");
          }
        });
      },
     
      
      generateChart: async (data) => {
        const configuration = {
            type: 'bar', // Chart type (e.g., 'bar', 'line', 'pie')
            data: {
                labels: ['Total Sales', 'Total Revenue', 'Total Discounts', 'Coupons Deduction'], // Labels
                datasets: [{
                    label: 'Sales Report Summary',
                    data: [
                        data.overallSalesCount, 
                        data.totalRevenue, 
                        data.totalDiscount, 
                        data.totalCouponDeduction
                    ],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)', 
                        'rgba(255, 99, 132, 0.2)', 
                        'rgba(255, 206, 86, 0.2)', 
                        'rgba(54, 162, 235, 0.2)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)', 
                        'rgba(255, 99, 132, 1)', 
                        'rgba(255, 206, 86, 1)', 
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    legend: { display: true },
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };

        const image = await chartJSNodeCanvas.renderToBuffer(configuration);

        // Save the image as a file if needed
        fs.writeFileSync('sales-chart.png', image);

        return image; // Return buffer to integrate into PDF or serve as a response
    },
    
    
}