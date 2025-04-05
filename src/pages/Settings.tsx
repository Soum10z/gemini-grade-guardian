
import { NavBar } from "@/components/NavBar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-pro");

  const handleSaveAPI = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }
    
    // Save API key logic would go here
    toast.success("API settings saved successfully");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-2 mb-8">
          <SettingsIcon className="h-6 w-6 text-education-blue" />
          <h1 className="text-3xl font-bold text-education-dark">Settings</h1>
        </div>
        
        <Tabs defaultValue="api" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="api">API Configuration</TabsTrigger>
            <TabsTrigger value="grading">Grading Settings</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>Gemini API Settings</CardTitle>
                <CardDescription>
                  Configure your Gemini API integration for assignment grading and feedback.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Gemini API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your Gemini API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    Get your API key from <a href="https://ai.google.dev/" className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">Google AI Studio</a>
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Model Selection</Label>
                  <RadioGroup value={model} onValueChange={setModel}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gemini-pro" id="gemini-pro" />
                      <Label htmlFor="gemini-pro">Gemini Pro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gemini-ultra" id="gemini-ultra" />
                      <Label htmlFor="gemini-ultra">Gemini Ultra (Premium)</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Separator />
                
                <Button onClick={handleSaveAPI} className="bg-education-blue hover:bg-blue-700">
                  Save API Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="grading">
            <Card>
              <CardHeader>
                <CardTitle>Grading Configuration</CardTitle>
                <CardDescription>
                  Customize how the AI grades assignments and provides feedback.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Grading settings will be available in a future update.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and profile information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Account settings will be available in a future update.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
