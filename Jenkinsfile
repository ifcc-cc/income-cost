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
                script {
                    // 强制清理旧的登录信息并重新登录
                    sh 'docker logout ${HARBOR_URL} || true'
                    sh 'echo "${HARBOR_LOGIN_PSW}" | docker login "${HARBOR_URL}" -u "${HARBOR_LOGIN_USR}" --password-stdin'
                }
            }
        }
        
        stage('Build & Push Backend') {
            steps {
                dir('server') {
                    script {
                        def imageTag = "${env.HARBOR_URL}/${env.HARBOR_PROJECT}/backend:${env.IMAGE_VERSION}"
                        sh "docker build -t ${imageTag} ."
                        sh "docker push ${imageTag}"
                    }
                }
            }
        }
        
        stage('Build & Push Frontend') {
            steps {
                dir('expense-tracker') {
                    script {
                        def imageTag = "${env.HARBOR_URL}/${env.HARBOR_PROJECT}/frontend:${env.IMAGE_VERSION}"
                        sh "docker build -t ${imageTag} ."
                        sh "docker push ${imageTag}"
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                // 使用 docker-compose
                sh "docker-compose up -d --build"
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
