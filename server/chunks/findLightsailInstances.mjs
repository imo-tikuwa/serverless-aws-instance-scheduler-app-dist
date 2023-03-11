import { defineEventHandler } from 'h3';
import { GetInstancesCommand, LightsailClient } from '@aws-sdk/client-lightsail';

const lightsail = new LightsailClient({
  region: process.env.AWS_DEFAULT_REGION
});
const findLightsailInstances = defineEventHandler(async (_event) => {
  var _a;
  const result = await lightsail.send(new GetInstancesCommand({}));
  const instances = (_a = result.instances) == null ? void 0 : _a.map((instance) => {
    var _a2;
    return {
      name: instance.name,
      blueprintName: instance.blueprintName,
      state: (_a2 = instance.state) == null ? void 0 : _a2.name,
      publicIpAddress: instance.publicIpAddress,
      privateIpAddress: instance.privateIpAddress
    };
  });
  return instances;
});

export { findLightsailInstances as default };
//# sourceMappingURL=findLightsailInstances.mjs.map
