---
title: "AWS Copilot CLI End of Support: Migration Guide for 2026"
description: "AWS Copilot CLI reaches end of support on June 12, 2026. What AWS recommends migrating to, how to choose, and a service-by-service map."
pubDate: 2026-05-19
author: "Muhammad Moeed"
tags: ["aws", "ecs", "devops", "tutorials"]
keywords: [
  "aws copilot cli end of support",
  "aws copilot cli deprecated",
  "aws copilot cli migration",
  "copilot cli alternative",
  "ecs express mode vs copilot",
  "aws cdk vs aws copilot",
  "copilot cli june 12 2026",
  "what to use instead of aws copilot",
  "migrate from aws copilot to cdk",
  "copilot cli replacement"
]
heroImage: "/posts/aws-copilot-cli-end-of-support-hero.png"
heroAlt: "Title card for the article AWS Copilot CLI End of Support, listing the date June 12 2026 and the two recommended migration paths: ECS Express Mode and AWS CDK"
featured: false
---

If you have been using AWS Copilot CLI to deploy containers on ECS, the tool has a date on it. **AWS Copilot CLI reaches end of support on June 12, 2026.** After that date, the open-source project stays on GitHub, but AWS will not ship new features, fixes, or security patches for it. The [official AWS announcement from March 6, 2026](https://aws.amazon.com/blogs/containers/announcing-the-end-of-support-for-the-aws-copilot-cli/) spells out what to do instead, and the [GitHub repo banner](https://github.com/aws/copilot-cli) confirms the same date.

This guide is the short, honest version. What stops, what keeps running, what AWS actually recommends, and how to pick between the two recommended paths for the kind of service you have. Every fact here is from the official AWS announcement or the docs it links to.

> AWS Copilot CLI reaches end of support on June 12, 2026. Your apps keep running, but the tool itself stops getting updates. AWS recommends migrating to one of two things: **Amazon ECS Express Mode** for the fastest path from container to production, or **AWS CDK Layer 3 (L3) constructs** when you need fine-grained control. Copilot generated standard CloudFormation, so you can also take those stacks over directly. Pick a path before June 12 and migrate one service at a time.

![Title card for the article AWS Copilot CLI End of Support, listing the date June 12 2026 and the two recommended migration paths: ECS Express Mode and AWS CDK](/posts/aws-copilot-cli-end-of-support-hero.png)

## What changes on June 12, 2026

Nothing about your running apps. The containers you deployed with Copilot keep serving traffic. The ECS services, load balancers, and CloudFormation stacks Copilot created are still there, in your account, owned by you.

What changes is the tool. From June 12 onward:

- **No new features.** No new Copilot commands, no new manifest options, no new service types.
- **No security updates.** Bugs in Copilot itself, including security issues, will not be patched by AWS.
- **No technical support.** AWS Support cannot help you with Copilot questions after that date.
- **The GitHub repo stays open.** Anyone can fork it, run it, and contribute. It just is not an AWS-maintained tool anymore.

If you do nothing, your apps continue to run. The risk is in the tool itself, not in what it built. Over time, the gap between Copilot and current AWS features will grow, and you will eventually want to be on something maintained.

## The two paths AWS recommends

AWS named two replacements in its announcement, and they are meant for different kinds of teams.

### Amazon ECS Express Mode

ECS Express Mode is the closest thing in spirit to Copilot. You give it three inputs, a container image and two IAM roles, and it provisions the load balancer, listener, target groups, security groups, auto scaling, and monitoring with sensible defaults. The full breakdown is in my [ECS Express Mode guide](/posts/what-is-aws-ecs-express-mode/).

**Pick this when:**

- You want the fastest path from container to production.
- A standard Fargate web service is what you actually need.
- You are happy to share an Application Load Balancer with up to 24 other Express Mode services.
- You do not need blue/green deployments or a service mesh.

It runs only on Fargate. If your Copilot service was already Fargate, this is the lowest-friction move.

### AWS CDK Layer 3 (L3) Constructs

CDK is AWS's infrastructure-as-code framework, and the `aws-ecs-patterns` library has Layer 3 constructs that bundle whole patterns into a few lines of code. `ApplicationLoadBalancedFargateService`, `QueueProcessingFargateService`, `ScheduledFargateTask`, and a few others cover most of what Copilot used to do.

**Pick this when:**

- You need fine-grained control over networking, scaling, or deployment behavior.
- You want infrastructure as code that lives in your repo, gets reviewed, and changes through pull requests.
- Your team already uses CDK for other things and the muscle memory is there.
- You need blue/green deployments, service mesh, custom listener rules, or non-Fargate launch types.

CDK is more flexible than Express Mode. It is also more code to write and read.

## A service-by-service migration map

Copilot grouped applications into service types in its manifest. The official announcement maps each one to a recommended replacement. Here is the same map in one place.

| Copilot service type | What it was | Recommended replacement |
|---|---|---|
| Load Balanced Web Service | Public Fargate service behind an ALB | **ECS Express Mode**, or CDK `ApplicationLoadBalancedFargateService` |
| Request-Driven Web Service | Auto-scaling public service | **ECS Express Mode** with request-based scaling |
| Backend Service | Internal-only service | CDK `ApplicationLoadBalancedFargateService` (internal), or **ECS Service Connect** |
| Worker Service | Queue-consuming workers | CDK `QueueProcessingFargateService` |
| Scheduled Job | Cron-style task | **EventBridge Scheduler** with ECS `RunTask`, or CDK `ScheduledFargateTask` |
| Static Site | Static asset hosting | **AWS CDK CloudFront** constructs, or **AWS Amplify Hosting** |

The first two rows are where most teams sit. If your services are load-balanced or request-driven and you want to keep things simple, Express Mode is the path of least resistance. Worker and scheduled patterns mostly become CDK constructs.

## The third option: take over the CloudFormation

Copilot is, in the end, a generator. It writes CloudFormation templates and creates the stacks. Those templates and stacks live in your account. You can stop running `copilot deploy` and start managing the stacks directly, the same way you would manage any other CloudFormation stack you wrote.

This is the lowest-effort option in the short term, because you change nothing about the infrastructure. The trade-off is long-term: the templates Copilot produced were not written to be human-edited, and modifying them by hand is fiddly. Most teams who pick this route end up on CDK or Express Mode within a release cycle or two anyway. It is a reasonable bridge, not a destination.

## How to plan the migration

The safe order is one service at a time, not one big switch.

1. **Inventory.** List every service you have deployed with Copilot, with its service type and current environment. The `copilot svc ls` command gives you the list; the manifests in `copilot/` give you the type.
2. **Match each service to its replacement** using the table above. Most teams find that 70 to 80 percent of services match Express Mode and the rest go to CDK.
3. **Pick a low-stakes service to migrate first.** Something with low traffic and a clear rollback path. The point of the first migration is to learn the workflow, not to ship the hardest case.
4. **Run both in parallel for a few days.** Deploy the new version under a new name or path. Watch metrics. Cut over when you are satisfied.
5. **Decommission the Copilot version** by deleting the Copilot service. The underlying CloudFormation stack is removed cleanly because Copilot manages it as a unit.
6. **Repeat** through your service list, hardest cases last.

If you only do one thing before June 12, do step one. Knowing what you have is the only step you cannot skip.

## What if you cannot migrate in time

If June 12 arrives and you are not done, you are not in danger. Your apps still run. Copilot CLI still works on your machine. You just lose the support net.

The risk is unbounded time. A security issue in Copilot itself, or a breaking change in an AWS API that Copilot depends on, becomes your problem to deal with. The longer you stay, the more likely one of those bites. Aim to be off the tool within the months following June 12, not the years.

## Frequently asked questions

### When does AWS Copilot CLI reach end of support?

June 12, 2026. After that date the tool stays open source on GitHub but does not receive AWS-provided features, fixes, or security patches.

### Will my deployed apps stop working?

No. The ECS services, load balancers, and CloudFormation stacks Copilot created stay in your account and keep running. Only the tool you used to create them is being retired.

### What does AWS recommend instead?

Two paths. Amazon ECS Express Mode for the fastest container-to-production path with standard requirements, and AWS CDK Layer 3 constructs for teams that need fine-grained control. The choice depends on how much customization you actually need, not on which is "newer".

### Is ECS Express Mode a drop-in replacement?

It is the closest replacement for the Load Balanced Web Service and Request-Driven Web Service types in Copilot. It is Fargate-only and has limits, including no blue/green deployments and no custom listener rules. The [Express Mode guide](/posts/what-is-aws-ecs-express-mode/) covers the limits in full.

### Can I keep using Copilot CLI after June 12, 2026?

Yes. The project is open source and will continue to exist on GitHub. You just will not get AWS feature work, fixes, or security patches. For low-stakes side projects this is fine. For production workloads it is risky long-term.

### Where do scheduled jobs go?

To EventBridge Scheduler with ECS `RunTask`, or to CDK's `ScheduledFargateTask` construct. Both are first-class AWS features that get continued support.

## Where to go next

If your service is a standard Fargate web service, start with the [ECS Express Mode guide](/posts/what-is-aws-ecs-express-mode/) and prototype one service in a sandbox account. If you need control beyond what Express Mode offers, the [AWS CDK ECS patterns documentation](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecs_patterns-readme.html) is the right place to read next. For background on ECS itself, the [ECS introduction](/posts/what-is-aws-ecs/) and the [ECR guide](/posts/what-is-aws-ecr/) cover the pieces around your container image. If your Copilot setup was doing blue/green or rolling cutovers for you, the [deployment strategies guide](/posts/deployment-strategies-explained/) explains the trade-offs so you can replicate them in whatever you migrate to. And if you trip the standard image-pull failure on day one of the cutover, the [CannotPullContainerError causes and fixes](/posts/fix-cannotpullcontainererror-ecs/) guide groups every variant by root cause so you can fix it without guessing.

Pick the path now, migrate one low-stakes service this week, and you will not be the team scrambling on June 11.
