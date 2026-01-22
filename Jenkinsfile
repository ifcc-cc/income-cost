pipeline {
    agent any

    environment {
        // 数据库连接配置
        DATABASE_URL = "postgresql://postgres:lpk123030@192.168.0.218:5432/expense_tracker"
        PATH = "/usr/local/bin:$PATH"
    }

    stages {
        stage('Checkout') {
            steps {
                // 更新分支为 main
                git branch: 'main', 
                    credentialsId: 'aliyun-git-creds',
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
            // 清理未使用的镜像
            sh 'docker image prune -f'
        }
    }
}