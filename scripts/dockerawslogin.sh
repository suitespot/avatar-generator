#!/bin/bash
set -o nounset
set -o errexit
set -o pipefail

function execute_and_echo {
    echo "$@"
    "$@"
}

DOCKER_LOGON=$(aws ecr get-login --no-include-email --region ca-central-1)
execute_and_echo ${DOCKER_LOGON}
