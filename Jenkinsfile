pipeline {

    agent any

    tools {
        nodejs 'nodejs'
    }
    stages {

        stage('Checkout') {
            steps {
                echo 'Hello, World! Checking out source code...'
                checkout scm
            }
        }

        stage('Create Env Files') {
    steps {

        withCredentials([

            string(credentialsId: 'AUTH_MONGO_URI', variable: 'AUTH_DB'),

            string(credentialsId: 'OFFERS_MONGO_URI', variable: 'OFFERS_DB'),

            string(credentialsId: 'SERVICES_MONGO_URI', variable: 'SERVICES_DB'),

            string(credentialsId: 'JWT_SECRET', variable: 'JWT')

        ]) {

            writeFile file: 'backend/auth-service/.env', text: """
            PORT=5001
            MONGO_URI=${AUTH_DB}
            JWT_SECRET=${JWT}
            JWT_EXPIRES_IN=1d
            CLIENT_URL=http://localhost:3000
            """

            writeFile file: 'backend/gateway/.env', text: """
            PORT=5000
            AUTH_SERVICE_URL=http://auth-service:5001
            OFFERS_SERVICE_URL=http://offers-service:5002
            SERVICES_SERVICE_URL=http://services-service:5003
            CLIENT_URL=http://localhost:3000
            """

            writeFile file: 'backend/offers-service/.env', text: """
            PORT=5002
            MONGO_URI=${OFFERS_DB}
            JWT_SECRET=${JWT}
            CLIENT_URL=http://localhost:3000
            """

            writeFile file: 'backend/services-service/.env', text: """
            PORT=5003
            MONGO_URI=${SERVICES_DB}
            JWT_SECRET=${JWT}
            CLIENT_URL=http://localhost:3000
            """

            writeFile file: 'frontend/.env', text: """
            REACT_APP_API_BASE_URL=http://localhost:5000/api
            """

        }
    }
}

        stage('Validate Docker Compose') {
            steps {

                bat '''
                docker compose config
                '''
            }
        }

        stage('Verify Docker') {

            steps {

                bat '''
                docker version
                docker compose version
                '''
            }
        }

        stage('Docker Build') {

            steps {
                echo 'Building Docker Images...'
                bat '''
                docker compose build
                '''
            }
        }

        stage('Verify Images') {
            steps {
                bat '''
                docker images bankingsvc/*
               '''
            }
        }        

        stage('Docker Login') {
            steps {
                echo 'Logging into Docker Hub...'

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {

                    bat '''
                    echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin
                    '''

                }
            }
        }

        stage('Docker Push') {

            steps {

                echo 'Pushing Docker Images...'
                bat '''
                    docker compose push
                '''
            }
        }       

        stage('Cleanup') {

            steps {
                bat '''
                docker image prune -f
                '''
            }

        }
    }

}