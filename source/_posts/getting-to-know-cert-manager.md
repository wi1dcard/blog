---
id: getting-to-know-cert-manager
tags: [Kubernetes]
date: 2020-03-27 20:53:01
title: K8s 下的 TLS 证书管理 — 了解 Cert-Manager
categories: Tutorials
---

在 Kubernetes 中实现 TLS termination 非常容易。Ingress 资源包含一 `secretName` 属性，用于指定 Secret 资源名称。在取得证书后，通过 `kubectl create secret tls tls-secret --key tls.key --cert tls.crt` 创建 Secret 存储证书，便可以被 Ingress 使用了。

唯独有些不方便的是，证书的申请以及创建 Secret 的过程需要手动执行。在证书即将过期前，还需要人工续期。想必大家都知道，在传统 VM 部署的场景下，可以使用例如 [certbot](https://certbot.eff.org/) 或 [acme.sh](https://github.com/acmesh-official/acme.sh) 等项目，配合 [Let's Encrypt](https://letsencrypt.org/) 自动申请并定期续签证书。而在 K8s 集群中如何降低证书维护成本？来看看我们是怎么做的。

<!--more-->

## 认识 Cert-Manager

[Cert-manager](https://cert-manager.io/) 顾名思义，是一款管理证书的工具。根据官网的描述：

> cert-manager builds on top of Kubernetes, introducing certificate authorities and certificates as first-class resource types in the Kubernetes API. This makes it possible to provide 'certificates as a service' to developers working within your Kubernetes cluster.

简单来说，cert-manager 利用 Kubernetes 的 CRD 特性提供了名为 Certificate 的资源，因此可实现「证书即服务」。请看接下来的例子。

## 安装 Cert-Manager

Cert-manager 的安装方法有多种，可通过 `kubectl` 直接 apply 所有 manifest；也可以先安装 CRD，再通过 Helm 安装其它资源。

我个人倾向于后者。一键 apply 固然简单，但没有机会调整任何配置。使用 Helm 安装 cert-manager 的 Chart 则可以根据需要调整部分选项。具体过程限于篇幅不再详述，请查阅官方文档，仅展示我们使用的 `helmfile.yaml` 以供参考：

```yaml
repositories:
  - name: jetstack
    url: https://charts.jetstack.io

releases:
  - name: cert-manager
    namespace: cert-manager
    chart: jetstack/cert-manager
    version: ^0.14.0
    values:
      - values/cert-manager/values.yaml
```

## 配置 Cert-Manager

### 创建 Issuer

Issuer 的作用主要是指定证书以何种方式签发。目前 cert-manager 支持的 Issuer 类型有 `ACME`、`SelfSigned` 等。其中，ACME 支持的验证类型包括 HTTP01 和 DNS01。

使用 HTTP01 验证 cert-manager 将会修改或创建新的 Ingress 资源用来处理 ACME 服务的验证请求。而 DNS01 则只需配置 DNS 服务提供商的密钥，cert-manager 负责维护对应的验证记录即可。我们使用的是 AWS 的 Route53 服务，正好也在 cert-manager [内置支持的 DNS provider 列表](https://cert-manager.io/docs/configuration/acme/dns01/#supported-dns01-providers)内。因此我们选用了后者。

另外，Cert-manager 提供了两种 Issuer — `Issuer` 和 `ClusterIssuer`，前者是仅限于 Issuer 所在的命名空间内使用的，而 ClusterIssuer 可在 Cluster 内的任意命名空间通用。

我们创建了两个 ClusterIssuer，名叫 `letsencrypt-prd` 和 `letsencrypt-stg`，例如：

```yaml
apiVersion: cert-manager.io/v1alpha2
kind: ClusterIssuer
metadata:
  name: letsencrypt-prd
spec:
  acme:
    email: user@example.com
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prd # 用于储存 ACME Account 私钥的 Secret
    solvers:
      - selector: {}
        dns01:
          route53: # Route53 相关参数
            region: us-east-2
            accessKeyID: ... # AWS Access Key ID
            secretAccessKeySecretRef:
              name: route53-secret-access-key # 存储 AWS Access Key Secret 的 Kubernetes Secret 名称
              key: secret_access_key # 存储 AWS Access Key Secret 值的字段名
```

### 修改 Chart Values

在上面的 `helmfile.yaml` 中，可以看到我们配置了 values 文件 `values/cert-manager/values.yaml`，内容如下：

```yaml
ingressShim:
  defaultIssuerKind: ClusterIssuer
  defaultIssuerName: letsencrypt-prd # 刚刚创建的 ClusterIssuer 名称
```

我们配置了针对 `ingressShim` 的默认 Issuer。这样我们就可以不手动创建 Certificate，cert-manager 将会「监视」集群内的 Ingress 资源，当有 Ingress 配置了 `spec.tls` 时，自动读取 `hosts`、创建证书并将证书存储至 `secretName` 指定的 Secret 内，实现完全自动化。

## 创建并使用证书

由于开启了 `ingressShim` 功能，因此我们只需要按照常规思路使用 Ingress 即可。例如：

```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: api
  namespace: staging
spec:
  rules:
    - host: example.com
      http:
        paths:
          - backend:
              serviceName: api
              servicePort: http
            path: /
  tls:
    - secretName: api-tls-certificate
```

把 `spec.tls.secretName` 设置为想要存储证书的 Secret 名称（例如例子中的 `api-tls-certificate`），cert-manager 将读取这个名称并将申请好的证书存储到该 Secert 内，以供 Ingress 使用。

## 小结

根据上文的介绍，似乎这是一套完美的解决方案？不尽然。目前 cert-manager 项目还处于 beta 阶段，每次发布新的 release 都可能包含 breaking change。在我们使用的这段时间内，每隔几个版本就需要手动升级一次，升级过程中有时会出现一些意料之外的小问题。例如最近的 `0.13` -> `0.14` 升级过程中，发现新版本的 CRD manifest 硬编码必须安装到 `cert-manager` 命名空间。希望 cert-manager 官方能尽快推进正式版的发布，减少手动升级的次数和成本。
