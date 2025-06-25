"use client"
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Sample data - replace with your actual data
const jobData = [
  { name: 'Jan', posted: 12, applied: 45, interviews: 8 },
  { name: 'Feb', posted: 19, applied: 52, interviews: 10 },
  { name: 'Mar', posted: 15, applied: 48, interviews: 9 },
  { name: 'Apr', posted: 22, applied: 68, interviews: 14 },
  { name: 'May', posted: 28, applied: 75, interviews: 18 },
  { name: 'Jun', posted: 20, applied: 62, interviews: 12 },
];

const userData = [
  { name: 'Students', value: 542 },
  { name: 'Recruiters', value: 128 },
  { name: 'Admins', value: 5 },
];

const statusData = [
  { name: 'Pending', value: 24 },
  { name: 'Approved', value: 156 },
  { name: 'Rejected', value: 18 },
];

const recentJobs = [
  { id: '1', title: 'Frontend Developer', company: 'Tech Corp', posted: '2 days ago', status: 'active' },
  { id: '2', title: 'Data Scientist', company: 'Analytics Inc', posted: '1 week ago', status: 'active' },
  { id: '3', title: 'UX Designer', company: 'Creative Studio', posted: '3 days ago', status: 'in review' },
  { id: '4', title: 'Backend Engineer', company: 'Server Solutions', posted: '5 days ago', status: 'active' },
];

const recentUsers = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', role: 'student', joined: 'Today' },
  { id: '2', name: 'Sarah Williams', email: 'sarah@example.com', role: 'recruiter', joined: 'Yesterday' },
  { id: '3', name: 'Michael Chen', email: 'michael@example.com', role: 'student', joined: '2 days ago' },
  { id: '4', name: 'Emma Davis', email: 'emma@example.com', role: 'recruiter', joined: '3 days ago' },
];

const activityData = [
  { name: '12 AM', activity: 0 },
  { name: '3 AM', activity: 0 },
  { name: '6 AM', activity: 5 },
  { name: '9 AM', activity: 25 },
  { name: '12 PM', activity: 42 },
  { name: '3 PM', activity: 38 },
  { name: '6 PM', activity: 28 },
  { name: '9 PM', activity: 15 },
];

const AnalyticsDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Dashboard Analytics</h1>
        <div className="flex space-x-2">
          <Button variant="outline">Last Week</Button>
          <Button variant="outline">Last Month</Button>
          <Button>Last Quarter</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">675</div>
            <p className="text-xs text-muted-foreground">+12.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Listings</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M8 21V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14m-6 0H6a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2Z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M21.5 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              <path d="M12 8v4l3 3" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">310</div>
            <p className="text-xs text-muted-foreground">+18.4% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+5.3% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Job Activity</CardTitle>
            <CardDescription>Job postings, applications, and interviews over time</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={jobData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="posted" fill="#3b82f6" name="Posted" radius={[4, 4, 0, 0]} />
                <Bar dataKey="applied" fill="#22c55e" name="Applied" radius={[4, 4, 0, 0]} />
                <Bar dataKey="interviews" fill="#f59e0b" name="Interviews" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Breakdown of user types in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {userData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Job Listings</CardTitle>
            <CardDescription>The most recently posted jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div>
                    <h4 className="font-medium">{job.title}</h4>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{job.posted}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>New users who joined recently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <Avatar className="h-9 w-9 mr-3">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{user.name}</h4>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.role === 'student' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{user.joined}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
            <CardDescription>User activity throughout the day</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="activity" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>Current status of job applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;