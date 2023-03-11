import { defineEventHandler } from 'h3';
import { ListRulesCommand, ListTargetsByRuleCommand, EventBridgeClient } from '@aws-sdk/client-eventbridge';

const eventBridge = new EventBridgeClient({
  region: process.env.AWS_DEFAULT_REGION
});
const functionName = process.env.SERVERLESS_SERVICE_NAME;
const eventBusName = "default";
const createResponse = (event, status) => {
  return {
    event,
    status
  };
};
const findEventBridgeInputConstant = defineEventHandler(async (_event) => {
  const rules = await eventBridge.send(new ListRulesCommand({ EventBusName: eventBusName }));
  if (!rules.Rules) {
    return createResponse(null, "rules not found.");
  }
  for (const rule of rules.Rules) {
    const targets = await eventBridge.send(
      new ListTargetsByRuleCommand({ Rule: rule.Name, EventBusName: eventBusName })
    );
    if (!targets.Targets) {
      return createResponse(null, "targets not found.");
    }
    for (const target of targets.Targets) {
      if (!target.Arn) {
        return createResponse(null, "target Arn not found.");
      }
      if (target.Arn.split(":").pop() === functionName) {
        if (target.Input === void 0) {
          return createResponse(null, "target Input not found.");
        }
        return createResponse(JSON.parse(target.Input), "success");
      }
    }
  }
  return createResponse(null, "input constant not found.");
});

export { findEventBridgeInputConstant as default };
//# sourceMappingURL=findEventBridgeInputConstant.mjs.map
