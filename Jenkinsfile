pipeline {
    agent any
    
    environment {
        HARBOR_URL = "192.168.0.218"
        HARBOR_PROJECT = "expense-tracker"
        // 确保 Jenkins 中存在 ID 为 'harbor-creds' 的凭据
        HARBOR_LOGIN = credentials('harbor-creds')
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
                // 使用 env. 显式引用
                sh "echo ${env.HARBOR_LOGIN_PSW} | docker login ${env.HARBOR_URL} -u ${env.HARBOR_LOGIN_USR} --password-stdin"
            }
        }
        
        stage('Build & Push Backend') {
            steps {
                dir('server') {
                    sh "docker build -t ${env.HARBOR_URL}/${env.HARBOR_PROJECT}/backend:${env.IMAGE_VERSION} ."
                    sh "docker push ${env.HARBOR_URL}/${env.HARBOR_PROJECT}/backend:${env.IMAGE_VERSION}"
                }
            }
        }
        
        stage('Build & Push Frontend') {
            steps {
                dir('expense-tracker') {
                    sh "docker build -t ${env.HARBOR_URL}/${env.HARBOR_PROJECT}/frontend:${env.IMAGE_VERSION} ."
                    sh "docker push ${env.HARBOR_URL}/${env.HARBOR_PROJECT}/frontend:${env.IMAGE_VERSION}"
                }
            }
        }
        
        stage('Deploy') {
            steps {
                // 将 IMAGE_VERSION 传递给 docker-compose
                sh """
                    export IMAGE_TAG=${env.IMAGE_VERSION}
                    docker-compose up -d --build
                """
            }
        }
    }
    
    post {
        always {
            script {
                try {
                    sh "docker logout ${env.HARBOR_URL}"
                } catch (e) {
                    echo "Docker logout failed or not logged in."
                }
            }
        }
        success {
            echo "CI/CD 部署成功！版本: ${env.IMAGE_VERSION}"
        }
        failure {
            echo "CI/CD 部署失败，请检查 Jenkins 凭据和 Harbor 状态。"
        }
    }
}
