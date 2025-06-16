import React from 'react'
import { Form, Input, Button, Card, message, Divider } from 'antd'
import { UserOutlined, LockOutlined, GoogleOutlined, GithubOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { login } from '../store/authSlice'
import { LoginRequest } from '../types'
import styled from 'styled-components'

const PageContainer = styled.div`
  min-height: calc(100vh - 64px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  .ant-card-head {
    text-align: center;
    border-bottom: none;
    padding-bottom: 0;
  }
  
  .ant-card-head-title {
    font-size: 24px;
    font-weight: bold;
    color: #1890ff;
  }
`

const StyledForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 20px;
  }
  
  .ant-input-affix-wrapper {
    height: 48px;
    border-radius: 8px;
  }
  
  .ant-btn {
    height: 48px;
    border-radius: 8px;
    font-weight: 500;
  }
`

const SocialButton = styled(Button)`
  height: 44px;
  border-radius: 8px;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const FooterText = styled.div`
  text-align: center;
  color: #666;
  margin-top: 20px;
  
  a {
    color: #1890ff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isLoading } = useSelector((state: RootState) => state.auth)

  const handleLogin = async (values: LoginRequest) => {
    try {
      // @ts-ignore
      const result = await dispatch(login(values))
      if (login.fulfilled.match(result)) {
        message.success('登录成功！')
        navigate('/')
      } else {
        message.error(result.payload as string || '登录失败')
      }
    } catch (error) {
      message.error('登录失败，请重试')
    }
  }

  const handleSocialLogin = (provider: string) => {
    message.info(`${provider} 登录功能开发中...`)
  }

  return (
    <PageContainer>
      <LoginCard title="用户登录">
        <StyledForm
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="邮箱地址"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位字符' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
            >
              {isLoading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>
        </StyledForm>

        <Divider>或</Divider>

        <div>
          <SocialButton
            block
            icon={<GoogleOutlined />}
            onClick={() => handleSocialLogin('Google')}
          >
            使用 Google 登录
          </SocialButton>
          <SocialButton
            block
            icon={<GithubOutlined />}
            onClick={() => handleSocialLogin('GitHub')}
          >
            使用 GitHub 登录
          </SocialButton>
        </div>

        <FooterText>
          还没有账号？ <Link to="/register">立即注册</Link>
        </FooterText>

        <FooterText style={{ marginTop: 12 }}>
          <Link to="/">以游客身份继续</Link>
        </FooterText>
      </LoginCard>
    </PageContainer>
  )
}

export default LoginPage 