pipeline {
    agent any

    environment {
        DATABASE_URL = "postgresql://postgres:lpk123030@192.168.0.218:5432/expense_tracker"
        PATH = "/usr/local/bin:$PATH"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', 
                    credentialsId: 'codeup-git-creds',
                    url: 'https://codeup.aliyun.com/6265fce5a60d8a4bbe175cd0/income-cost.git'
            }
        }
        stage('Build and Deploy') {
            steps {
                script {
                    echo 'Building and starting services with Docker Compose...'
                    sh 'docker-compose up -d --build'
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed.'
        }
        always {
            sh 'docker image prune -f'
        }
    }
}
