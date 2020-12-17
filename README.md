# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

<!-- Reference -->

[ECS deployment circuit breaker]: https://aws.amazon.com/tw/blogs/containers/announcing-amazon-ecs-deployment-circuit-breaker/

# How to Run

1. Create `.env` with `.env.sample` context and change the envrionment values

2. List the Stacks

```properties
$ cdk list
```

output:

    Ecs-Circuit-Breaker-Dev-EcsStack

3. Check the diff if necessary
```
$ cdk diff -O cfn-output.json
```

4. Deploy the Stack to AWS

```
$ cdk deploy -O cfn-output.json
```

5. Check Output

```
$ cat cfn-output.json | jq -r '.["EcsStack-Dev"]'
```

6. run the Script to Desc the ecs Or update the ecs

```
<!-- Update -->
$ bash -x run.sh update

<!-- Description -->

$ bash -x run.sh
```