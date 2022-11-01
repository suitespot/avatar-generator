#!/bin/bash

set -ex

AWS_ACCT_ID=${AWS_ACCT_ID:-572758539257}
AWS_REGION=${AWS_REGION:-ca-central-1}

aws --region $AWS_REGION ecr get-login-password | docker login --username "AWS" --password-stdin "$AWS_ACCT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
