"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, User, Briefcase, GraduationCap, Code, Palette, Megaphone, Users,
  TrendingUp, Heart, Lightbulb, Target, Globe, Zap, Coffee
} from "lucide-react";
import Link from "next/link";

const UserTypeSelection = ({ onComplete }) => {
  const { user } = useUser();
  const userId = user?.id;
  const [selectedTypes, setSelectedTypes] = useState([]);

  const userTypes = [
    { id: "entrepreneur", label: "Entrepreneur", icon: TrendingUp, color: "bg-blue-100 text-blue-700 border-blue-200" },
    { id: "developer", label: "Developer", icon: Code, color: "bg-green-100 text-green-700 border-green-200" },
    { id: "designer", label: "Designer", icon: Palette, color: "bg-purple-100 text-purple-700 border-purple-200" },
    { id: "marketer", label: "Marketer", icon: Megaphone, color: "bg-orange-100 text-orange-700 border-orange-200" },
    { id: "student", label: "Student", icon: GraduationCap, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    { id: "manager", label: "Manager", icon: Users, color: "bg-red-100 text-red-700 border-red-200" },
    { id: "freelancer", label: "Freelancer", icon: User, color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    { id: "consultant", label: "Consultant", icon: Briefcase, color: "bg-teal-100 text-teal-700 border-teal-200" },
    { id: "creative", label: "Creative", icon: Lightbulb, color: "bg-pink-100 text-pink-700 border-pink-200" },
    { id: "leader", label: "Leader", icon: Target, color: "bg-slate-100 text-slate-700 border-slate-200" },
    { id: "networker", label: "Networker", icon: Globe, color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
    { id: "innovator", label: "Innovator", icon: Zap, color: "bg-violet-100 text-violet-700 border-violet-200" },
    { id: "mentor", label: "Mentor", icon: Heart, color: "bg-rose-100 text-rose-700 border-rose-200" },
    { id: "hustler", label: "Hustler", icon: Coffee, color: "bg-amber-100 text-amber-700 border-amber-200" }
  ];

  const handleTypeToggle = (typeId) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : prev.length < 5
        ? [...prev, typeId]
        : prev
    );
  };

  const handleContinue = async () => {
    try {
      const res = await fetch("/api/user-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userTypes: selectedTypes }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (onComplete) onComplete(selectedTypes);
    } catch (err) {
      console.error("Failed to save user types:", err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">What describes you best?</CardTitle>
          <CardDescription className="text-lg">
            Select up to 5 types that represent who you are professionally
          </CardDescription>
          <div className="flex justify-center mt-4">
            <Badge variant="outline" className="text-sm">
              {selectedTypes.length}/5 selected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userTypes.map((type) => {
              const isSelected = selectedTypes.includes(type.id);
              const Icon = type.icon;

              return (
                <div
                  key={type.id}
                  onClick={() => handleTypeToggle(type.id)}
                  className={`relative cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105
                    ${isSelected ? `${type.color} border-current shadow-md` : "bg-white border-gray-200 hover:border-gray-300"}
                    ${selectedTypes.length >= 5 && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isSelected && (
                    <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-current" />
                  )}
                  <div className="flex flex-col items-center space-y-2">
                    <Icon className={`h-8 w-8 ${isSelected ? "text-current" : "text-gray-600"}`} />
                    <span className={`font-medium text-sm ${isSelected ? "text-current" : "text-gray-700"}`}>
                      {type.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedTypes.length > 0 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-3">Your Selection:</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedTypes.map((typeId) => {
                    const type = userTypes.find((t) => t.id === typeId);
                    return (
                      <Badge key={typeId} variant="secondary" className="text-sm">
                        {type.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center">
                <Link href="/dashboard">
                  <Button onClick={handleContinue} size="lg" className="px-8">
                   Yes This Describes Me
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserTypeSelection;
