#!/bin/bash
set -o nounset
set -o errexit
set -o pipefail

SUITESPOT_REGISTRY=${SUITESPOT_REGISTRY:-""}

function execute_and_echo {
    echo "$@"
    "$@"
}

function usage() {
  echo "Usage pushimage.sh --image-name=<image name> --tag=`git rev-parse HEAD` --registry=<CONTAINER_REGISTRY>"
  exit 1
}


for i in "$@"
do
case $i in
    -i=*|--image-name=*)
    IMAGE_NAME="${i#*=}"; shift
    ;;
    -t=*|--tag=*)
    SUITESPOT_IMAGE_TAG="${i#*=}"; shift
    ;;
    -r=*|--registry=*)
    SUITESPOT_REGISTRY="${i#*=}"; shift
    ;;
    -pi=*|--push-image-name=*)
    PUSH_IMAGE_NAME="${i#*=}"; shift
    ;;
    *)
    # unknown option
    ;;
esac
done

if [ -z "${IMAGE_NAME+x}" ]; then usage; fi
if [ -z "${SUITESPOT_IMAGE_TAG+x}" ]; then usage; fi
if [ -z "${SUITESPOT_REGISTRY+x}" ]; then usage; fi
if [ -z "${PUSH_IMAGE_NAME+x}" ]; then PUSH_IMAGE_NAME=$IMAGE_NAME; fi

BUILD_DIR=$(pwd)

echo "Running in ${BUILD_DIR}"
echo "REGISTRY   = ${SUITESPOT_REGISTRY}"
echo "IMAGE_TAG  = ${SUITESPOT_IMAGE_TAG}"
echo "IMAGE_NAME = ${IMAGE_NAME}"
echo "PUSH_IMAGE_NAME = ${PUSH_IMAGE_NAME}"

execute_and_echo docker tag ${IMAGE_NAME}:latest ${SUITESPOT_REGISTRY}:latest
execute_and_echo docker tag ${IMAGE_NAME}:latest ${SUITESPOT_REGISTRY}:${SUITESPOT_IMAGE_TAG}
execute_and_echo docker push ${SUITESPOT_REGISTRY}:latest
execute_and_echo docker push ${SUITESPOT_REGISTRY}:${SUITESPOT_IMAGE_TAG}
