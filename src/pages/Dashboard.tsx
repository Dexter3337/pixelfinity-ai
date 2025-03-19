
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { BarChart, ImageIcon, Settings, Upload } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user, profile, subscription, refreshUserData } = useAuth();
  const [recentImages, setRecentImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchRecentImages = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("enhanced_images")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);
          
        if (error) throw error;
        setRecentImages(data || []);
      } catch (error) {
        console.error("Error fetching recent images:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentImages();
  }, [user]);
  
  // Format the expiry date
  const formatExpiryDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  
  // Get the avatar initials from email
  const getInitials = (email: string) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };
  
  // Get plan color
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "pro": return "text-blue-500 bg-blue-100";
      case "unlimited": return "text-purple-500 bg-purple-100";
      default: return "text-gray-500 bg-gray-100";
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="heading-2 mb-2">User Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your account and view your enhancement history
              </p>
            </div>
            
            <Button asChild className="rounded-full">
              <Link to="/enhance">
                <Upload className="mr-2 h-4 w-4" />
                Enhance New Image
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* User Profile Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {getInitials(profile?.email)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="text-xl font-semibold">{profile?.username || user?.email}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
                  
                  <div className="w-full mt-2">
                    <Button variant="outline" className="w-full text-sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Subscription Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Current Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Plan</span>
                    <Badge variant="outline" className={`font-medium capitalize ${getPlanColor(subscription?.plan)}`}>
                      {subscription?.plan || "Free"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={subscription?.status === "active" ? "default" : "destructive"} className="capitalize">
                      {subscription?.status || "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Renewal Date</span>
                    <span className="text-sm font-medium">
                      {subscription?.expiry_date ? formatExpiryDate(subscription.expiry_date) : "N/A"}
                    </span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="font-semibold mb-2">Enhancements Remaining</p>
                    <div className="bg-gray-100 rounded-full h-3 mb-2">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${(subscription?.remaining_enhancements / (subscription?.plan === "unlimited" ? 100 : 10)) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {subscription?.plan === "unlimited" 
                        ? "Unlimited enhancements" 
                        : `${subscription?.remaining_enhancements || 0} enhancements remaining`}
                    </p>
                  </div>
                  
                  {subscription?.plan === "free" && (
                    <Button asChild className="w-full mt-2">
                      <Link to="/pricing">Upgrade Plan</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Stats Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <ImageIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Total Images Enhanced</p>
                      <p className="text-2xl font-semibold">{recentImages.length}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <BarChart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Max File Size</p>
                      <p className="text-2xl font-semibold">{subscription?.max_file_size || 5} MB</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Link to="/gallery" className="text-primary hover:underline text-sm flex items-center">
                      View all enhanced images
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Enhancements */}
          <h2 className="heading-3 mb-4">Recent Enhancements</h2>
          <Card>
            <CardContent className="p-0">
              {recentImages.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Enhancement Type</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentImages.map((image) => (
                      <TableRow key={image.id}>
                        <TableCell className="font-medium">
                          {new Date(image.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="capitalize">{image.enhancement_type}</TableCell>
                        <TableCell className="capitalize">{image.quality}</TableCell>
                        <TableCell>
                          <div className="h-10 w-10 rounded overflow-hidden bg-gray-100">
                            <img 
                              src={image.enhanced_url} 
                              alt="Enhanced" 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={image.enhanced_url} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No images yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    You haven't enhanced any images yet. Start by enhancing your first image.
                  </p>
                  <Button asChild>
                    <Link to="/enhance">Enhance Your First Image</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
