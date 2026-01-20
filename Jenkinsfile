pipeline {
    agent any
    
    environment {
        // 请在此处修改为您的 Harbor 实际信息
        HARBOR_URL = "harbor.yourdomain.com"
        HARBOR_PROJECT = "expense-tracker"
        // 需在 Jenkins 凭据管理中创建 ID 为 'harbor-creds' 的凭据
        HARBOR_CREDS = credentials('harbor-creds')
        IMAGE_VERSION = "build-${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Docker Login') {
            steps {
                sh "echo ${HARBOR_CREDS_PSW} | docker login ${HARBOR_URL} -u ${HARBOR_CREDS_USR} --password-stdin"
            }
        }
        
        stage('Build & Push Backend') {
            steps {
                dir('server') {
                    sh "docker build -t ${HARBOR_URL}/${HARBOR_PROJECT}/backend:${IMAGE_VERSION} ."
                    sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/backend:${IMAGE_VERSION}"
                }
            }
        }
        
        stage('Build & Push Frontend') {
            steps {
                dir('expense-tracker') {
                    sh "docker build -t ${HARBOR_URL}/${HARBOR_PROJECT}/frontend:${IMAGE_VERSION} ."
                    sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/frontend:${IMAGE_VERSION}"
                }
            }
        }
        
        stage('Deploy') {
            steps {
                // 如果在 Jenkins 本机运行，直接使用 docker-compose
                // 生产环境建议通过 SSH 远程执行
                sh """
                    IMAGE_TAG=${IMAGE_VERSION} docker-compose up -d --build
                """
            }
        }
    }
    
    post {
        always {
            sh "docker logout ${HARBOR_URL}"
        }
        success {
            echo "CI/CD 部署成功！"
        }
        failure {
            echo "CI/CD 部署失败，请检查日志。"
        }
    }
}
