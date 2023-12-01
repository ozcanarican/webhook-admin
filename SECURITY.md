# Security Policy

## Supported Versions
I am currently developing a password protected url endpoints.. It will take effect after 2.0.0 version to help you to secure your webhooks.

| Version | Supported          |
| ------- | ------------------ |
| 2.0.*   | :white_check_mark: |
| < 2.0.0   | :x:                |

## Reporting a Vulnerability
In nature of the application, using code templates can create multiple security issues. When a templated webhook is accessable by attackers, a simple command like "ls $folder" can be changed to "ls && rm -rf *" with variables. Make sure to secure your url endpoints.
