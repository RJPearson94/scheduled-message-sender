variable "twilio_account_sid" {
  description = "The SID of your Twilio account"
  type        = string

  validation {
    condition     = can(regex("^AC[0-9a-fA-F]{32}$", var.twilio_account_sid))
    error_message = "The Twilio account SID must be in the following format \"^AC[0-9a-fA-F]{32}$\"."
  }
}

variable "twilio_auth_token" {
  description = "The Auth Token for your Twilio account"
  type        = string
  sensitive   = true
}

variable "to_phone_number" {
  description = "The phone number to send the SMS to"
  type        = string

  validation {
    condition     = can(regex("^\\+[1-9]\\d{1,14}$", var.to_phone_number))
    error_message = "The phone number to send an SMS to must be in the following formation \"^\\+[1-9]\\d{1,14}$\"."
  }
}

variable "from_phone_number" {
  description = "The Twilio phone number to send SMS from"
  type        = string

  validation {
    condition     = can(regex("^\\+[1-9]\\d{1,14}$", var.from_phone_number))
    error_message = "The phone number to send an SMS to must be in the following formation \"^\\+[1-9]\\d{1,14}$\"."
  }
}

variable "message" {
  description = "The SMS body to send"
  type        = string
}

variable "function_name" {
  description = "The name of the lambda function"
  type        = string
  default     = "scheduled-sms-sender"
}

variable "log_retention_in_days" {
  description = "The number of days to retain CloudWatch Logs for"
  type        = number
  default     = 7
}

variable "schedule_expression" {
  description = "The schedule for which the lambda function will be invoked. The schedule can be either a cron expression or a rate expression. See the AWS Docs https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-rule-schedule.html for more information"
  type        = string
  default     = "rate(1 hour)"
}

