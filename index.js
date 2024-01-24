require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const adminRoutes = require("./routes/adminRoutes");
const companyRoutes = require("./routes/companyRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const { sendEmail, createEmailTransporter } = require("./utils/sendMail");
const {
  deadlineHtmlTemplate,
} = require("./utils/htmlTemplates/deadlineTemplate");
const db = require("./db/db");
const cron = require("node-cron");

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use("/uploads", express.static("uploads"));

app.use("/admin", adminRoutes);
app.use("/api", companyRoutes);
app.use("/api", ticketRoutes);

cron.schedule(
  "0 8 * * *",
  async () => {
    try {
      const emailTransporter = createEmailTransporter(
        process.env.SUPPORT_EMAIL,
        process.env.SUPPORT_EMAIL_PASSWORD,
      );

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const tickets = await db.raw(`SELECT *
          FROM tickets
          WHERE (end_date IS NULL OR end_date::date >= CURRENT_DATE + 1)
            AND status IN ('Pending', 'In Progress');
          `);

      console.log("tickets", tickets.rows);

      for (let i = 0; i < tickets.rows.length; i++) {
        const ticket = tickets.rows[i];

        const values = {
          var1: ticket.end_date,
          var2: ticket.project_name,
          var3: ticket.title,
          var4: ticket.support_related_to,
          var5: ticket.status,
          var6: ticket.priority,
          var7: ticket.created_at,
          var8: "https://assets.unlayer.com/stock-templates/1706079819722-198187",
        };

        await sendEmail(
          emailTransporter,
          ["vivek.agrahari@genuinemark.org", "rishabh@genuinemark.org"],
          deadlineHtmlTemplate.subject,
          deadlineHtmlTemplate.text,
          deadlineHtmlTemplate.html_template,
          values,
          async (succcess) => {
            if (succcess) {
              // return await sendResponse(true, 200, "Custom Responseee ", emailCredentialData, res);
              return;
            }
          },
        );
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  },
  {
    timezone: "Asia/Kolkata",
  },
);

app.listen(port, async () => {
  console.log(`server started at ${port}`);
});
