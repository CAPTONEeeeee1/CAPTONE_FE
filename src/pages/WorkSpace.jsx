import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import workspaceService from "@/services/workspaceService";
import { DashboardSidebar } from "@/components/layout/dashboardSideBar";
import { DashboardHeader } from "@/components/layout/dashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FolderKanban, Lock, Globe, ArrowRight, AlertCircle } from "lucide-react";

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setIsLoading(true);
      const response = await workspaceService.getAll();
      setWorkspaces(response.workspaces || []);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      toast.error("Không thể tải danh sách workspace");
      setWorkspaces([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getWorkspaceColor = (id) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index = id ? parseInt(id.slice(-1), 16) % colors.length : 0;
    return colors[index];
  };

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
              <Link to="/workspaces/create" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Tạo workspace mới
              </Link>
            </Button>
          </div>

          {/* Workspaces List */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : workspaces.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có workspace nào</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Tạo workspace đầu tiên để bắt đầu quản lý dự án của bạn
                </p>
                <Button asChild>
                  <Link to="/workspaces/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo workspace mới
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((workspace) => (
                <Card key={workspace.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg ${getWorkspaceColor(workspace.id)} flex items-center justify-center flex-shrink-0`}
                      >
                        <FolderKanban className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg truncate">{workspace.name}</CardTitle>
                          <Badge
                            variant={workspace.visibility === "private" ? "secondary" : "outline"}
                            className="text-xs flex items-center gap-1 flex-shrink-0"
                          >
                            {workspace.visibility === "private" ? (
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
                        <CardDescription className="text-sm line-clamp-2">
                          {workspace.description || "Không có mô tả"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link to={`/workspaces/${workspace.id}`}>
                        Mở workspace
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
