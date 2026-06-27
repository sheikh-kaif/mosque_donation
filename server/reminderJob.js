const cron = require("node-cron");
const User = require("./modals/userModal");
const gmailTransporter = require("./config/gmailTransporter");


//setting a friday remindr at 10am of every friday
cron.schedule("0 10 * * 5  ", async () => {
  console.log("Friday Reminder Running...");

  try {
    const users = await User.find({ reminderEnabled: true });
    console.log("Users found:", users.length);

    for (let user of users) {
      await gmailTransporter.sendMail({
        from: `"Mosque Donation" <${process.env.GMAIL_USER}>`,
        to: user.email,
        subject: "Friday Reminder 🕌",
        text: `Assalamualaikum ${user.name}! 🤲
        
“Whatever you spend in charity, Allah will replace it.”
— Surah Saba (34:39)

Don’t miss the opportunity this Friday.`,
      });
      console.log("✅ Reminder sent to:", user.email);
    }

    console.log("All reminders sent!");
  } catch (err) {
    console.log("❌ Cron error:", err.message);
  }
});
