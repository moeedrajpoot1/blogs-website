---
title: "CannotPullContainerError in ECS: 7 Causes and Fixes (2026)"
description: "The CannotPullContainerError in ECS comes from one of seven causes. Read the exact message, match it here, and apply the fix for that specific cause."
pubDate: 2026-05-20
author: "Muhammad Moeed"
tags: ["aws", "ecs", "devops", "tutorials"]
keywords: [
  "cannotpullcontainererror",
  "cannotpullcontainererror ecs",
  "cannotpullcontainererror fargate",
  "ecs fargate cannotpullcontainererror",
  "fix cannotpullcontainererror",
  "ecs task cant pull image",
  "ecs pull access denied",
  "cannotpullcontainererror no space left on device",
  "ecs ecr permission denied",
  "cannotpullcontainererror toomanyrequests"
]
heroImage: "/posts/fix-cannotpullcontainererror-ecs-hero.png"
heroAlt: "Title card for the article on fixing CannotPullContainerError in ECS, listing the seven causes: IAM permissions, network routing, wrong image or tag, architecture mismatch, disk or ephemeral storage, Docker Hub rate limit, and missing VPC endpoints"
featured: false
---

`CannotPullContainerError` is the error you see when an ECS task stops before its container even starts. It shows up in the stopped task details in the ECS console, in CloudWatch, and at the bottom of your CI logs. The frustrating part is the message is generic. The underlying cause is not generic — there are seven distinct reasons this fires, and the fix for one will not help with the others.

This guide takes every variant the [official AWS troubleshooting page](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_cannot_pull_image.html) documents, groups them by root cause, and gives you the exact diagnosis and fix for each. Open your stopped task error message in another tab, match it to one of the seven, and skip to that section.

> `CannotPullContainerError` has seven causes: IAM role missing ECR permissions, network can't reach ECR (no NAT/VPC endpoints, no public IP, blocked security groups), the image or tag does not exist, architecture mismatch (ARM vs AMD), disk space or ephemeral storage too small, Docker Hub rate limit, or a missing S3 gateway endpoint when using VPC endpoints. The fix depends on which one. Read the exact error message first, then match it to the right section.

![Title card for the article on fixing CannotPullContainerError in ECS, listing the seven causes](/posts/fix-cannotpullcontainererror-ecs-hero.png)

## First, get the exact error message

Before you change anything, find the full message. The error category is `CannotPullContainerError`, but the text after it is what tells you which of the seven causes you have.

1. Open the ECS console, go to your cluster, then your service.
2. Open the **Tasks** tab and switch the filter to **Stopped**.
3. Click the task. The **Stopped reason** field has the full message.

If you are on Fargate platform version 1.4, the message is truncated. You can also see the full message in the `StoppedReason` field of `aws ecs describe-tasks`. Copy that whole line and keep it nearby.

## Cause 1: The task execution role is missing ECR permissions

**You see:**

> The task can't pull the image. Check that the role has the permissions to pull images from the registry.

Or sometimes:

> pull access denied

This is the most common cause. Pulling from ECR is an authenticated action, and ECS needs an IAM role with the right permissions to do it on your behalf.

**Fix on Fargate.** Attach the AWS managed policy `AmazonECSTaskExecutionRolePolicy` to your task execution role. This policy contains the minimum ECR permissions plus the CloudWatch Logs permissions ECS needs at startup. If the task definition references no task execution role at all, create one and attach this policy.

**Fix on EC2 launch type.** The container instance role, not the task execution role, is what pulls the image. Attach `AmazonEC2ContainerRegistryReadOnly` to the EC2 instance profile your container instances use.

**The minimum ECR permissions, if you write a custom policy:**

- `ecr:GetAuthorizationToken` on `Resource: "*"`
- `ecr:BatchCheckLayerAvailability`
- `ecr:GetDownloadUrlForLayer`
- `ecr:BatchGetImage`

If you have separated dev and prod ECR repos by IAM condition keys, scope `BatchCheckLayerAvailability`, `GetDownloadUrlForLayer`, and `BatchGetImage` to the specific repository ARNs. `GetAuthorizationToken` always needs `Resource: "*"`.

After updating the role, restart the service so it picks up a fresh task with the new permissions.

## Cause 2: The task cannot reach ECR over the network

**You see:**

> The task cannot pull '...' from the Amazon ECR repository '...'. There is a connection issue between the task and Amazon ECR. Check your task network configuration.

Or:

> `API error (500): Get https://aws_account.dkr.ecr.us-east-1.amazonaws.com/v2/: net/http: request canceled while waiting for connection`

This is the second most common cause and the most painful, because the configuration is split across several AWS services and there is no single page that shows it. The fix depends on which subnet your task runs in.

**Task in a public subnet.** Set `assignPublicIp` to `ENABLED` in the network configuration. Without a public IP, the task has no way out to the ECR endpoint. The subnet route table must also have a default route (`0.0.0.0/0`) pointing to an internet gateway.

**Task in a private subnet with internet egress.** The subnet's default route must point to a NAT gateway in a public subnet, and the NAT gateway must have an Elastic IP. Confirm by inspecting the private subnet's route table — there should be a `0.0.0.0/0` row whose target is the NAT gateway.

**Task in a private subnet without internet egress (VPC endpoints).** Create three endpoints in the VPC, all attached to the private subnets:

- `com.amazonaws.{region}.ecr.api` (Interface endpoint)
- `com.amazonaws.{region}.ecr.dkr` (Interface endpoint)
- `com.amazonaws.{region}.s3` (Gateway endpoint, with a route entry added to the route table)

All three are required on Fargate platform version 1.4.0 and later, as documented in the official [Amazon ECR interface VPC endpoints page](https://docs.aws.amazon.com/AmazonECR/latest/userguide/vpc-endpoints.html). The S3 gateway endpoint is the one most people forget — ECR stores image layers in S3, so without that endpoint the layers can never be pulled. The interface endpoints also need a security group that allows inbound TCP 443 from the task's security group.

**Last check: outbound from the task's security group.** Whichever network model you use, the task's security group must allow outbound TCP 443 to the ECR or VPC endpoint addresses. Most teams who hit this issue have it locked down to only the load balancer.

## Cause 3: The image or tag does not exist in ECR

**You see:**

> CannotPullContainerError: pull image manifest has been retried 5 time(s): failed to resolve ref

This is usually one of three things: a typo in the task definition, a tag that was overwritten, or a tag that was deleted. ECS asked ECR for a specific reference and ECR said it does not exist.

**Diagnose:**

1. In the task definition, copy the full `image` value.
2. Run `aws ecr describe-images --repository-name {repo} --image-ids imageTag={tag}` for that tag.
3. If the command errors with `ImageNotFoundException`, the tag is the problem. If it returns metadata, you have a permissions or network problem instead, not this cause.

**Fix:**

- Push the image again under that tag, or update the task definition to a tag that actually exists.
- Stop using `:latest` for production. ECS enforces image version stability, and the moment the underlying digest for `:latest` changes or is deleted, all tasks pulling it stop. Use semantic tags or the image digest (`@sha256:...`) instead.

## Cause 4: The image architecture does not match the task

**You see:**

> ref pull has been retried 1 time(s): failed to copy: httpReaderSeeker: failed open: unexpected status code

This often points to an architecture mismatch. The image is built for one CPU architecture (commonly ARM64) and the task is scheduled on another (commonly AMD64), or it is a Linux image being scheduled on a Windows task, or vice versa.

This used to be rare. It became common as more developers moved to Apple Silicon (M1, M2, M3, M4), which builds ARM64 images by default. If you `docker build` on a Mac and push without a platform flag, you push an ARM64 image. ECS Fargate defaults to AMD64 unless you tell it otherwise.

**Fix.** Either build for the right platform, or build a multi-architecture image so it works on both.

For a single platform that matches your ECS runtime:

`docker buildx build --platform linux/amd64 -t {repo}:{tag} . --push`

For a multi-architecture image:

`docker buildx build --platform linux/amd64,linux/arm64 -t {repo}:{tag} . --push`

The multi-arch version is the safer default because the same image works on Fargate AMD64, Fargate ARM (Graviton), and your local laptop.

## Cause 5: Disk space or ephemeral storage is too small

**You see (EC2 launch type):**

> write /var/lib/docker/tmp/GetImageBlob{xxxxxxxxxx}: no space left on device

**You see (Fargate):**

> ref pull has been retried 1 time(s): failed to extract layer no space left on device: unknown

The image is larger than the disk available to extract it. On EC2, this means the container instance is full. On Fargate, this means the task's ephemeral storage (20 GiB by default) is too small for the image.

**Fix on EC2.** Identify the largest consumers with `du -Sh / | sort -rh | head -20` on the instance. Usually it is old container logs in `/var/lib/docker/containers/`. Set a `max-size` on the `json-file` log driver in your task definition, or switch to the `awslogs` driver so logs go to CloudWatch instead of disk.

**Fix on Fargate.** Increase ephemeral storage in the task definition. The field is `ephemeralStorage.sizeInGiB` and the maximum is 200 GiB. Most images do not need that much, but if you are pulling a 5 GiB image with a Node `node_modules` layer or a multi-stage build that does not stage properly, the default 20 GiB can be tight. Slim the image first if you can — a `.dockerignore` file and multi-stage builds usually cut image size by half or more.

## Cause 6: Docker Hub rate limit

**You see:**

> ERROR: toomanyrequests: Too Many Requests or You have reached your pull rate limit.

The image lives on Docker Hub and you have hit the [anonymous pull rate limit](https://docs.docker.com/docker-hub/usage/) (100 pulls per 6 hours from an IP) or the authenticated free tier (200 pulls per 6 hours). This usually shows up in CI environments where many tasks share an outbound IP via NAT.

**Fix, in order of effort:**

1. **Authenticate the pull.** Store Docker Hub credentials in AWS Secrets Manager and reference the secret in your task definition's `repositoryCredentials` block. This doubles your limit and de-anonymizes the request.
2. **Use ECR pull through cache.** Create a [pull-through cache rule](https://docs.aws.amazon.com/AmazonECR/latest/userguide/pull-through-cache.html) that proxies Docker Hub images through ECR. After the first pull, subsequent ones come from ECR with no Docker Hub limit. Change the task definition `image` to the ECR URI of the cached repo.
3. **Pay for Docker Hub.** A paid Docker plan increases the rate limit. Worth it only if you cannot move off Docker Hub for organizational reasons.

The pull-through cache is the right answer for most teams.

## Cause 7: Missing the S3 gateway endpoint (subtle VPC case)

**You see:**

> Context canceled

Or:

> pull command failed: panic: runtime error: invalid memory address or nil pointer dereference

This is the trap that catches teams who set up the two ECR interface endpoints but forgot the S3 gateway endpoint. ECR stores its image layers in S3. The interface endpoints handle the API calls; the S3 gateway endpoint handles the actual layer downloads. Without the S3 endpoint, the API authenticates fine and then the pull hangs.

**Fix:**

- Add a `com.amazonaws.{region}.s3` Gateway endpoint to the VPC.
- In the route table for the private subnets, add a route whose destination is the prefix list for S3 in that region and whose target is the gateway endpoint. The console adds this automatically if you select the right route tables when creating the endpoint; check it is actually there.

The same fix applies if your security group rules look correct but pulls still time out with the API responding fast.

## A faster way to diagnose, in order

If you do not yet know which cause it is, do these in this order. Each step rules out the most common case before the rarer ones.

1. **Read the full error message.** The text after `CannotPullContainerError` matches one of the seven sections above almost word-for-word.
2. **Check the task execution role attachments.** If `AmazonECSTaskExecutionRolePolicy` is not there for Fargate (or `AmazonEC2ContainerRegistryReadOnly` for EC2), you found it. Fix and re-run.
3. **From any working machine in the same VPC, run `aws ecr get-login-password --region {region}`** and then attempt a `docker pull` against the same image URI. If this fails, the network is the issue, not ECS.
4. **Run `aws ecr describe-images`** to confirm the tag exists. If it does not, you are in cause 3.
5. **Check the image manifest** with `docker buildx imagetools inspect {image}`. If it does not list `linux/amd64`, you are in cause 4.

In most production cases the answer is found in step one. The exact wording of the stopped reason is the actual lookup key.

## Prevention: a short checklist for new ECS services

If you do these once when you set up the service, six of the seven causes never happen:

- The task execution role exists and has `AmazonECSTaskExecutionRolePolicy` attached.
- The image tag in the task definition is a real, immutable tag (not `:latest`).
- The build pipeline uses `docker buildx --platform linux/amd64` (or multi-arch).
- The VPC has either NAT internet egress or the three VPC endpoints (`ecr.api`, `ecr.dkr`, `s3`).
- The task security group allows outbound TCP 443.
- For Fargate, the task ephemeral storage is sized for the image, not the default 20 GiB if your image is large.

If you also use a base image from Docker Hub, set up the ECR pull-through cache. That covers the last case.

## Frequently asked questions

### What is CannotPullContainerError in ECS?

It is the error ECS raises when a task stops before its container starts, because the image could not be retrieved from the registry. The cause is in the message after the error category — there are seven distinct causes documented by AWS, each with its own fix.

### How do I see the full CannotPullContainerError message?

Open the ECS console, go to your service's stopped tasks, click the task, and read the **Stopped reason** field. On Fargate 1.4 the message can be truncated in the console; `aws ecs describe-tasks` returns the full text.

### Why does CannotPullContainerError happen in a private subnet?

The task has no route to the ECR endpoint. Either add a NAT gateway with a default route, or three VPC endpoints — `ecr.api`, `ecr.dkr`, and the S3 gateway endpoint. Missing the S3 endpoint is the most commonly overlooked piece.

### Does CannotPullContainerError mean my image is bad?

Not necessarily. The image might be perfect and the task still fails to pull it for permission, network, or rate-limit reasons. Match the exact text after `CannotPullContainerError` to one of the seven causes above before changing the image.

### What is the difference between CannotPullContainerError and CannotStartContainerError?

`CannotPullContainerError` happens before the container exists locally — ECS could not get the image. `CannotStartContainerError` happens after the image is pulled, when ECS tries to run it. Different stages, different causes, different fixes.

### Should I use `:latest` as my image tag in ECS?

No. ECS enforces image version stability based on the digest, and when the digest behind `:latest` changes, in-flight tasks fail to pull. Use semantic tags or the image digest in production task definitions.

## Where to go next

If you are still setting up ECS, the [ECS introduction](/posts/what-is-aws-ecs/) covers how task definitions, services, and clusters fit together. If the image registry side is new to you, the [ECR guide](/posts/what-is-aws-ecr/) walks through how repositories, tags, and permissions work. If you are starting a new service from scratch and want the network and IAM defaults already done for you, [ECS Express Mode](/posts/what-is-aws-ecs-express-mode/) handles all of cause 1 and cause 2 automatically. And if you have been deploying with AWS Copilot CLI, note that the tool reaches [end of support on June 12, 2026](/posts/aws-copilot-cli-end-of-support/) — the migration paths are in that article.

Save the seven-cause map. The next time `CannotPullContainerError` shows up, you will spend a minute matching the message, not an afternoon guessing.
