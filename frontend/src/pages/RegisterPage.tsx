import React from 'react'
import { Form, Input, Button, Card, message, Divider, Checkbox } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, GoogleOutlined, GithubOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { register } from '../store/authSlice'
import { RegisterRequest } from '../types'
import styled from 'styled-components'

const PageContainer = styled.div`
  min-height: calc(100vh - 64px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`

const RegisterCard = styled(Card)`
  width: 100%;
  max-width: 450px;
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
    margin-bottom: 16px;
  }
  
  .ant-input-affix-wrapper {
    height: 44px;
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

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isLoading } = useSelector((state: RootState) => state.auth)

  const handleRegister = async (values: RegisterRequest & { confirm: string; agreement: boolean }) => {
    if (values.password !== values.confirm) {
      message.error('两次输入的密码不一致')
      return
    }

    if (!values.agreement) {
      message.error('请先同意用户协议和隐私政策')
      return
    }

    try {
      const registerData = {
        username: values.username,
        email: values.email,
        password: values.password,
      }
      
      // @ts-ignore
      const result = await dispatch(register(registerData))
      if (register.fulfilled.match(result)) {
        message.success('注册成功！欢迎加入游戏平台')
        navigate('/')
      } else {
        message.error(result.payload as string || '注册失败')
      }
    } catch (error) {
      message.error('注册失败，请重试')
    }
  }

  const handleSocialRegister = (provider: string) => {
    message.info(`${provider} 注册功能开发中...`)
  }

  return (
    <PageContainer>
      <RegisterCard title="用户注册">
        <StyledForm
          name="register"
          onFinish={handleRegister}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
              { max: 20, message: '用户名最多20个字符' },
              { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '用户名只能包含字母、数字、下划线和中文' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="邮箱地址"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位字符' },
              { pattern: /^(?=.*[a-zA-Z])(?=.*\d)/, message: '密码必须包含字母和数字' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            rules={[
              { required: true, message: '请确认密码' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              { required: true, message: '请同意用户协议和隐私政策' }
            ]}
          >
            <Checkbox>
              我已阅读并同意 <a href="/terms" target="_blank">用户协议</a> 和 <a href="/privacy" target="_blank">隐私政策</a>
            </Checkbox>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
            >
              {isLoading ? '注册中...' : '注册'}
            </Button>
          </Form.Item>
        </StyledForm>

        <Divider>或</Divider>

        <div>
          <SocialButton
            block
            icon={<GoogleOutlined />}
            onClick={() => handleSocialRegister('Google')}
          >
            使用 Google 注册
          </SocialButton>
          <SocialButton
            block
            icon={<GithubOutlined />}
            onClick={() => handleSocialRegister('GitHub')}
          >
            使用 GitHub 注册
          </SocialButton>
        </div>

        <FooterText>
          已有账号？ <Link to="/login">立即登录</Link>
        </FooterText>
      </RegisterCard>
    </PageContainer>
  )
}

export default RegisterPage 