pipeline {
    agent any

    environment {
        // 配置数据库连接，这里使用了硬编码的连接串
        DATABASE_URL = "postgresql://postgres:lpk123030@192.168.0.218:5432/expense_tracker"
        // 确保 docker-compose 命令能找到
        PATH = "/usr/local/bin:$PATH"
    }

    stages {
        stage('Checkout') {
            steps {
                // 使用 git 命令明确指定仓库地址和分支
                // 注意：这里我们拉取的是 codeup-main 分支，因为只有这个分支有 Jenkinsfile
                git branch: 'codeup-main', 
                    credentialsId: 'aliyun-git-creds',
                    url: 'https://codeup.aliyun.com/6265fce5a60d8a4bbe175cd0/income-cost.git'
            }
        }

        stage('Build and Deploy') {
            steps {
                script {
                    echo 'Building and starting services with Docker Compose...'
                    // -d 后台运行
                    // --build 强制重新构建镜像
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
            // 可选：清理悬空的镜像 (dangling images) 防止磁盘占满
            sh 'docker image prune -f'
        }
    }
}