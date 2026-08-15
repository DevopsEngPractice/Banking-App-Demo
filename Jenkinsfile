pipeline {

    agent any

    tools {
        nodejs 'nodejs'
    }

    environment {

        ACR_NAME = 'bankingappacr123'
        ACR_LOGIN_SERVER = 'bankingappacr123.azurecr.io'

       IMAGE_TAG = "v1.0.${env.BUILD_NUMBER}"

        K8S_NAMESPACE = 'banking-app-dev'

        // CHANGE THESE TWO VALUES
        AKS_RESOURCE_GROUP = 'RG-01'
        AKS_CLUSTER_NAME = 'Banking-App-Cluster'
    }    

    stages {

        stage('Checkout') {

            steps {

                echo '========================================'
                echo 'Checking out source code'
                echo '========================================'

                checkout scm
            }
        }

        stage('Build Information') {
            steps {
                bat '''
                echo ========================================
                echo Jenkins Build Information
                echo ========================================
                echo JOB_NAME=%JOB_NAME%
                echo BUILD_NUMBER=%BUILD_NUMBER%
                echo IMAGE_TAG=%IMAGE_TAG%
                echo WORKSPACE=%WORKSPACE%
                echo ========================================
                '''
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

        stage('Verify Docker') {

            steps {
                bat '''
                echo ========================================
                echo Docker Version
                echo ========================================
                docker version
                echo.
                echo ========================================
                echo Docker Compose Version
                echo ========================================
                docker compose version
                '''
            }
        }

        stage('Verify Variables') {

            steps {

                bat '''
                echo ========================================
                echo IMAGE TAG VALIDATION
                echo ========================================

                echo BUILD_NUMBER=%BUILD_NUMBER%
                echo IMAGE_TAG=%IMAGE_TAG%

                if "%BUILD_NUMBER%"=="" (
                    echo ERROR: BUILD_NUMBER is empty
                    exit /b 1
                )

                if "%IMAGE_TAG%"=="" (
                    echo ERROR: IMAGE_TAG is empty
                    exit /b 1
                )

                echo.
                echo Expected image tag:
                echo %IMAGE_TAG%

                echo.
                echo Expected Auth image:
                echo %ACR_LOGIN_SERVER%/banking-app-auth-service:%IMAGE_TAG%

                echo.
                echo Expected Frontend image:
                echo %ACR_LOGIN_SERVER%/banking-app-frontend:%IMAGE_TAG%

                echo.
                echo IMAGE_TAG validation successful
                '''
            }
        }

        stage('Docker Build') {

            steps {

                echo "Building Docker images with tag ${IMAGE_TAG}"

                bat '''
                echo ========================================
                echo Building Docker Images
                echo ========================================
                
                echo BUILD_NUMBER=%BUILD_NUMBER%
                echo IMAGE_TAG=%IMAGE_TAG%

                echo.
                echo Docker Compose configuration:
                docker compose config

                docker compose build

                echo.
                echo ========================================
                echo Docker Build Completed
                echo ========================================
                '''
            }
        }

        stage('Verify Images') {
            steps {
                bat '''
                echo ========================================
                echo Docker Images
                echo ========================================
                docker images
                echo.
                echo ========================================
                echo Images With Current Tag
                echo ========================================
                docker images | findstr "%IMAGE_TAG%"
                '''
            }
        }    

        stage('Azure Login') {

            steps {

                withCredentials([

                    string(
                        credentialsId: 'AZURE_CLIENT_ID',
                        variable: 'CLIENT_ID'
                    ),

                    string(
                        credentialsId: 'AZURE_CLIENT_SECRET',
                        variable: 'CLIENT_SECRET'
                    ),

                    string(
                        credentialsId: 'AZURE_TENANT_ID',
                        variable: 'TENANT_ID'
                    ),

                    string(
                        credentialsId: 'AZURE_SUBSCRIPTION_ID',
                        variable: 'SUBSCRIPTION_ID'
                    )

                ]) {

                    bat '''
                    echo ========================================
                    echo Azure Login
                    echo ========================================

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
                echo ========================================
                echo Azure Container Registry Login
                echo ========================================

                az acr login --name %ACR_NAME%
                '''
            }
        }

        stage('Verify ACR') {

            steps {

                bat '''
                echo ========================================
                echo Verify Azure Container Registry
                echo ========================================

                az acr show ^
                  --name %ACR_NAME% ^
                  --output table

                echo.
                echo ========================================
                echo ACR Repositories
                echo ========================================

                az acr repository list ^
                  --name %ACR_NAME% ^
                  --output table
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

                docker push %ACR_LOGIN_SERVER%/banking-app-auth-service:%IMAGE_TAG%
                if %ERRORLEVEL% neq 0 exit /b 1

                docker push %ACR_LOGIN_SERVER%/banking-app-api-gateway:%IMAGE_TAG%
                if %ERRORLEVEL% neq 0 exit /b 1

                docker push %ACR_LOGIN_SERVER%/banking-app-offers-service:%IMAGE_TAG%
                if %ERRORLEVEL% neq 0 exit /b 1

                docker push %ACR_LOGIN_SERVER%/banking-app-services-service:%IMAGE_TAG%
                if %ERRORLEVEL% neq 0 exit /b 1

                docker push %ACR_LOGIN_SERVER%/banking-app-frontend:%IMAGE_TAG%
                if %ERRORLEVEL% neq 0 exit /b 1

                echo.
                echo ========================================
                echo ALL IMAGES PUSHED SUCCESSFULLY
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
                  --name %ACR_NAME% ^
                  --repository banking-app-frontend ^
                  --output table

                echo.

                az acr repository show-tags ^
                  --name %ACR_NAME% ^
                  --repository banking-app-api-gateway ^
                  --output table

                echo.

                az acr repository show-tags ^
                  --name %ACR_NAME% ^
                  --repository banking-app-auth-service ^
                  --output table

                echo.

                az acr repository show-tags ^
                  --name %ACR_NAME% ^
                  --repository banking-app-offers-service ^
                  --output table

                echo.

                az acr repository show-tags ^
                  --name %ACR_NAME% ^
                  --repository banking-app-services-service ^
                  --output table
                '''
            }
        }

        stage('Get AKS Credentials') {

            steps {

                bat '''
                echo ========================================
                echo Getting AKS Credentials
                echo ========================================

                az aks get-credentials ^
                  --resource-group %AKS_RESOURCE_GROUP% ^
                  --name %AKS_CLUSTER_NAME% ^
                  --overwrite-existing

                echo.
                echo ========================================
                echo Verify AKS Connection
                echo ========================================

                kubectl config current-context

                kubectl get nodes
                '''
            }
        }

        stage('Deploy To AKS') {

            steps {

                bat '''
                echo ========================================
                echo Deploying Application To AKS
                echo IMAGE_TAG=%IMAGE_TAG%
                echo ========================================


                echo.
                echo ========================================
                echo Deploying Frontend
                echo ========================================

                kubectl set image deployment/frontend-deployment ^
                  frontend=%ACR_LOGIN_SERVER%/banking-app-frontend:%IMAGE_TAG% ^
                  -n %K8S_NAMESPACE%

                if %ERRORLEVEL% neq 0 exit /b 1

                echo.
                echo ========================================
                echo Deploying API Gateway
                echo ========================================

                kubectl set image deployment/gateway-deployment ^
                  gateway=%ACR_LOGIN_SERVER%/banking-app-api-gateway:%IMAGE_TAG% ^
                  -n %K8S_NAMESPACE%
                
                if %ERRORLEVEL% neq 0 exit /b 1

                echo.
                echo ========================================
                echo Deploying Auth Service
                echo ========================================

                kubectl set image deployment/auth-deployment ^
                  auth-service=%ACR_LOGIN_SERVER%/banking-app-auth-service:%IMAGE_TAG% ^
                  -n %K8S_NAMESPACE%
                
                if %ERRORLEVEL% neq 0 exit /b 1

                echo.
                echo ========================================
                echo Deploying Offers Service
                echo ========================================

                kubectl set image deployment/offers-deployment ^
                  offers-service=%ACR_LOGIN_SERVER%/banking-app-offers-service:%IMAGE_TAG% ^
                  -n %K8S_NAMESPACE%
                
                if %ERRORLEVEL% neq 0 exit /b 1

                echo.
                echo ========================================
                echo Deploying Services Service
                echo ========================================

                kubectl set image deployment/services-deployment ^
                  services-service=%ACR_LOGIN_SERVER%/banking-app-services-service:%IMAGE_TAG% ^
                  -n %K8S_NAMESPACE%
                
                if %ERRORLEVEL% neq 0 exit /b 1

                echo.
                echo ========================================
                echo IMAGE UPDATE COMPLETED
                echo IMAGE_TAG=%IMAGE_TAG%
                echo ========================================
                '''
            }
        }

        stage('Wait For Rollout') {

            steps {

                bat '''
                echo ========================================
                echo Waiting For Kubernetes Rollout
                echo ========================================

                kubectl rollout status deployment/frontend-deployment ^
                  -n %K8S_NAMESPACE% ^
                  --timeout=180s

                if errorlevel 1 exit /b 1

                kubectl rollout status deployment/gateway-deployment ^
                  -n %K8S_NAMESPACE% ^
                  --timeout=180s

                if errorlevel 1 exit /b 1

                kubectl rollout status deployment/auth-deployment ^
                  -n %K8S_NAMESPACE% ^
                  --timeout=180s

                if errorlevel 1 exit /b 1

                kubectl rollout status deployment/offers-deployment ^
                  -n %K8S_NAMESPACE% ^
                  --timeout=180s

                if errorlevel 1 exit /b 1

                kubectl rollout status deployment/services-deployment ^
                  -n %K8S_NAMESPACE% ^
                  --timeout=180s

                if errorlevel 1 exit /b 1

                echo.
                echo ========================================
                echo ROLLOUT SUCCESSFUL
                echo ========================================
                '''
            }
        }

        stage('Verify AKS Deployment') {

            steps {

                bat '''
                echo ========================================
                echo AKS DEPLOYMENT VERIFICATION
                echo ========================================


                echo.
                echo ========================================
                echo DEPLOYMENTS
                echo ========================================

                kubectl get deployments ^
                  -n %K8S_NAMESPACE%


                echo.
                echo ========================================
                echo PODS
                echo ========================================

                kubectl get pods ^
                  -n %K8S_NAMESPACE% ^
                  -o wide


                echo.
                echo ========================================
                echo SERVICES
                echo ========================================

                kubectl get services ^
                  -n %K8S_NAMESPACE%


                echo.
                echo ========================================
                echo CURRENT IMAGES
                echo ========================================


                echo FRONTEND IMAGE:

                kubectl get deployment frontend-deployment ^
                  -n %K8S_NAMESPACE% ^
                  -o jsonpath="{.spec.template.spec.containers[0].image}"

                echo.


                echo GATEWAY IMAGE:

                kubectl get deployment gateway-deployment ^
                  -n %K8S_NAMESPACE% ^
                  -o jsonpath="{.spec.template.spec.containers[0].image}"

                echo.


                echo AUTH IMAGE:

                kubectl get deployment auth-deployment ^
                  -n %K8S_NAMESPACE% ^
                  -o jsonpath="{.spec.template.spec.containers[0].image}"

                echo.


                echo OFFERS IMAGE:

                kubectl get deployment offers-deployment ^
                  -n %K8S_NAMESPACE% ^
                  -o jsonpath="{.spec.template.spec.containers[0].image}"

                echo.


                echo SERVICES IMAGE:

                kubectl get deployment services-deployment ^
                  -n %K8S_NAMESPACE% ^
                  -o jsonpath="{.spec.template.spec.containers[0].image}"

                echo.


                echo ========================================
                echo DEPLOYMENT COMPLETED
                echo IMAGE_TAG=%IMAGE_TAG%
                echo ========================================
                '''
            }
        }

    }

    post {
        success {
            echo '''
            ========================================
            PIPELINE SUCCESS
            ========================================
            Banking application deployed successfully.
            ========================================
            '''
        }

        failure {
            echo '''
            ========================================
            PIPELINE FAILED
            ========================================
            Check the failed stage and Jenkins console output.
            ========================================
            '''
        }

        always {
            bat '''
            docker container prune -f
            docker network prune -f
            '''
        }
    }
}