const { ObjectId } = require('mongodb');
const collections = require('../../config/collection');
const db = require('../../config/connection');

const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

module.exports = {
    getDashboardData: () => {
        return new Promise(async(resolve, reject) => {
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
                        totalDiscount: { $sum: "$items.discount" }, 
                        couponsDeduction: { $sum: "$items.couponDeduction" } 
                    }
                }
            ]).toArray();
            resolve(result)
        });
    },
    generatePdfReport: () => {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument();
                let buffers = [];
                
               
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });
                
               
                doc.fontSize(18).text('Sales Report', { align: 'center' });
                doc.moveDown();
                doc.fontSize(12).text('Here is the summary of sales data:', { align: 'left' });
                
                doc.moveDown();
                doc.text(`Order ID: 12345`);
                doc.text(`Amount: ₹300`);
                doc.text(`Status: Delivered`);
                
                
                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    },

    generateExcelReport: () => {
        return new Promise((resolve, reject) => {
            try {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Sales Report');

                
                worksheet.columns = [
                    { header: 'Order ID', key: 'orderId', width: 20 },
                    { header: 'Amount', key: 'amount', width: 15 },
                    { header: 'Status', key: 'status', width: 15 }
                ];

                
                worksheet.addRow({ orderId: '12345', amount: 300, status: 'Delivered' });

            
                workbook.xlsx.writeBuffer()
                    .then(buffer => resolve(buffer))
                    .catch(error => reject(error));
            } catch (error) {
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
                  couponsDeduction: { $sum: "$items.couponDeduction" },
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
      
    
    
}