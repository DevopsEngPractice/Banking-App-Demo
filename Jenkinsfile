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

        stage('Install Dependencies') {
            parallel {

                stage('Backend Auth Service') {
                    steps {
                        dir('backend/auth-service') {
                            sh 'npm ci'
                        }
                    }
                }

                stage('Backend Gateway') {
                    steps {
                        dir('backend/gateway') {
                            sh 'npm ci'
                        }
                    }
                }                

                stage('Backend Offers Service') {
                    steps {
                        dir('backend/offers-service') {
                            sh 'npm ci'
                        }
                    }
                }

                stage('Backend Services Service') {
                    steps {
                        dir('backend/services-service') {
                            sh 'npm ci'
                        }
                    }
                }                
            
                stage('Frontend') {
                steps {
                    dir('frontend') {
                        sh 'npm ci'
                    }
                }
                }
            }
    
        }

        stage('Build') {
            parallel {
                stage('Backend Auth Service') {
                    steps {
                        dir('backend/auth-service') {
                            sh 'npm run build'
                        }
                    }
                }

                stage('Backend Gateway') {
                    steps {
                        dir('backend/gateway') {
                            sh 'npm run build'
                        }
                    }
                }

                stage('Backend Offers Service') {
                    steps {
                        dir('backend/offers-service') {
                            sh 'npm run build'
                        }
                    }
                }

                stage('Backend Services Service') {
                    steps {
                        dir('backend/services-service') {
                            sh 'npm run build'
                        }
                    }
                }

                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm run build'
                        }
                    }
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

        stage('Docker Login') {
            steps {
                echo 'Logging into Docker registry...'
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds', 
                        usernameVariable: 'DOCKER_USERNAME', 
                        passwordVariable: 'DOCKER_PASSWORD'
                        )
                    ]) {
                        bat '''
                        'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
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