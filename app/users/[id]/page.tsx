"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, Input, Table } from "antd";

interface ProfileRow {
  key: string;
  attribute: string;
  value: string | null;
}

const Profile: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const apiService = useApi();
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { value: loggedInUserId } =
    useLocalStorage<string>("userId", "");
  const userId = params.id as string;
  const isOwnProfile = loggedInUserId === userId;
  const [editingPassword, setEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handleChangePassword = async () => {
    try {
      await apiService.put(`/users/${userId}`, {
        password: newPassword,
      });

      await apiService.post<void>(`/logout/${userId}`, {});

      localStorage.removeItem("userId");
      router.push("/login");
    } catch (error) {
      alert("Failed to change password");
    }
  };


  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!loggedInUserId) {
      router.push("/login");
    }
  }, [hydrated, loggedInUserId, router]);



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
          value: user.creationDate
            ? new Date(user.creationDate).toLocaleDateString()
            : "(unknown)",
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
              showHeader={false}
              columns={[
                {
                  dataIndex: "attribute",
                  key: "attribute",
                },
                {
                  dataIndex: "value",
                  key: "value",
                },
              ]}
              dataSource={profileData}
              pagination={false}
              rowKey="key"
            />

            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <Button type="primary" onClick={() => router.push("/users")}>
                Back
              </Button>
              {isOwnProfile && (
                <Button onClick={() => setEditingPassword(true)}>
                  Change Password
                </Button>
              )}
            </div>
            {editingPassword && (
              <div style={{ marginTop: "16px" }}>
                <Input.Password
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ maxWidth: "300px", marginBottom: "8px" }}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    type="primary"
                    onClick={handleChangePassword}
                    disabled={!newPassword}
                  >
                    Save
                  </Button>
                  <Button onClick={() => setEditingPassword(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default Profile;
