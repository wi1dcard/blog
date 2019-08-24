#/bin/bash

set -exuo pipefail

# Travis CI free plan doesn't provide the "artifact" feature.
# So I have to put multi-stage builds into a single job.
# Waiting for GitHub Action or I would prefer to moving this blog to GitLab.

yarn run lint
yarn run build

docker run --net host -d \
    -v $(pwd)/build/Caddyfile:/etc/Caddyfile:ro \
    -v $(pwd)/public:/srv:ro \
    abiosoft/caddy

docker run --net host --rm --add-host wi1dcard.dev:127.0.0.1 \
    -v $(pwd)/public/resume:/converted \
    arachnysdocker/athenapdf \
    athenapdf --margins=none --ignore-certificate-errors https://wi1dcard.dev/resume/ wi1dcard.pdf

docker build -f build/Dockerfile -t $DOCKER_IMAGE -t $DOCKER_IMAGE:$DOCKER_TAG .
