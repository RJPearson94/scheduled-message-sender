# Infrastructure

This folder contains the Infrastructure as Code (Terraform) for provisioning the scheduled message sender on AWS.

Before the infrastructure can be provisioned, the lambda artifact zip must be generated in the `dist` folder. To generate the lambda artifact zip, see the project [README](../README.md) for instructions.

Documentation generated using [terraform-docs](https://github.com/terraform-docs/terraform-docs)

## Requirements

| Name                                                                     | Version   |
| ------------------------------------------------------------------------ | --------- |
| <a name="requirement_terraform"></a> [terraform](#requirement_terraform) | >= 1.0    |
| <a name="requirement_aws"></a> [aws](#requirement_aws)                   | >= 3.62.0 |

## Providers

| Name                                             | Version |
| ------------------------------------------------ | ------- |
| <a name="provider_aws"></a> [aws](#provider_aws) | 3.62.0  |

## Modules

No modules.

## Resources

| Name                                                                                                                                                                            | Type        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| [aws_cloudwatch_event_rule.event_rule](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_event_rule)                                       | resource    |
| [aws_cloudwatch_event_target.event_target](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_event_target)                                 | resource    |
| [aws_cloudwatch_log_group.lambda_log_group](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_log_group)                                   | resource    |
| [aws_iam_policy.lambda_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy)                                                          | resource    |
| [aws_iam_role.lambda_iam](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role)                                                                 | resource    |
| [aws_iam_role_policy_attachment.lambda_basic_execution_role_attachment](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource    |
| [aws_iam_role_policy_attachment.policy_attachment](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment)                      | resource    |
| [aws_lambda_function.lambda_function](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function)                                              | resource    |
| [aws_lambda_permission.allow_eventbridge_to_invoke_function](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_permission)                     | resource    |
| [aws_ssm_parameter.twilio_auth_token](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter)                                                | resource    |
| [aws_kms_key.aws_managed_parameter_store_key](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/kms_key)                                           | data source |

## Inputs

| Name                                                                                             | Description                                                                                                                                                                                                                                                | Type     | Default                  | Required |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------ | :------: |
| <a name="input_from_phone_number"></a> [from_phone_number](#input_from_phone_number)             | The Twilio phone number to send SMS from                                                                                                                                                                                                                   | `string` | n/a                      |   yes    |
| <a name="input_function_name"></a> [function_name](#input_function_name)                         | The name of the lambda function                                                                                                                                                                                                                            | `string` | `"scheduled-sms-sender"` |    no    |
| <a name="input_log_retention_in_days"></a> [log_retention_in_days](#input_log_retention_in_days) | The number of days to retain CloudWatch Logs for                                                                                                                                                                                                           | `number` | `7`                      |    no    |
| <a name="input_message"></a> [message](#input_message)                                           | The SMS body to send                                                                                                                                                                                                                                       | `string` | n/a                      |   yes    |
| <a name="input_schedule_enabled"></a> [schedule_enabled](#input_schedule_enabled)                | Whether the schedule is enabled                                                                                                                                                                                                                            | `bool`   | `true`                   |    no    |
| <a name="input_schedule_expression"></a> [schedule_expression](#input_schedule_expression)       | The schedule for which the lambda function will be invoked. The schedule can be either a cron expression or a rate expression. See the AWS Docs https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-rule-schedule.html for more information | `string` | `"rate(1 hour)"`         |    no    |
| <a name="input_to_phone_number"></a> [to_phone_number](#input_to_phone_number)                   | The phone number to send the SMS to                                                                                                                                                                                                                        | `string` | n/a                      |   yes    |
| <a name="input_twilio_account_sid"></a> [twilio_account_sid](#input_twilio_account_sid)          | The SID of your Twilio account                                                                                                                                                                                                                             | `string` | n/a                      |   yes    |
| <a name="input_twilio_auth_token"></a> [twilio_auth_token](#input_twilio_auth_token)             | The Auth Token for your Twilio account                                                                                                                                                                                                                     | `string` | n/a                      |   yes    |

## Outputs

No outputs.
