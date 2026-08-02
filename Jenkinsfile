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

    }

}