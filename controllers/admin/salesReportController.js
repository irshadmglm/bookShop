const salseReportHelper = require("../../helpers/admin/salseReportHelper")

 module.exports = {

    getDashboardData: (req,res)=>{
        salseReportHelper.getDashboardData().then((report)=>{
            console.log(report);
            res.render('admin/adminDashbord',{report:report[0]})
        })
    },
    getDailyReport: (req, res) => {
        try {
           salseReportHelper.generateReport({ type: 'daily' }).then((report)=>{
            console.log(report);
          
          res.json(report);
           })
          
        } catch (error) {
          res.status(500).json({ message: 'Error generating daily report' });
        }
      },
      getWeeklyReport : async (req, res) => {
        try {
          const report = await salseReportHelper.generateReport({ type: 'weekly' });
          res.json(report);
        } catch (error) {
          res.status(500).json({ message: 'Error generating weekly report' });
        }
      },
      getMonthlyReport : async (req, res) => {
        try {
          const report = await salseReportHelper.generateReport({ type: 'monthly' });
          res.json(report);
        } catch (error) {
          res.status(500).json({ message: 'Error generating monthly report' });
        }
      },
      getCustomDateReport : async (req, res) => {
        try {
          const { startDate, endDate } = req.body;
          const report = await salseReportHelper.generateReport({ startDate, endDate });
          res.json(report);
        } catch (error) {
          res.status(500).json({ message: 'Error generating custom date report' });
        }
      },      
    downloadPdfReport : async (req, res) => {
        try {
          const pdfData = await salseReportHelper.generatePdfReport();
          res.setHeader('Content-Type', 'application/pdf');
          res.send(pdfData);
        } catch (error) {
          res.status(500).json({ message: 'Error downloading PDF report' });
        }
      },
      downloadExcelReport : async(req, res) => {
        try {
          const excelData = await salseReportHelper.generateExcelReport();
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.send(excelData);
        } catch (error) {
          res.status(500).json({ message: 'Error downloading Excel report' });
        }
      }
 }