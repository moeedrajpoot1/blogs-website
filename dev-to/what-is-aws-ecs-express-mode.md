---
title: What is AWS ECS Express Mode (and when to use it)
published: true
description: A plain summary of Amazon ECS Express Mode, the three inputs it needs, what it builds for you, and the cases where you should not use it.
tags: aws, ecs, devops, tutorial
canonical_url: https://moeed.app/posts/what-is-aws-ecs-express-mode/
cover_image: https://moeed.app/posts/what-is-aws-ecs-express-mode-hero.png
---

If you have ever deployed a normal web service on ECS, the slow part was never the container. It was everything around it: a load balancer, listener rules, target groups, two security groups, a task definition, the service, auto scaling, alarms, and the networking that ties it together. ECS Express Mode is Amazon's answer to that. You give it a container image, and it builds the rest.

This is the short version. The full walkthrough is on my blog: [What is AWS ECS Express Mode](https://moeed.app/posts/what-is-aws-ecs-express-mode/).

## What you give it

Three inputs, that is the whole list:

1. **A container image** — your actual app, the kind of image you would push to ECR.
2. **A task execution IAM role** — the role ECS uses to start the container, pull the image, and write logs.
3. **An infrastructure IAM role** — the new one. The permission Express Mode uses to create the load balancer and the rest on your behalf.

The two roles are kept separate on purpose. One runs your app, the other provisions infrastructure. You do not want your running container holding permission to create load balancers.

## What it builds

From those three inputs it provisions an Application Load Balancer, an HTTPS endpoint on an AWS-provided domain, auto scaling, health checks, security groups, and monitoring set up with AWS's recommended defaults. Every resource stays fully visible and editable in your own account.

It runs on Fargate only, not the EC2 launch type. It also places up to 25 Express Mode services behind a single shared load balancer when their networking is compatible, so you are not paying for a load balancer per tiny service.

## What it costs

The feature has no extra charge and is in all regions. You pay only for the AWS resources it creates to run the app. You save the setup time, not the running cost.

## When not to use it

Express Mode trades configurability for speed. Skip it when you need:

- **Blue/green deployments** — not supported.
- **A service mesh or detailed networking control** — not available.
- **The EC2 launch type** — Fargate only.
- **A dedicated load balancer** with custom listener logic.

Because every resource stays in your account, you are not locked in. Start on Express Mode, and when a service grows into one of those cases, migrate it to a standard ECS service rather than rebuilding from scratch.

---

The full version explains the IAM roles, the shared load balancer model, the comparison table against a standard ECS service, and a full FAQ: [What is AWS ECS Express Mode (and when to use it)](https://moeed.app/posts/what-is-aws-ecs-express-mode/).
