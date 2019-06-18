###############################################################################
# Licensed Materials - Property of IBM Copyright IBM Corporation 2017, 2019. All Rights Reserved.
# U.S. Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP
# Schedule Contract with IBM Corp.
#
# Contributors:
#  IBM Corporation - initial API and implementation
###############################################################################

include Configfile

SHELL := /bin/bash

# GITHUB_USER containing '@' char must be escaped with '%40'
GITHUB_USER := $(shell echo $(GITHUB_USER) | sed 's/@/%40/g')
GITHUB_TOKEN ?=

.PHONY: default
default:: init;

.PHONY: init\:
init::
ifndef GITHUB_USER
	$(info GITHUB_USER not defined)
	exit 1
endif
	$(info Using GITHUB_USER=$(GITHUB_USER))
ifndef GITHUB_TOKEN
	$(info GITHUB_TOKEN not defined)
	exit 1
endif

.PHONY: copyright-check
copyright-check:
	./copyright-check.sh

lint:
	npm run lint

install:
	npm install

prune:
	npm prune --production

.PHONY: my-version
my-version:
	$(eval IMAGE_VERSION := $(shell git rev-parse --short HEAD))

#Removed so that IMAGE_VERSION from config file is added to the version label in the docker image
#for redhat certification
#app-version: my-version

-include $(shell curl -so .build-harness -H "Authorization: token $(GITHUB_TOKEN)" -H "Accept: application/vnd.github.v3.raw" "https://raw.github.ibm.com/ICP-DevOps/build-harness/master/templates/Makefile.build-harness"; echo .build-harness)

.PHONY: build
build:
	npm run build:production

image:: build lint prune

push: check-env app-version

.PHONY: run
run: check-env app-version
	docker run \
	-e NODE_ENV=development \
	-e PLATFORM_IDENTITY_PROVIDER_URL=$(PLATFORM_IDENTITY_PROVIDER_URL) \
	-d -p $(HOST):$(APP_PORT):$(CONTAINER_PORT) $(IMAGE_REPO)/$(IMAGE_NAME_ARCH):$(IMAGE_VERSION)

push: check-env app-version

.PHONY: test
test:
ifeq ($(UNIT_TESTS), TRUE)
	if [ ! -d "test-output" ]; then \
		mkdir test-output; \
	fi
	npm test
	# @$(SELF) cicd-log-test LOG_TEST_OUTPUT_DIR=test-output
endif

include Makefile.docker
include Makefile.cicd
