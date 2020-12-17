#!/bin/bash

output="cfn-output.json"

Task=$(jq -r '.["Ecs-Circuit-Breaker-Dev-EcsStack"].Task' cfn-output.json)
BadTask=$(jq -r '.["Ecs-Circuit-Breaker-Dev-EcsStack"].BadTask' cfn-output.json)
Cluster=$(jq -r '.["Ecs-Circuit-Breaker-Dev-EcsStack"].Cluster' cfn-output.json)
Service=$(jq -r '.["Ecs-Circuit-Breaker-Dev-EcsStack"].Service' cfn-output.json)

updateService() {
    # Update the service and trigger a deployment
    aws ecs update-service \
        --service ${Service} \
        --cluster ${Cluster} \
        --task-definition ${BadTask} \
        --deployment-configuration "maximumPercent=200,minimumHealthyPercent=100,deploymentCircuitBreaker={enable=true,rollback=true}" \
        --desired-count 5
}

describeService() {
    aws ecs describe-services \
    --services ${Service} \
    --cluster ${Cluster} \
    --query services[].deployments[]
}

if [ -n "$1" ] && [ $1 == "update" ];
then
    updateService
else
    describeService
fi