#!/bin/bash

set -euo pipefail

echo "Decoding kubeconfig..."
mkdir ~/.kube
UMASK=$(umask)
umask 177
base64 -d <<< "$KUBECONFIG_BASE64" > ~/.kube/config
umask $UMASK

set -x

helm init --client-only
helmfile -f deploy/helmfile.yaml apply --suppress-secrets
