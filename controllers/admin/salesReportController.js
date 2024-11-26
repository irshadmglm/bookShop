const salseReportHelper = require("../../helpers/admin/salseReportHelper")

module.exports = {
  // Dashboard Data
  getDashboardData: (req, res) => {
      salseReportHelper.getDashboardData().then((report) => {
          console.log(report);
          res.render('admin/adminDashboard', { report: report[0] });
      }).catch((error) => {
          console.error('Error fetching dashboard data:', error);
          res.status(500).json({ message: 'Error fetching dashboard data' });
      });
  },

  // Daily Report
  getDailyReport: (req, res) => {
      try {
          salseReportHelper.generateReport({ type: 'daily' }).then((report) => {
              console.log(report);
              res.json(report);
          }).catch((error) => {
              console.error('Error generating daily report:', error);
              res.status(500).json({ message: 'Error generating daily report' });
          });
      } catch (error) {
          res.status(500).json({ message: 'Error generating daily report' });
      }
  },

  // Weekly Report
  getWeeklyReport: async (req, res) => {
      try {
          const report = await salseReportHelper.generateReport({ type: 'weekly' });
          res.json(report);
      } catch (error) {
          console.error('Error generating weekly report:', error);
          res.status(500).json({ message: 'Error generating weekly report' });
      }
  },

  // Monthly Report
  getMonthlyReport: async (req, res) => {
      try {
          const report = await salseReportHelper.generateReport({ type: 'monthly' });
          res.json(report);
      } catch (error) {
          console.error('Error generating monthly report:', error);
          res.status(500).json({ message: 'Error generating monthly report' });
      }
  },

  // Custom Date Report
  getCustomDateReport: async (req, res) => {
      try {
          const { startDate, endDate } = req.body;
          const report = await salseReportHelper.generateReport({ startDate, endDate });
          res.json(report);
      } catch (error) {
          console.error('Error generating custom date report:', error);
          res.status(500).json({ message: 'Error generating custom date report' });
      }
  },

  // Download PDF Report
  downloadPdfReport: async (req, res) => {
      try {
          const data = await salseReportHelper.getDashboardData(); // Fetch the data
          const chartImage = await salseReportHelper.generateChart(data[0]); // Generate chart
          const pdfData = await salseReportHelper.generatePdfReport(data[0]); // Generate PDF with chart

          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename=sales-report.pdf');
          res.send(pdfData);
      } catch (error) {
          console.error('Error downloading PDF report:', error);
          res.status(500).json({ message: 'Error downloading PDF report' });
      }
  },

  downloadExcelReport: async (req, res) => {
    try {
        // Fetch the dashboard data
        const data = await salseReportHelper.getDashboardData();
        if (!data) {
            throw new Error('No data available to generate the report');
        }

        // Generate Excel report
        const excelData = await salseReportHelper.generateExcelReport(data);

        // Set response headers for file download
        const filename = `sales-report-${Date.now()}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        // Send the generated Excel file
        res.send(excelData);
    } catch (error) {
        console.error('Error downloading Excel report:', error.message, error.stack);
        res.status(500).json({ message: 'Error downloading Excel report' });
    }
},

};