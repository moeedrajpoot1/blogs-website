---
title: CannotPullContainerError in ECS — the 7 causes and how to fix each
published: true
description: The CannotPullContainerError in ECS comes from one of seven causes. Read the exact message, match it here, and apply the fix for that specific cause.
tags: aws, ecs, devops, tutorial
canonical_url: https://moeed.app/posts/fix-cannotpullcontainererror-ecs/
cover_image: https://moeed.app/posts/fix-cannotpullcontainererror-ecs-hero.png
---

`CannotPullContainerError` shows up when an ECS task stops before its container starts. The error category is generic; the cause is not. AWS documents seven distinct reasons this fires, each with its own fix.

This is the short version. The full guide is on my blog: [CannotPullContainerError in ECS: 7 Causes and Fixes (2026)](https://moeed.app/posts/fix-cannotpullcontainererror-ecs/).

## Read the exact message first

Open the ECS console → your cluster → service → **Tasks** → filter to **Stopped** → click the task → read the **Stopped reason** field. The text after `CannotPullContainerError` is what tells you which cause you have. On Fargate platform version 1.4 the console truncates it, so use `aws ecs describe-tasks` for the full text.

## The 7 causes

### 1. IAM role missing ECR permissions

Message: *"The task can't pull the image. Check that the role has the permissions to pull images from the registry."* or *"pull access denied"*.

Fix on Fargate: attach `AmazonECSTaskExecutionRolePolicy` to the task execution role. Fix on EC2: attach `AmazonEC2ContainerRegistryReadOnly` to the container instance role.

### 2. Network cannot reach ECR

Message: *"There is a connection issue between the task and Amazon ECR"* or *"net/http: request canceled while waiting for connection"*.

- Public subnet: set `assignPublicIp: ENABLED` and confirm the route table has a `0.0.0.0/0` route to an internet gateway.
- Private subnet with NAT: confirm the default route points to the NAT gateway.
- Private subnet with VPC endpoints: you need **three** endpoints — `ecr.api` (interface), `ecr.dkr` (interface), and `s3` (gateway, with a route added). All three are required on Fargate 1.4.0+.
- Task security group must allow outbound TCP 443.

### 3. Image or tag does not exist

Message: *"pull image manifest has been retried 5 time(s): failed to resolve ref"*.

Run `aws ecr describe-images --repository-name {repo} --image-ids imageTag={tag}`. If it errors with `ImageNotFoundException`, the tag is your problem. Push it again or fix the task definition. Stop using `:latest` in production — use semantic tags or digests (`@sha256:...`).

### 4. Architecture mismatch

Message: *"ref pull has been retried 1 time(s): failed to copy: httpReaderSeeker: failed open: unexpected status code"*.

Common when building on Apple Silicon (ARM64) and running on Fargate (AMD64 by default). Fix with `docker buildx build --platform linux/amd64` or build multi-arch: `docker buildx build --platform linux/amd64,linux/arm64`.

### 5. Disk space or ephemeral storage too small

Message: *"no space left on device"*.

- EC2: clean up. Switch the log driver to `awslogs` or add `max-size` to `json-file`.
- Fargate: bump `ephemeralStorage.sizeInGiB` (max 200). First, slim the image with multi-stage builds and a proper `.dockerignore`.

### 6. Docker Hub rate limit

Message: *"toomanyrequests: Too Many Requests"*.

Anonymous Docker Hub pulls are limited to 100 per 6 hours per IP. CI traffic on shared NATs hits this easily. Best fix: ECR pull-through cache. Set up a rule that proxies Docker Hub through ECR, update task definition images to the ECR URI, done.

### 7. Missing S3 gateway endpoint (subtle)

Message: *"Context canceled"* or *"runtime error: invalid memory address or nil pointer dereference"*.

ECR stores layers in S3. If you set up only the two ECR interface endpoints, authentication works and the actual pull hangs. Add the `s3` gateway endpoint and make sure the route table has the S3 prefix list pointing to it.

## A faster diagnostic order

1. Read the full stopped reason.
2. Check the task execution role has the right managed policy.
3. From the same VPC, try `aws ecr get-login-password` then `docker pull` against the same image URI. If that fails, it is a network issue.
4. `aws ecr describe-images` to confirm the tag.
5. `docker buildx imagetools inspect {image}` to confirm `linux/amd64` (or whatever platform you target) is listed.

Usually step one is enough.

---

The full guide explains each cause in depth, the minimum IAM permission set, the three-endpoint VPC pattern, the ECR pull-through cache setup, and a prevention checklist for new services: [CannotPullContainerError in ECS: 7 Causes and Fixes (2026)](https://moeed.app/posts/fix-cannotpullcontainererror-ecs/).
