
pipeline {
    agent any

    environment {
        PATH = "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin"
        IMAGE_NAME = "devsecops-app"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Source code checked out from GitHub"
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
