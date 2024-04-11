locals {
  zip_file = "${path.module}/dist/lambda.zip"
}

# Parameter Store

resource "aws_ssm_parameter" "twilio_auth_token" {
  name        = "/twilio/authToken"
  description = "The Twilio Auth Token"
  type        = "SecureString"
  value       = var.twilio_auth_token
}

# Lambda

resource "aws_lambda_function" "lambda_function" {
  filename         = local.zip_file
  source_code_hash = filebase64sha256(local.zip_file)

  function_name = var.function_name
  role          = aws_iam_role.lambda_iam.arn

  runtime     = "nodejs20.x"
  handler     = "main.handler"
  memory_size = 256
  timeout     = 10

  environment {
    variables = {
      TWILIO_ACCOUNT_SID               = var.twilio_account_sid,
      TWILIO_AUTH_TOKEN_PARAMETER_NAME = aws_ssm_parameter.twilio_auth_token.name
      TWILIO_FROM_PHONE_NUMBER         = var.from_phone_number,
      NODE_OPTIONS                     = "--enable-source-maps" # This can sometimes cause performance issues, so can be removed to reduce execution time
    }
  }
}

# Cloudwatch Logs

resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = var.log_retention_in_days
}

# IAM

resource "aws_iam_role" "lambda_iam" {
  name = "${var.function_name}-role"
  path = "/"

  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Action" : "sts:AssumeRole",
        "Principal" : {
          "Service" : "lambda.amazonaws.com"
        },
        "Effect" : "Allow"
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_policy" {
  name = "${var.function_name}-lambda-policy"
  path = "/"

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Action" : [
          "ssm:GetParameter"
        ],
        "Resource" : aws_ssm_parameter.twilio_auth_token.arn
        "Effect" : "Allow"
      },
      {
        "Action" : [
          "kms:Decrypt"
        ],
        "Resource" : data.aws_kms_key.aws_managed_parameter_store_key.arn,
        "Effect" : "Allow"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "policy_attachment" {
  role       = aws_iam_role.lambda_iam.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution_role_attachment" {
  role       = aws_iam_role.lambda_iam.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Eventbridge

resource "aws_cloudwatch_event_rule" "event_rule" {
  schedule_expression = var.schedule_expression
}

resource "aws_cloudwatch_event_target" "event_target" {
  arn  = aws_lambda_function.lambda_function.arn
  rule = aws_cloudwatch_event_rule.event_rule.name

  input = jsonencode({
    "to" : var.to_phone_number,
    "message" : var.message
  })
}

# Lambda Permissions

resource "aws_lambda_permission" "allow_eventbridge_to_invoke_function" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_function.arn
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.event_rule.arn
}
