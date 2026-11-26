pipeline {
    agent any

    environment {
        PATH = "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin"
        IMAGE_NAME = "devsecops-app"
        DOCKERHUB_USERNAME = "raviiprakashh"
        DOCKERHUB_REPO = "devsecops-app"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Source code checked out from GitHub"
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    script {
                        def scannerHome = tool 'SonarScanner'

                        withEnv(["PATH+SONAR=${scannerHome}/bin"]) {
                            sh '''
                                sonar-scanner \
                                  -Dsonar.projectKey=devsecops-app \
                                  -Dsonar.projectName="DevSecOps App" \
                                  -Dsonar.sources=app
                            '''
                        }
                    }
                }
            }
        }



        stage('Run API Tests') {
            steps {
                dir('app') {
                    sh 'npm ci'
                    sh 'npm test'
        }
    }
}


        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                      -t ${IMAGE_NAME}:${BUILD_NUMBER} \
                      ./app
                '''
            }
        }

        stage('Trivy Security Scan') {
            steps {
                sh '''
                    trivy image \
                      --skip-db-update \
                      --severity HIGH,CRITICAL \
                      --exit-code 1 \
                      devsecops-app:${BUILD_NUMBER}
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_TOKEN'
                    )
                ]) {
                    sh '''
                        echo "$DOCKERHUB_TOKEN" | docker login \
                          -u "$DOCKERHUB_USERNAME" \
                          --password-stdin

                        docker tag \
                          ${IMAGE_NAME}:${BUILD_NUMBER} \
                          ${DOCKERHUB_USERNAME}/${DOCKERHUB_REPO}:${BUILD_NUMBER}

                        docker tag \
                          ${IMAGE_NAME}:${BUILD_NUMBER} \
                          ${DOCKERHUB_USERNAME}/${DOCKERHUB_REPO}:latest

                        docker push \
                          ${DOCKERHUB_USERNAME}/${DOCKERHUB_REPO}:${BUILD_NUMBER}

                        docker push \
                          ${DOCKERHUB_USERNAME}/${DOCKERHUB_REPO}:latest

                        docker logout
                    '''
                }
            }
        }

        stage('Verify Docker Image') {
            steps {
                sh 'docker images ${IMAGE_NAME}'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                    helm upgrade --install devsecops-app ./helm/devsecops-app \
                      --namespace devsecops \
                      --set image.repository=${DOCKERHUB_USERNAME}/devsecops-app \
                      --set image.tag=${BUILD_NUMBER} \
                      --wait \
                      --timeout 3m
                """
            }
        }
    }


stage('Smoke Test') {
    steps {
        sh '''
            set -eu

            echo "Starting Kubernetes port-forward..."

            kubectl port-forward \
                deployment/devsecops-app \
                18080:3000 \
                -n devsecops \
                > port-forward.log 2>&1 &

            PF_PID=$!

            cleanup() {
                kill "$PF_PID" 2>/dev/null || true
            }

            trap cleanup EXIT

            echo "Waiting for application to respond..."

            ATTEMPT=1
            HTTP_CODE="000"

            while [ "$ATTEMPT" -le 30 ]; do
                HTTP_CODE=$(curl -sS \
                    -o health-response.json \
                    -w "%{http_code}" \
                    http://localhost:18080/health \
                    || true)

                if [ "$HTTP_CODE" = "200" ]; then
                    break
                fi

                echo "Attempt $ATTEMPT: HTTP $HTTP_CODE"
                sleep 2
                ATTEMPT=$((ATTEMPT + 1))
            done

            if [ "$HTTP_CODE" != "200" ]; then
                echo "Smoke test failed: HTTP $HTTP_CODE"
                cat port-forward.log
                exit 1
            fi

            echo "Health response:"
            cat health-response.json

            if ! grep -q '"status":"healthy"' health-response.json; then
                echo "Smoke test failed: unexpected response"
                exit 1
            fi

            echo "Smoke test passed!"
        '''
    }
}


    post {
        success {
            echo "DevSecOps pipeline completed successfully!"
        }

        failure {
            echo "DevSecOps pipeline failed!"
        }
    }
}