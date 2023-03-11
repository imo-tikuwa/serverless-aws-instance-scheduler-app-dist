import { defineEventHandler } from 'h3';
import { DescribeInstancesCommand, EC2Client } from '@aws-sdk/client-ec2';

const ec2 = new EC2Client({
  region: process.env.AWS_DEFAULT_REGION
});
const findEc2Instances = defineEventHandler(async (_event) => {
  var _a;
  const result = await ec2.send(new DescribeInstancesCommand({}));
  const instances = [];
  (_a = result.Reservations) == null ? void 0 : _a.forEach((reservation) => {
    var _a2;
    (_a2 = reservation == null ? void 0 : reservation.Instances) == null ? void 0 : _a2.forEach((instance) => {
      var _a3, _b, _c;
      instances.push({
        instanceId: instance.InstanceId,
        nameTag: (_b = (_a3 = instance == null ? void 0 : instance.Tags) == null ? void 0 : _a3.find((tag) => tag.Key === "Name")) == null ? void 0 : _b.Value,
        architecture: instance.Architecture,
        platformDetails: instance.PlatformDetails,
        vpcId: instance.VpcId,
        instanceType: instance.InstanceType,
        state: (_c = instance == null ? void 0 : instance.State) == null ? void 0 : _c.Name,
        privateIpAddress: instance.PrivateIpAddress
      });
    });
  });
  return instances;
});

export { findEc2Instances as default };
//# sourceMappingURL=findEc2Instances.mjs.map
