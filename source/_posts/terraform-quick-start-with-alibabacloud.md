---
id: terraform-quick-start-with-alibabacloud
tags: [Terraform]
date: 2020-05-29 09:00:21
title: Terraform Quick Start with Alibabacloud
categories: Tutorials
---

As you probably heard Terraform before, it's a great DevOps tool that can help you build your infrastructures with configurations and codes, aka Infrastructure as Code.

Terraform has a bunch of great integrations with cloud platforms, some of them are maintained by Terraform official, such as Azure provider and AWS provider. However, alibabacloud (which is the biggest public cloud company in China mainland) provider is created and maintained by alibaba itself so far. Lack of quick start guide and documentation makes it a little bit hard to get started with.

<!--more-->

Therefore, this blog here might help you take a quick tour of alibabacloud provider and launch an instance from zero with the VPC, switches and security groups along. I'll list the reference docs I can find as much as possible. Let's begin!

## Preparation

Create `main.tf` to store your infra config files in any directory you prefer. However, I recommend placing the file in a git repo.

```terraform
terraform { # Terraform related configs
  backend "local" { # We use local backend to keep it simple
    path = "terraform.tfstate" # The file where the Terraform states stores in
  }
}

provider "alicloud" {
  # Here you can find the "Region ID": https://www.alibabacloud.com/help/doc-detail/40654.htm
  region     = "cn-beijing"

  # How to create a pair of access_key and secret_key: https://www.alibabacloud.com/help/doc-detail/53045.htm
  access_key = "..."
  secret_key = "..."
}

# Some useful variables to reduce copy-paste, you can add whatever you like
locals {
  prefix   = "foo"
  domain   = "wi1dcard.dev"
  hostname = "${local.prefix}.${local.domain}"
  zone     = "cn-beijing-h"
}
```

## Network Setup

Before creating an ECS instance, let's have a look at the network related resources.

```terraform
resource "alicloud_vpc" "default" {
  # Here we used the variables in the `locals` section above
  name       = local.prefix
  # Set the CIDR for this VPC
  cidr_block = "192.168.200.0/24"
}

resource "alicloud_vswitch" "default" {
  # Use the VPC's ID
  vpc_id            = alicloud_vpc.default.id
  # Set the CIDR for this switch, must be in the CIDR of the VPC
  cidr_block        = "192.168.200.0/24"
  # As the VPC is a region-specified resource, switches are for zones
  availability_zone = local.zone
}
```

The VPC and switches are both necessary, alibabacloud doesn't allow you to create an instance without the private network and the instance must be connected to a switch.

You can also set up more switches, if you'd like to have your instances across multiple zones.

The next step is to create the security group and its rules in order to allow public network access.

```terraform
resource "alicloud_security_group" "default" {
  name                = local.prefix
  vpc_id              = alicloud_vpc.default.id
  # Allow instances in the same security group reaching each other
  inner_access_policy = "Accept"
}

resource "alicloud_security_group_rule" "allow_ssh" {
  # Refer the security group ID
  security_group_id = alicloud_security_group.default.id
  type              = "ingress"
  ip_protocol       = "tcp"
  # Since the security group is for using in the VPC, you need to set it to intranet: https://www.terraform.io/docs/providers/alicloud/r/security_group_rule.html
  nic_type          = "intranet"
  policy            = "accept"
  cidr_ip           = "0.0.0.0/0"
  port_range        = "22/22"
}

resource "alicloud_security_group_rule" "allow_icmp" {
  security_group_id = alicloud_security_group.default.id
  type              = "ingress"
  ip_protocol       = "icmp"
  nic_type          = "intranet"
  policy            = "accept"
  cidr_ip           = "0.0.0.0/0"
}
```

Here I had 1 security group and 2 security group rules. I usually bind only one security group to every instance. However, it's okay if you bind multiple ones.

## SSH Authentication Setup

To enable you logging in the instances you've launched with SSH, we'd have to create an SSH key pair, or you will need to go to the web console and reset the root password.

```terraform
resource "alicloud_key_pair" "default" {
  key_name   = local.prefix
  public_key = "ssh-rsa ... wi1dcard@wi1dcard.dev"
}
```

To be noticed, both the key pairs along with other resources we just created are region-specified. if you changed the default region setting in the `provider "alicloud"` section, it is required to recreate the resources:

```terraform
provider "alicloud" {
  region = "cn-shanghai" # For example, if you changed your primary region to Shanghai
}
```

## ECS Instance

```terraform
resource "alicloud_instance" "default" {
  # You can enable `dry_run` and run `terraform apply` to call the alibabacloud API but not really create an instance
  dry_run = false

  instance_name   = local.hostname # Refer to local variables
  host_name       = local.hostname
  key_name        = alicloud_key_pair.default.key_name # Refer to the key pair name
  vswitch_id      = alicloud_vswitch.default.id # Refer to the vswitch ID
  security_groups = [alicloud_security_group.default.id] # The security groups associated to the instance

  # Check out the whole list of the instance types: https://www.alibabacloud.com/help/doc-detail/25378.htm
  # We use the cheapest instance type (I found so far) for testing
  instance_type        = "ecs.s6-c1m1.small"
  instance_charge_type = "PostPaid" # Of course post paid!
  credit_specification = "Standard"
  spot_strategy        = "NoSpot"

  # You can find the image IDs on https://ecs.console.aliyun.com/ > Instances & Images > Images > Public Image
  image_id                      = "ubuntu_18_04_x64_20G_alibase_20191225.vhd"
  system_disk_category          = "cloud_efficiency"
  system_disk_size              = 20
  # Disable the useless "security enhancement" features
  security_enhancement_strategy = "Deactive"

  internet_max_bandwidth_in  = 100
  internet_max_bandwidth_out = 100
  internet_charge_type       = "PayByTraffic" # Of course pay by traffic!!
}
```

While the first time I tried to launch an instance, the most significant problem I found is how to find the correct image ID. Fortunately, Alibabacloud maintains a CLI tool called [`aliyun-cli`](https://github.com/aliyun/aliyun-cli) (aliyun is the Chinese pinyin of the word alibabacloud) and there's an API `DescribeImage` for listing all the images.

But it doesn't work as expected, so far I found 2 issues - [it shows no image if I didn't put in a specific parameter](https://github.com/aliyun/aliyun-cli/issues/179#issuecomment-635736796) and either the `--ImageID` or `--Filter.n.Key` doesn't support fuzzy matching. That means even though the first issue will get resolved, the later doesn't allow users to search the image by specifying a keyword like `ubuntu`.

Well, just forget about the Aliyun CLI, let's use web console once and for all though...

## DNS Records (Optional)

We've got all resources prepared. However, the public IP of the instance could be randomly associated. This means every time you terminate the instance and relaunch a new one, the IP will get changed. Therefore, it's also recommended to add a DNS record pointing to the instance.

```terraform
resource "alicloud_dns_record" "default" {
  name        = local.domain
  host_record = local.prefix
  type        = "A"
  ttl         = 600
  routing     = "default"

  # Refer to the public IP of the instance
  value = alicloud_instance.default.public_ip
}
```

You can also try add an output variable without setting up NS servers.

```terraform
output "public_ip" {
  value = alicloud_instance.default.public_ip
}
```

## Apply the plans

Time to apply all these configs and plans! All we need to do is:

```bash
terraform apply
```

```

An execution plan has been generated and is shown below.
Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

...

Plan: 9 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

alicloud_vpc.default: Creating...
alicloud_key_pair.default: Creating...
alicloud_key_pair.default: Creation complete after 1s [id=dummy]
alicloud_vpc.default: Creation complete after 8s [id=vpc-2zey1j4f97ftg3zt1n5x6]
...

Apply complete! Resources: 9 added, 0 changed, 0 destroyed.

The state of your infrastructure has been saved to the path
below. This state is required to modify and destroy your
infrastructure, so keep it safe. To inspect the complete state
use the `terraform show` command.

State path: terraform.tfstate

Outputs:

public_ip = 123.57.**.**
```

That's all!

## References

Please see also:

- [Alibabcloud - How do I specify images for ECS resources?](https://www.alibabacloud.com/help/doc-detail/66902.htm)
- [Terraform Output Command](https://www.terraform.io/docs/commands/output.html)
- [Terraform Alibaba Cloud Provider Documentation](https://www.terraform.io/docs/providers/alicloud/index.html)
