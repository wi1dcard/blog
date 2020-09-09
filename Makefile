prepare:
	docker pull abiosoft/caddy
	docker pull arachnysdocker/athenapdf

lint:
	build/lint-categories.sh
	lint-md source/_posts --config build/lint-md.json

cleanup:
	hexo clean

html:
	hexo generate

resume-pdf:
	docker run --net host -d \
	    -v "${PWD}/build/Caddyfile:/etc/Caddyfile:ro" \
	    -v "${PWD}/public:/srv:ro" \
	    --name caddy \
	    abiosoft/caddy

	docker run --net host --rm --add-host wi1dcard.dev:127.0.0.1 \
	    -v "${PWD}/public/resume:/converted" \
	    --name athenapdf \
	    arachnysdocker/athenapdf \
	    athenapdf --margins=none --ignore-certificate-errors https://wi1dcard.dev/resume/ Weizhe-Sun-Resume.pdf

	docker rm -vf caddy

image:
	docker build -f build/image/Dockerfile -t "${DOCKER_IMAGE}:latest" -t "${DOCKER_IMAGE}:${DOCKER_TAG}" .

image-tls:
	docker build -t "${DOCKER_IMAGE}:latest-tls" build/image-tls

image-push:
	@echo "${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin
	docker push "${DOCKER_IMAGE}"
