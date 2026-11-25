
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


        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                      -t ${IMAGE_NAME}:${BUILD_NUMBER} \
                      ./app
                '''
            }
        }


stage('Push to Docker Hub') {
    steps {
        usernamePassword([
            string(
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
