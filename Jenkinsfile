pipeline {

    agent any

    tools {
        nodejs 'nodejs'
    }

    environment {
        IMAGE_TAG = "v1.0.${BUILD_NUMBER}"
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
                    REACT_APP_API_BASE_URL=http://gateway:5000/api
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

        stage('Verify Variables') {
            steps {
                bat '''
                echo BUILD_NUMBER=%BUILD_NUMBER%
                echo IMAGE_TAG=%IMAGE_TAG%
                '''
            }
        }

        stage('Docker Build') {
            steps {
                echo "Building Docker Images with tag ${IMAGE_TAG}..."
                bat '''
                echo IMAGE_TAG=%IMAGE_TAG%
                docker compose build
                '''
            }
}

        stage('Verify Images') {
            steps {
                bat '''
                echo ========================================
                echo IMAGE TAG = %IMAGE_TAG%
                echo ========================================    
                docker compose config
                echo.
                echo ========================================
                echo Docker Images
                echo ========================================

                docker images | findstr "bankingappacr123.azurecr.io"
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
                echo ========================================
                echo Pushing Images To ACR
                echo IMAGE_TAG=%IMAGE_TAG%
                echo ========================================

                docker push bankingappacr123.azurecr.io/banking-app-auth-service:%IMAGE_TAG%
                if %ERRORLEVEL% neq 0 exit /b 1

                docker push bankingappacr123.azurecr.io/banking-app-api-gateway:%IMAGE_TAG%
                if %ERRORLEVEL% neq 0 exit /b 1

                docker push bankingappacr123.azurecr.io/banking-app-offers-service:%IMAGE_TAG%
                if %ERRORLEVEL% neq 0 exit /b 1

                docker push bankingappacr123.azurecr.io/banking-app-services-service:%IMAGE_TAG%
                if %ERRORLEVEL% neq 0 exit /b 1

                docker push bankingappacr123.azurecr.io/banking-app-frontend:%IMAGE_TAG%
                if %ERRORLEVEL% neq 0 exit /b 1

                echo ========================================
                echo All images pushed successfully
                echo ========================================
                '''
            }
        }

        stage('Verify ACR Images') {
            steps {
                bat '''
                echo ========================================
                echo Verifying ACR Images
                echo IMAGE_TAG=%IMAGE_TAG%
                echo ========================================

                az acr repository show-tags ^
                --name bankingappacr123 ^
                --repository banking-app-frontend ^
                --output table

                az acr repository show-tags ^
                --name bankingappacr123 ^
                --repository banking-app-api-gateway ^
                --output table

                az acr repository show-tags ^
                --name bankingappacr123 ^
                --repository banking-app-auth-service ^
                --output table

                az acr repository show-tags ^
                --name bankingappacr123 ^
                --repository banking-app-offers-service ^
                --output table

                az acr repository show-tags ^
                --name bankingappacr123 ^
                --repository banking-app-services-service ^
                --output table
                '''
            }
        }

        stage('Deploy Frontend to AKS') {
            steps {
                bat '''
                echo ========================================
                echo Deploying Banking Application
                echo IMAGE_TAG=%IMAGE_TAG%
                echo ========================================

                kubectl set image deployment/frontend-deployment ^
                frontend=bankingappacr123.azurecr.io/banking-app-frontend:%IMAGE_TAG% ^
                -n banking-app-dev

                kubectl set image deployment/gateway-deployment ^
                gateway=bankingappacr123.azurecr.io/banking-app-api-gateway:%IMAGE_TAG% ^
                -n banking-app-dev

                kubectl set image deployment/auth-deployment ^
                auth-service=bankingappacr123.azurecr.io/banking-app-auth-service:%IMAGE_TAG% ^
                -n banking-app-dev

                kubectl set image deployment/offers-deployment ^
                offers-service=bankingappacr123.azurecr.io/banking-app-offers-service:%IMAGE_TAG% ^
                -n banking-app-dev

                kubectl set image deployment/services-deployment ^
                services-service=bankingappacr123.azurecr.io/banking-app-services-service:%IMAGE_TAG% ^
                -n banking-app-dev
                '''
            }
        }        

        stage('Verify AKS Deployment') {

            steps {

                bat '''
                echo ========================================
                echo AKS Deployments
                echo ========================================

                kubectl get deployments -n banking-app-dev

                echo.
                echo ========================================
                echo Pods
                echo ========================================

                kubectl get pods -n banking-app-dev
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

    }

}