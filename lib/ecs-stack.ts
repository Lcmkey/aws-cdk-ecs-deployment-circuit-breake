import { Construct, Stack, StackProps, CfnOutput } from "@aws-cdk/core";

import { IVpc, Vpc } from "@aws-cdk/aws-ec2";
import {
  Cluster,
  FargateTaskDefinition,
  ContainerImage,
} from "@aws-cdk/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "@aws-cdk/aws-ecs-patterns";

interface EcsPropsStack extends StackProps {
  readonly prefix: string;
  readonly stage: string;
}

export class EcsStack extends Stack {
  constructor(scope: Construct, id: string, props: EcsPropsStack) {
    super(scope, id, props);

    /**
     * Get var from props
     */
    const { prefix, stage } = props;

    const stack = Stack.of(this);

    /**
     * Define Vpc
     */
    const vpc = getOrCreateVpc(this);

    /**
     * Define Cluster
     */
    const cluster = new Cluster(this, `${prefix}-${stage}-"Custer`, {
      vpc,
      clusterName: `${prefix}-${stage}-Custer`,
    });

    /**
     * Define Task Definitions
     */
    const taskDef = new FargateTaskDefinition(
      this,
      `${prefix}-${stage}-"Task-Def`,
      {
        cpu: 256,
        memoryLimitMiB: 512,
      },
    );

    taskDef
      .addContainer(`${prefix}-${stage}-HelloWorld-Container`, {
        image: ContainerImage.fromRegistry("tutum/hello-world"),
        environment: {
          PLATFORM: "Amazon ECS",
        },
      })
      .addPortMappings({ containerPort: 80 });

    /**
     * Bad Task starts here
     */
    const badTaskDef = new FargateTaskDefinition(
      this,
      `${prefix}-${stage}-"Bad-Task-Def`,
      {
        cpu: 256,
        memoryLimitMiB: 512,
      },
    );

    badTaskDef
      .addContainer(`${prefix}-${stage}-HelloWorld-Container`, {
        image: ContainerImage.fromRegistry("tutum/hello-world"),
        environment: {
          PLATFORM: "Amazon ECS",
        },
        command: ["bash", "-c", "exit 2"],
      })
      .addPortMappings({ containerPort: 80 });

    /**
     * Define Application Load Balance Fargate Service
     */
    const appLBFS = new ApplicationLoadBalancedFargateService(
      this,
      `${prefix}-${stage}-App-LB-FG-Service`,
      {
        serviceName: `${prefix}-${stage}-App-LB-FG-Service`,
        cluster,
        taskDefinition: taskDef,
      },
    );

    /**
     * Output
     */
    new CfnOutput(stack, "Task", { value: taskDef.taskDefinitionArn });
    new CfnOutput(stack, "BadTask", { value: badTaskDef.taskDefinitionArn });
    new CfnOutput(stack, "Cluster", { value: cluster.clusterName });
    new CfnOutput(stack, "Service", { value: appLBFS.service.serviceName });
  }
}

function getOrCreateVpc(scope: Construct): IVpc {
  /**
   * Use An existing vpc or create a new one
   */
  // const useDefaultVpc = scope.node.tryGetContext("use_default_vpc") === "1";
  return new Vpc(scope, "Vpc", { maxAzs: 3, natGateways: 1 });
  // let vpc;
  // if (useDefaultVpc) {
  // vpc = Vpc.fromLookup(scope, "Vpc", { isDefault: true });
  // } else {
  //   vpc = scope.node.tryGetContext("use_vpc_id")
  //     ? Vpc.fromLookup(scope, "Vpc", {
  //         vpcId: scope.node.tryGetContext("use_vpc_id"),
  //       })
  //     : new Vpc(scope, "Vpc", { maxAzs: 3, natGateways: 1 });
  // }

  // return vpc;
}
