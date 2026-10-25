const UserStatuses = ["new", "active", "inactive"]
const smtpSender = process.env.SMTP_SENDER || "test@example.com"
export {
  UserStatuses,
  smtpSender
}