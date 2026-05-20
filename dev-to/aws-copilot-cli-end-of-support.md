---
title: AWS Copilot CLI is reaching end of support — your migration options
published: true
description: AWS Copilot CLI reaches end of support on June 12, 2026. What that means, what AWS recommends migrating to, and a service-by-service map.
tags: aws, ecs, devops, tutorial
canonical_url: https://moeed.app/posts/aws-copilot-cli-end-of-support/
cover_image: https://moeed.app/posts/aws-copilot-cli-end-of-support-hero.png
---

If you have been using AWS Copilot CLI to deploy containers on ECS, the tool has a date on it. **AWS Copilot CLI reaches end of support on June 12, 2026.** After that, the open-source project stays on GitHub, but AWS will not ship features, fixes, or security patches for it.

This is the short version. The full walkthrough is on my blog: [AWS Copilot CLI End of Support: Migration Guide for 2026](https://moeed.app/posts/aws-copilot-cli-end-of-support/).

## What changes on June 12, 2026

Your running apps do not. The ECS services, load balancers, and CloudFormation stacks Copilot created stay in your account.

What changes is the tool:

- No new features.
- No security updates from AWS.
- No technical support.
- The GitHub repo stays open, but it is no longer AWS-maintained.

## What AWS recommends instead

Two paths, for two kinds of teams.

**Amazon ECS Express Mode.** The fastest path from a container image to production. You hand it an image and two IAM roles, and it builds the load balancer, listener, target groups, security groups, scaling, and monitoring. Fargate-only. Closest in spirit to Copilot. Pick this if your service is a standard load-balanced or request-driven web app.

**AWS CDK Layer 3 constructs.** The `aws-ecs-patterns` library has constructs like `ApplicationLoadBalancedFargateService`, `QueueProcessingFargateService`, and `ScheduledFargateTask` that cover most patterns Copilot supported. Pick this if you need fine-grained control, blue/green, a service mesh, or non-Fargate launch types.

You can also take over the CloudFormation Copilot generated and manage it directly. Low effort short-term, but those templates are not built to be human-edited. Treat it as a bridge.

## Service-by-service map

| Copilot service type | Replacement |
|---|---|
| Load Balanced Web Service | ECS Express Mode, or CDK `ApplicationLoadBalancedFargateService` |
| Request-Driven Web Service | ECS Express Mode with request-based scaling |
| Backend Service | CDK internal ALB, or ECS Service Connect |
| Worker Service | CDK `QueueProcessingFargateService` |
| Scheduled Job | EventBridge Scheduler + ECS `RunTask`, or CDK `ScheduledFargateTask` |
| Static Site | CDK CloudFront constructs, or AWS Amplify Hosting |

Most teams find that web services land on Express Mode and workers/scheduled jobs land on CDK.

## How to plan the move

One service at a time, not one big switch:

1. Inventory every service. `copilot svc ls` gives the list; the `copilot/` manifests give the type.
2. Match each to its replacement.
3. Pick a low-traffic service for the first migration. The point is to learn the workflow, not to ship the hardest case.
4. Run both versions in parallel for a few days, watch metrics, cut over.
5. Delete the Copilot service to remove its stack cleanly.
6. Repeat. Hardest cases last.

If you only do one thing before June 12, do step one.

---

The full guide covers the IAM-role split for Express Mode, when CDK is actually worth it, the third path of taking over the CloudFormation directly, and what happens if you cannot migrate in time: [AWS Copilot CLI End of Support: Migration Guide for 2026](https://moeed.app/posts/aws-copilot-cli-end-of-support/).
