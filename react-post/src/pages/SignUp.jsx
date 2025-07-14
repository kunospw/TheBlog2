// src/pages/SignUp.jsx
import React, { useState } from 'react'; // Import useState
import { Form, Input, Button, message, Card, Typography, Upload } from 'antd'; // Import Upload
import { Link, useNavigate } from 'react-router-dom';
import { UploadOutlined } from '@ant-design/icons'; // Import UploadOutlined icon

const { Text } = Typography;

const Signup = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]); // State to manage uploaded files

  // Handle file changes for the Upload component
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('email', values.email);
      formData.append('password', values.password);

      // Append the profile image if one is selected
      if (fileList.length > 0) {
        formData.append('profileImage', fileList[0].originFileObj);
      }

      const res = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        // 'Content-Type': 'application/json' is NOT set when using FormData
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        message.success(data.message || 'Registration successful! Redirecting to login...');
        form.resetFields();
        setFileList([]); // Clear file list after successful upload
        navigate('/login');
      } else {
        message.error(data.message || 'Registration failed.');
      }
    } catch (error) {
      console.error("Signup error:", error);
      message.error('An error occurred during registration.');
    }
  };

  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-64px)]">
      <Card title="User Registration" className="w-full max-w-md shadow-lg rounded-lg">
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          scrollToFirstError
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Please input your username!' },
              { min: 3, message: 'Username must be at least 3 characters long!' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { type: 'email', message: 'The input is not valid E-mail!' },
              { required: true, message: 'Please input your E-mail!' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters long!' },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirm"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords that you entered do not match!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item label="Profile Photo (Optional)">
            <Upload
              listType="picture"
              maxCount={1}
              beforeUpload={() => false} // Prevent automatic upload
              onChange={handleFileChange}
              fileList={fileList}
              accept=".png,.jpeg,.jpg"
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Register
            </Button>
          </Form.Item>
        </Form>
        <div className="mt-4 text-center">
          <Text type="secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-700 font-semibold">
              Log in!
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Signup;