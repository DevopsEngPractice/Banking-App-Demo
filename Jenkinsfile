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

                    string(credentialsId: 'AUTH_JWT_SECRET', variable: 'JWT')

                ]) {

                    writeFile file: 'backend/auth-service/.env', text: """
                    PORT=5001
                    MONGO_URI=${AUTH_DB}
                    AUTH_JWT_SECRET=${JWT}
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
                    AUTH_JWT_SECRET=${JWT}
                    CLIENT_URL=http://localhost:3000
                    """

                    writeFile file: 'backend/services-service/.env', text: """
                    PORT=5003
                    MONGO_URI=${SERVICES_DB}
                    AUTH_JWT_SECRET=${JWT}
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
                docker images
               '''
            }
        } 

        stage('Azure Login') {
            steps {
                withCredentials([
                    string(credentialsId: 'AZURE_CLIENT_ID', variable: 'CLIENT_ID'),
                    string(credentialsId: 'AZURE_CLIENT_SECRET', variable: 'CLIENT_SECRET'),
                    string(credentialsId: 'AZURE_TENANT_ID', variable: 'TENANT_ID'),
                    string(credentialsId: 'AZURE_SUBSCRIPTION_ID', variable: 'SUBSCRIPTION_ID')
                ]) {
                    bat '''
                    az login --service-principal ^
                      --username %CLIENT_ID% ^
                      --password %CLIENT_SECRET% ^
                      --tenant %TENANT_ID%
                    az account set --subscription %SUBSCRIPTION_ID%
                    az account show
                    '''
                }
            }
        }

        stage('ACR Login') {
            steps {
                bat '''
                az acr login --name bankingappacr123
                '''
            }
        }

        stage('Push Images To ACR') {
            steps {
                bat '''
                docker compose push
                '''
            }
        }

        stage('Cleanup') {
            steps {
                bat '''
                docker image prune -af
                docker builder prune -af
                docker container prune -f
                docker network prune -f
                '''
            }
        }        

        // stage('Docker Login Test') {
        //     steps {
        //         withCredentials([
        //             usernamePassword(
        //                 credentialsId: 'dockerhub-creds',
        //                 usernameVariable: 'USER',
        //                 passwordVariable: 'PASS'
        //             )
        //         ]) {
        //             bat '''
        //             echo Username=%USER%
        //             echo Password Received
        //             '''
        //         }
        //     }
        // }

        // stage('Docker Login') {
        //     steps {
        //         echo 'Logging into Docker Hub...'

        //         withCredentials([
        //             usernamePassword(
        //                 credentialsId: 'dockerhub-creds',
        //                 usernameVariable: 'USER',
        //                 passwordVariable: 'PASS'
        //             )
        //         ]) {

        //             bat '''
        //             @echo off

        //             echo ===============================
        //             echo Docker Login Stage
        //             echo ===============================

        //             echo Username: %USER%

        //             echo %PASS%>dockerpass.txt

        //             docker logout

        //             docker login -u %USER% --password-stdin < dockerpass.txt

        //             if %ERRORLEVEL% neq 0 (
        //                 echo.
        //                 echo *********************************
        //                 echo Docker Login FAILED
        //                 echo *********************************
        //                 del dockerpass.txt
        //                 exit /b 1
        //             )

        //             del dockerpass.txt

        //             echo.
        //             echo *********************************
        //             echo Docker Login Successful
        //             echo *********************************

        //             docker info
        //             '''

        //         }
        //     }
        // }     

    }

}