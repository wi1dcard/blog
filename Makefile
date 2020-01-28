prepare:
	docker pull abiosoft/caddy
	docker pull arachnysdocker/athenapdf

lint:
	build/lint-categories.sh
	lint-md source/_posts --config build/lint-md.json

validate-pdf:
	cat public/resume/index.sha256 | sha256sum -c

pdf:
	docker run --net host -d \
	    -v "${PWD}/build/Caddyfile:/etc/Caddyfile:ro" \
	    -v "${PWD}/public:/srv:ro" \
	    --name caddy \
	    abiosoft/caddy

	docker run --net host --rm --add-host wi1dcard.dev:127.0.0.1 \
	    -v "${PWD}/public/resume:/converted" \
	    --name athenapdf \
	    arachnysdocker/athenapdf \
	    athenapdf --margins=none --ignore-certificate-errors https://wi1dcard.dev/resume/ wi1dcard.pdf

	docker rm -vf caddy
	sha256sum public/resume/index.html > public/resume/index.sha256

image:
	docker build -f build/Dockerfile -t "${DOCKER_IMAGE}" -t "${DOCKER_IMAGE}:${DOCKER_TAG}" .

image-push:
	@echo "${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin
	docker push "${DOCKER_IMAGE}"
