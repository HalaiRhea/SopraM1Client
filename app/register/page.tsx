"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";
import Link from "next/link";

interface RegisterFormValues {
  username: string;
  password: string;
  bio?: string;
}

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();

  const { set: setToken } = useLocalStorage<string>("token", "");
  const handleRegister = async (values: RegisterFormValues) => {
    try {
      const response = await apiService.post<User>("/users", {
            username: values.username,
            password: values.password,
            bio: values.bio ?? "",
        });


      if (response.token) {
        setToken(response.token);
      }

      router.push("/users");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Registration failed:\n${error.message}`);
      } else {
        console.error("Unknown registration error.");
      }
    }
  };

  return (
    <div className="login-container">
      <Form
        form={form}
        name="register"
        size="large"
        variant="outlined"
        onFinish={handleRegister}
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

        <Form.Item
          name="bio"
          label="Bio"
          rules={[{ required: false }]}
        >
          <Input.TextArea
            placeholder="Tell us something about yourself (optional)"
            rows={3}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button">
            Sign up
          </Button>
        </Form.Item>
        <Form.Item>
          <span>
            Already have an account?{" "}
            <Link href="/login">Log in Here</Link>
          </span>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
