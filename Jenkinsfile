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