import React from "react";
import { Link } from "react-router-dom";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, FolderKanban, Users, Lock, Globe, ArrowRight } from "lucide-react";

export default function WorkspacesPage() {
  const workspaces = [
    {
      id: 1,
      name: "Dự án Website",
      description: "Phát triển website cho khóa luận",
      progress: 65,
      members: 5,
      boards: 3,
      isPrivate: true,
      color: "bg-blue-500",
    },
    {
      id: 2,
      name: "Marketing Campaign",
      description: "Chiến dịch quảng bá sản phẩm mới",
      progress: 40,
      members: 3,
      boards: 2,
      isPrivate: false,
      color: "bg-orange-500",
    },
    {
      id: 3,
      name: "Mobile App",
      description: "Ứng dụng di động cho startup",
      progress: 85,
      members: 4,
      boards: 4,
      isPrivate: true,
      color: "bg-green-500",
    },
    {
      id: 4,
      name: "Research Project",
      description: "Nghiên cứu khoa học về AI",
      progress: 25,
      members: 6,
      boards: 2,
      isPrivate: true,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />

      <div className="flex-1 ml-64">
        <DashboardHeader />

        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
              <p className="text-muted-foreground mt-1">Quản lý tất cả các workspace của bạn</p>
            </div>
            <Button>
              <Link to="/workspaces/new" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Tạo workspace mới
              </Link>
            </Button>
          </div>

          {/* Workspaces List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <Card key={workspace.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg ${workspace.color} flex items-center justify-center`}>
                        <FolderKanban className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{workspace.name}</CardTitle>
                          <Badge variant={workspace.isPrivate ? "secondary" : "outline"} className="text-xs flex items-center gap-1">
                            {workspace.isPrivate ? (
                              <>
                                <Lock className="h-3 w-3" /> Private
                              </>
                            ) : (
                              <>
                                <Globe className="h-3 w-3" /> Public
                              </>
                            )}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">{workspace.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tiến độ</span>
                      <span className="font-medium">{workspace.progress}%</span>
                    </div>
                    <Progress value={workspace.progress} />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{workspace.boards} boards</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{workspace.members} thành viên</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full bg-transparent">
                    <Link to={`/workspaces/${workspace.id}`} className="flex items-center justify-center">
                      Mở workspace
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
