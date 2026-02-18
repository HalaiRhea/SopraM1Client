"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import Link from "next/link";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";

interface LoginFormValues {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();

  const { set: setUserId } = useLocalStorage<string>("userId", "");
  const { set: setUsername } = useLocalStorage<string>("username", "");


  const handleLogin = async (values: LoginFormValues) => {
    try {
      const response = await apiService.post<User>("/login", values);

      if (response.id && response.username) {
        setUserId(response.id.toString());
        setUsername(response.username);
      }



      router.push("/users");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Login failed:\n${error.message}`);
      } else {
        console.error("Unknown login error.");
      }
    }
  };

  return (
    <div className="login-container">
      <Form
        form={form}
        name="login"
        size="large"
        variant="outlined"
        onFinish={handleLogin}
        layout="vertical"
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button">
            Login
          </Button>
        </Form.Item>

        <Form.Item>
          <span>
            Don&apos;t have an account?{" "}
            <Link href="/register">Register here</Link>
          </span>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
