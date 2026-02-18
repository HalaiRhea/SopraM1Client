"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, Table } from "antd";

interface ProfileRow {
  key: string;
  attribute: string;
  value: string;
}

const Profile: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const apiService = useApi();
  const [user, setUser] = useState<User | null>(null);

  const userId = params.id as string;


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user: User = await apiService.get<User>(`/users/${userId}`);
        setUser(user);
      } catch (error) {
        alert("Failed to load user profile.");
      }
    };

    fetchUser();

    window.addEventListener("focus", fetchUser);
    return () => window.removeEventListener("focus", fetchUser);
  }, [apiService, userId]);


  const profileData: ProfileRow[] | null = user
    ? [
        {
          key: "username",
          attribute: "Username",
          value: user.username,
        },
        {
          key: "status",
          attribute: "Status",
          value: user.status,
        },
        {
          key: "creationDate",
          attribute: "Creation Date",
          value: new Date(user.creationDate).toLocaleDateString(),
        },
        {
          key: "bio",
          attribute: "Bio",
          value: user.bio || "(no bio provided)",
        },
      ]
    : null;

  return (
    <div className="card-container">
      <Card
        title="User Profile"
        loading={!user}
        className="profile-container"
      >
        {profileData && (
          <>
            <Table<ProfileRow>
              columns={[
                {
                  title: "Attribute",
                  dataIndex: "attribute",
                  key: "attribute",
                },
                {
                  title: "",
                  dataIndex: "value",
                  key: "value",
                },
              ]}
              dataSource={profileData}
              pagination={false}
              rowKey="key"
            />

            <Button
              type="primary"
              style={{ marginTop: "16px" }}
              onClick={() => router.push("/users")}
            >
              Back
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default Profile;
