#/bin/bash

set -euo pipefail

echo "Logging in Docker Hub..."
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

echo "Pushing images to Docker Hub..."
docker push "$DOCKER_IMAGE"

echo "Applying helm releases..."
docker run --rm -v "$PWD/deploy:/deploy" \
    -e HELM_TILLER_STORAGE=configmap \
    -e KUBECONFIG_BASE64="$KUBECONFIG_BASE64" \
    -e DOCKER_TAG="$DOCKER_TAG" \
    -e INGRESS_HOST="$INGRESS_HOST" \
    "$HELMFILE_IMAGE" /deploy/helmfile.sh
